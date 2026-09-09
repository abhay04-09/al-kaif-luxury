import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './env';
import { getDb, rowToProduct, productToRow, rowToOrder, rowToCategory, buildCategoryTree } from './lib/db';
import { hashPassword, verifyPassword } from './lib/passwords';
import { createToken, requireAdmin, requireAuth, optionalAuth, currentUser } from './lib/auth';
import {
  createRazorpayOrder,
  fetchRazorpayPayment,
  verifyRazorpaySignature,
  verifyWebhookSignature,
} from './lib/razorpay';
import { sendOrderEmails } from './lib/email';
import { getShippingSettings, saveShippingSettings } from './lib/settings';
import { quoteShipping } from './lib/shipping';
import {
  cancelShipment,
  getQuotes,
  isShipmozoConfigured,
  pushOrder,
  schedulePickup,
  trackByAwb,
} from './lib/shipmozo';
import { SEED_PRODUCTS } from './data/seedProducts';

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({ origin: '*', allowHeaders: ['Content-Type', 'Authorization'] }));

/**
 * A problem with what the client is trying to buy, rather than a fault of ours:
 * an empty bag, a piece withdrawn from sale, more asked for than exists. The
 * client can act on these, so the reason is told to them plainly.
 */
class CartError extends Error {}

app.onError((err, c) => {
  if (err instanceof CartError) {
    return c.json({ error: err.message }, 400);
  }
  console.error('API error:', err);
  // Admin routes get the real reason — a generic message makes a broken save
  // impossible to diagnose from the panel.
  const detail = c.req.header('Authorization') ? err.message : undefined;
  return c.json({ error: detail || 'Something went wrong on the server' }, 500);
});

// ---------------------------------------------------------------- health

app.get('/api/health', c =>
  c.json({ status: 'ok', brand: 'AL-KAIFF', timestamp: new Date().toISOString() })
);

// ---------------------------------------------------------------- auth

app.post('/api/auth/register', async c => {
  const { name, email, password, phone } = await c.req.json();
  if (!name || !email || !password) return c.json({ error: 'Name, email and password are required' }, 400);
  if (String(password).length < 8) return c.json({ error: 'Password must be at least 8 characters' }, 400);

  const db = getDb(c.env);
  const normalizedEmail = String(email).trim().toLowerCase();
  const { data: existing } = await db.from('users').select('id').eq('email', normalizedEmail).maybeSingle();
  if (existing) return c.json({ error: 'An account with this email already exists' }, 409);

  const { data: user, error } = await db
    .from('users')
    .insert({
      name: String(name).trim(),
      email: normalizedEmail,
      phone: phone ?? null,
      password_hash: await hashPassword(String(password)),
      role: 'customer',
    })
    .select('id, name, email, phone, role, avatar, address')
    .single();
  if (error || !user) throw new Error(error?.message ?? 'Insert failed');

  const token = await createToken(user, c.env.JWT_SECRET);
  return c.json({ user, token }, 201);
});

app.post('/api/auth/login', async c => {
  const { email, password } = await c.req.json();
  if (!email || !password) return c.json({ error: 'Email and password are required' }, 400);

  const db = getDb(c.env);
  const { data: user } = await db
    .from('users')
    .select('id, name, email, phone, role, avatar, address, password_hash')
    .eq('email', String(email).trim().toLowerCase())
    .maybeSingle();

  if (!user || !(await verifyPassword(String(password), user.password_hash))) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  const { password_hash: _ph, ...safeUser } = user;
  const token = await createToken(safeUser, c.env.JWT_SECRET);
  return c.json({ user: safeUser, token });
});

app.post('/api/auth/google', async c => {
  const { accessToken } = await c.req.json();
  if (!accessToken) return c.json({ error: 'Missing Google sign-in token' }, 400);

  // The browser could send us any email it likes, so the token is verified with
  // Supabase before it is trusted. Only what Supabase returns is used.
  const res = await fetch(`${c.env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: c.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  });
  if (!res.ok) return c.json({ error: 'Google sign-in could not be verified' }, 401);

  const profile: any = await res.json();
  const email = String(profile?.email ?? '').trim().toLowerCase();
  if (!email) return c.json({ error: 'Google account has no email address' }, 400);

  const meta = profile.user_metadata ?? {};
  const db = getDb(c.env);

  // An existing account keeps its row — and its role — so signing in with Google
  // can never quietly hand someone a fresh customer account they already had, or
  // strip an administrator of their access.
  const { data: existing } = await db
    .from('users')
    .select('id, name, email, phone, role, avatar, address')
    .eq('email', email)
    .maybeSingle();

  let user = existing;
  if (!user) {
    const { data: created, error } = await db
      .from('users')
      .insert({
        name: String(meta.full_name ?? meta.name ?? email.split('@')[0]).trim(),
        email,
        avatar: meta.avatar_url ?? meta.picture ?? null,
        role: 'customer',
      })
      .select('id, name, email, phone, role, avatar, address')
      .single();
    if (error || !created) throw new Error(error?.message ?? 'Could not create the account');
    user = created;
  }

  const token = await createToken(user, c.env.JWT_SECRET);
  return c.json({ user, token });
});

app.post('/api/auth/phone', async c => {
  const { accessToken, name } = await c.req.json();
  if (!accessToken) return c.json({ error: 'Missing sign-in token' }, 400);

  // The browser could claim any number it likes, so the token is verified with
  // Supabase and only the number Supabase confirms is trusted.
  const res = await fetch(`${c.env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: c.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  });
  if (!res.ok) return c.json({ error: 'Mobile sign-in could not be verified' }, 401);

  const profile: any = await res.json();
  const phone = String(profile?.phone ?? '').replace(/\D/g, '');
  if (!phone) return c.json({ error: 'That sign-in carried no mobile number' }, 400);

  const e164 = `+${phone}`;
  const national = phone.slice(-10);
  const db = getDb(c.env);

  // Numbers already on file were typed by hand and may be stored without the
  // country code, so an existing client is matched on the last ten digits
  // rather than being handed a second, empty account.
  const { data: candidates } = await db
    .from('users')
    .select('id, name, email, phone, role, avatar, address')
    .ilike('phone', `%${national}`);

  let user = (candidates ?? []).find(
    row => String(row.phone ?? '').replace(/\D/g, '').slice(-10) === national
  );

  if (user) {
    // Settle the number into a single canonical form now that it is verified.
    if (user.phone !== e164) {
      await db.from('users').update({ phone: e164 }).eq('id', user.id);
      user = { ...user, phone: e164 };
    }
  } else {
    const { data: created, error } = await db
      .from('users')
      .insert({
        name: String(name ?? '').trim() || `Client ${national.slice(-4)}`,
        phone: e164,
        role: 'customer',
      })
      .select('id, name, email, phone, role, avatar, address')
      .single();
    if (error || !created) throw new Error(error?.message ?? 'Could not create the account');
    user = created;
  }

  const token = await createToken(user, c.env.JWT_SECRET);
  return c.json({ user, token });
});

app.put('/api/auth/me', requireAuth, async c => {
  const payload = currentUser(c)!;
  const { name, phone, address } = await c.req.json();

  const patch: Record<string, unknown> = {};
  if (name !== undefined) {
    const trimmed = String(name).trim();
    if (!trimmed) return c.json({ error: 'A name is required' }, 400);
    patch.name = trimmed;
  }
  if (address !== undefined) patch.address = String(address).trim() || null;
  if (phone !== undefined) {
    const digits = String(phone).replace(/\D/g, '');
    if (!digits) {
      patch.phone = null;
    } else if (digits.length < 10) {
      return c.json({ error: 'That mobile number looks too short' }, 400);
    } else {
      // Numbers verified by OTP are stored in E.164; keeping one shape means a
      // client cannot end up with two accounts for the same number.
      patch.phone = `+${digits.length === 10 ? `91${digits}` : digits}`;
    }
  }

  if (Object.keys(patch).length === 0) return c.json({ error: 'Nothing to update' }, 400);

  const db = getDb(c.env);

  // The unique index compares stored text, and a number written '8347016843'
  // by hand is the same number as '+918347016843' from an OTP. Matching on the
  // last ten digits is what actually stops one person holding two accounts.
  if (typeof patch.phone === 'string') {
    const national = patch.phone.replace(/\D/g, '').slice(-10);
    const { data: clashes } = await db
      .from('users')
      .select('id, phone')
      .ilike('phone', `%${national}`);
    const taken = (clashes ?? []).some(
      row =>
        row.id !== payload.sub &&
        String(row.phone ?? '').replace(/\D/g, '').slice(-10) === national
    );
    if (taken) {
      return c.json({ error: 'That mobile number is already on another account' }, 409);
    }
  }

  const { data: user, error } = await db
    .from('users')
    .update(patch)
    .eq('id', payload.sub)
    .select('id, name, email, phone, role, avatar, address')
    .single();

  // 23505: the unique index on phone — that number is already on another account.
  if (error?.code === '23505') {
    return c.json({ error: 'That mobile number is already on another account' }, 409);
  }
  if (error || !user) throw new Error(error?.message ?? 'Could not save your details');

  return c.json({ user });
});

app.get('/api/auth/me', optionalAuth, async c => {
  const payload = currentUser(c);
  if (!payload) return c.json({ user: null });
  const db = getDb(c.env);
  const { data: user } = await db
    .from('users')
    .select('id, name, email, phone, role, avatar, address')
    .eq('id', payload.sub)
    .maybeSingle();
  return c.json({ user: user ?? null });
});

// ---------------------------------------------------------------- products

app.get('/api/products', async c => {
  const { category, subcategory, search, featured, newArrival, archived } = c.req.query();
  const db = getDb(c.env);
  const wantArchived = archived === 'true';

  const build = (filterArchived: boolean) => {
    let query = db.from('products').select('*').order('created_at', { ascending: false });
    // Archived pieces are hidden everywhere unless they are what was asked for,
    // so the storefront never has to know the flag exists.
    if (filterArchived) query = query.eq('archived', wantArchived);
    if (category && category !== 'all') query = query.eq('category', category);
    if (subcategory) query = query.eq('subcategory', subcategory);
    if (featured === 'true') query = query.eq('featured', true);
    if (newArrival === 'true') query = query.eq('is_new_arrival', true);
    if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,subtitle.ilike.%${search}%`);
    return query;
  };

  let { data, error } = await build(true);

  // Migration 004 may not have run yet. Serving the catalogue unfiltered beats
  // failing the request outright, so fall back rather than take the shop down.
  if (error && /archived/i.test(error.message)) {
    if (wantArchived) return c.json([]);
    ({ data, error } = await build(false));
  }

  if (error) throw new Error(error.message);
  return c.json((data ?? []).map(rowToProduct));
});

app.get('/api/products/:id', async c => {
  const db = getDb(c.env);
  const { data } = await db.from('products').select('*').eq('id', c.req.param('id')).maybeSingle();
  // An archived piece stays gone even for someone holding an old link.
  if (!data || data.archived) return c.json({ error: 'Product not found' }, 404);
  return c.json(rowToProduct(data));
});

/**
 * Keeps the struck-through price honest.
 *
 * The database has a constraint, but a raw constraint violation reaches the
 * panel as a wall of Postgres, so the same rule is stated here in a sentence
 * the shop can act on. On an edit the selling price may not be in the patch, so
 * the stored one is fetched rather than assumed.
 */
async function assertMrpAbovePrice(
  db: ReturnType<typeof getDb>,
  row: Record<string, unknown>,
  productId?: string
): Promise<void> {
  if (row.mrp_inr === undefined || row.mrp_inr === null) return;
  const mrp = Number(row.mrp_inr);

  let price = row.price_inr === undefined ? NaN : Number(row.price_inr);
  if (Number.isNaN(price) && productId) {
    const { data } = await db
      .from('products')
      .select('price_inr')
      .eq('id', productId)
      .maybeSingle();
    price = Number(data?.price_inr ?? NaN);
  }
  if (Number.isNaN(price)) return;

  if (mrp <= price) {
    throw new CartError(
      `The MRP must be higher than the selling price. ₹${mrp} is not above ₹${price} — leave the MRP blank if this piece is not discounted.`
    );
  }
}

app.post('/api/products', requireAdmin, async c => {
  const body = await c.req.json();
  const db = getDb(c.env);
  const row = productToRow(body);
  row.id = body.id && String(body.id).startsWith('p-') ? body.id : `p-${Date.now()}`;
  if (!row.sku) row.sku = `ALK-NEW-${Math.floor(1000 + Math.random() * 9000)}`;
  // The form no longer collects a dollar price, but the column is NOT NULL on
  // databases created before migration 003.
  if (row.price_usd === undefined) row.price_usd = 0;
  await assertMrpAbovePrice(db, row);

  const { data, error } = await db.from('products').insert(row).select('*').single();
  if (error || !data) throw new Error(error?.message ?? 'Insert failed');
  return c.json(rowToProduct(data), 201);
});

app.put('/api/products/:id', requireAdmin, async c => {
  const body = await c.req.json();
  const db = getDb(c.env);
  const row = productToRow(body);
  delete row.id; // never change the primary key
  // Clearing the SKU field hands the code back to us, same as on create.
  if (row.sku !== undefined && !row.sku) row.sku = `ALK-NEW-${Math.floor(1000 + Math.random() * 9000)}`;
  await assertMrpAbovePrice(db, row, c.req.param('id'));
  const { data, error } = await db.from('products').update(row).eq('id', c.req.param('id')).select('*').maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return c.json({ error: 'Product not found' }, 404);
  return c.json(rowToProduct(data));
});

/** Archive or restore. Keeps the record and its order history intact. */
app.put('/api/products/:id/archive', requireAdmin, async c => {
  const { archived } = await c.req.json<{ archived?: boolean }>();
  const isArchiving = archived !== false;
  const db = getDb(c.env);

  const { data, error } = await db
    .from('products')
    .update({ archived: isArchiving, archived_at: isArchiving ? new Date().toISOString() : null })
    .eq('id', c.req.param('id'))
    .select('*')
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return c.json({ error: 'Product not found' }, 404);
  return c.json(rowToProduct(data));
});

app.delete('/api/products/:id', requireAdmin, async c => {
  const db = getDb(c.env);
  const { data, error } = await db.from('products').delete().eq('id', c.req.param('id')).select('id').maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return c.json({ error: 'Product not found' }, 404);
  return c.json({ message: 'Product deleted', id: data.id });
});

// ---------------------------------------------------------------- categories

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

app.get('/api/categories', async c => {
  const db = getDb(c.env);
  const { data, error } = await db.from('categories').select('*');
  if (error) throw new Error(error.message);
  return c.json(buildCategoryTree(data ?? []));
});

app.post('/api/categories', requireAdmin, async c => {
  const { name, parentId } = await c.req.json();
  if (!name || !String(name).trim()) return c.json({ error: 'Category name is required' }, 400);

  const db = getDb(c.env);
  if (parentId) {
    const { data: parent } = await db.from('categories').select('id, parent_id').eq('id', parentId).maybeSingle();
    if (!parent) return c.json({ error: 'Parent category not found' }, 404);
    if (parent.parent_id) return c.json({ error: 'Only one level of sub-categories is supported' }, 400);
  }

  const id = slugify(String(name));
  if (!id) return c.json({ error: 'Category name must contain letters or numbers' }, 400);

  const { data, error } = await db
    .from('categories')
    .insert({ id, name: String(name).trim(), parent_id: parentId ?? null })
    .select('*')
    .single();
  if (error) {
    if (error.code === '23505') return c.json({ error: 'A category with this name already exists' }, 409);
    throw new Error(error.message);
  }
  return c.json(rowToCategory(data), 201);
});

app.put('/api/categories/:id', requireAdmin, async c => {
  const { name, sort } = await c.req.json();
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = String(name).trim();
  if (sort !== undefined) updates.sort = Number(sort) || 0;
  if (Object.keys(updates).length === 0) return c.json({ error: 'Nothing to update' }, 400);

  const db = getDb(c.env);
  const { data, error } = await db
    .from('categories')
    .update(updates)
    .eq('id', c.req.param('id'))
    .select('*')
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return c.json({ error: 'Category not found' }, 404);
  return c.json(rowToCategory(data));
});

app.delete('/api/categories/:id', requireAdmin, async c => {
  const db = getDb(c.env);
  // Sub-categories are removed automatically (ON DELETE CASCADE); products keep
  // their text value and simply show under "all" until reassigned.
  const { data, error } = await db.from('categories').delete().eq('id', c.req.param('id')).select('id').maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return c.json({ error: 'Category not found' }, 404);
  return c.json({ message: 'Category deleted', id: data.id });
});

// ---------------------------------------------------------------- orders

interface IncomingItem {
  productId: string;
  quantity: number;
  selectedMetal?: string;
  selectedSize?: string;
}

/** Recomputes all money amounts from DB prices so the client can't tamper with totals. */
/**
 * GST already contained in every catalogue price.
 *
 * 3% is the rate for jewellery. Perfume is taxed at 18%, so this becomes a
 * per-category rate the moment a perfume is listed for sale.
 */
const GST_RATE = 0.03;

async function priceItems(env: Env, items: IncomingItem[]) {
  if (!Array.isArray(items) || items.length === 0) throw new CartError('Cart is empty');
  const db = getDb(env);
  const ids = items.map(i => i.productId);
  const { data: rows, error } = await db.from('products').select('*').in('id', ids);
  if (error) throw new Error(error.message);
  const byId = new Map((rows ?? []).map(r => [r.id, rowToProduct(r)]));

  let subtotalINR = 0;
  let subtotalUSD = 0;
  const lines = items.map(i => {
    const product = byId.get(i.productId);
    if (!product) throw new CartError(`Product not found: ${i.productId}`);
    // A piece can sell out or be archived while it sits in someone's bag.
    if (product.archived) throw new CartError(`No longer available: ${product.name}`);
    if (!product.inStock) throw new CartError(`Out of stock: ${product.name}`);
    const quantity = Math.max(1, Math.min(50, Math.floor(Number(i.quantity) || 1)));
    // A counted piece cannot be sold beyond what is on the shelf. Pieces that
    // are not counted keep the old behaviour and rely on inStock alone.
    if (product.stockQuantity !== null && product.stockQuantity !== undefined) {
      if (product.stockQuantity < quantity) {
        throw new CartError(
          product.stockQuantity === 0
            ? `Out of stock: ${product.name}`
            : `Only ${product.stockQuantity} left of ${product.name}`
        );
      }
    }
    subtotalINR += product.priceINR * quantity;
    subtotalUSD += (product.priceUSD ?? 0) * quantity;
    return { product, quantity, selectedMetal: i.selectedMetal, selectedSize: i.selectedSize };
  });

  // Catalogue prices already include GST, so the listed sum is what the client
  // pays — tax is backed out of it for the invoice rather than added on top.
  // Charging 3% over a tax-inclusive price would overcharge every order.
  const taxINR = subtotalINR - Math.round(subtotalINR / (1 + GST_RATE));
  const taxUSD = subtotalUSD - Math.round(subtotalUSD / (1 + GST_RATE));
  return {
    lines,
    // The taxable value: what the maison earns, once GST is set aside.
    subtotalINR: subtotalINR - taxINR,
    taxINR,
    totalINR: subtotalINR,
    totalUSD: subtotalUSD,
  };
}

/** Pulls the pin code out of whichever shape the address arrived in. */
function pincodeOf(address: unknown): string | null {
  if (!address) return null;
  if (typeof address === 'object') {
    const value = String((address as Record<string, unknown>).pincode ?? '').replace(/\D/g, '');
    if (/^\d{6}$/.test(value)) return value;
  }
  // Older checkouts sent one line of text the client typed.
  const found = String(address).match(/\b(\d{6})\b/);
  return found ? found[1] : null;
}

/**
 * The goods, plus what it costs to get them there.
 *
 * Delivery is priced here, on the server, and never taken from the browser —
 * a shipping charge the client can edit is a shipping charge the client will
 * set to zero.
 */
async function priceOrder(
  env: Env,
  items: IncomingItem[],
  options: { address?: unknown; pincode?: string | null; cod: boolean }
) {
  const priced = await priceItems(env, items);
  const pieces = priced.lines.reduce((n, l) => n + l.quantity, 0);

  const quote = await quoteShipping(env, {
    pincode: options.pincode ?? pincodeOf(options.address),
    cod: options.cod,
    goodsINR: priced.totalINR,
    pieces,
  });

  return {
    ...priced,
    shippingINR: quote.shippingINR,
    codFeeINR: quote.codFeeINR,
    shippingSource: quote.source,
    courier: quote.courier,
    /** What the client actually pays. */
    grandTotalINR: priced.totalINR + quote.shippingINR + quote.codFeeINR,
  };
}

/**
 * What delivery will cost, asked before anything is bought.
 *
 * Public, because the checkout has to show a total before a client signs in.
 * It reveals only a price, and prices are on the shelf already.
 */
app.post('/api/shipping/quote', async c => {
  const body = await c.req.json<{
    items?: IncomingItem[];
    pincode?: string;
    paymentMethod?: string;
    goodsINR?: number;
  }>().catch(() => ({} as any));

  const cod = body.paymentMethod === 'COD';
  const settings = await getShippingSettings(c.env);

  // The cart is priced here when it is given, so the free-delivery threshold
  // cannot be reached by a browser claiming a larger basket than it has.
  let goodsINR = 0;
  let pieces = 1;
  if (Array.isArray(body.items) && body.items.length > 0) {
    try {
      const priced = await priceItems(c.env, body.items);
      goodsINR = priced.totalINR;
      pieces = priced.lines.reduce((n, l) => n + l.quantity, 0);
    } catch {
      // An unpriceable cart still deserves a delivery estimate.
      goodsINR = 0;
    }
  }

  const quote = await quoteShipping(c.env, {
    pincode: body.pincode,
    cod,
    goodsINR,
    pieces,
    settings,
  });

  return c.json({
    shippingINR: quote.shippingINR,
    codFeeINR: quote.codFeeINR,
    source: quote.source,
    courier: quote.courier ?? null,
    freeAboveINR: settings.freeAboveINR,
  });
});

app.get('/api/settings/shipping', requireAdmin, async c =>
  c.json(await getShippingSettings(c.env))
);

app.put('/api/settings/shipping', requireAdmin, async c => {
  const body = await c.req.json();
  return c.json(await saveShippingSettings(c.env, body));
});

app.get('/api/orders', optionalAuth, async c => {
  const user = currentUser(c);
  if (!user) return c.json({ error: 'Please sign in first' }, 401);

  const db = getDb(c.env);
  let query = db.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
  if (user.role !== 'admin') query = query.eq('user_id', user.sub);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return c.json((data ?? []).map(rowToOrder));
});

app.get('/api/orders/:orderNumber', requireAuth, async c => {
  const user = currentUser(c)!;
  const db = getDb(c.env);

  const { data, error } = await db
    .from('orders')
    .select('*, order_items(*)')
    .eq('order_number', c.req.param('orderNumber'))
    .maybeSingle();
  if (error) throw new Error(error.message);

  // An order number is guessable, so it is never enough on its own. Anyone but
  // an administrator is told the same thing whether the order is missing or
  // simply is not theirs — confirming it exists would be a leak in itself.
  if (!data || (user.role !== 'admin' && data.user_id !== user.sub)) {
    return c.json({ error: 'Order not found' }, 404);
  }

  return c.json(rowToOrder(data));
});

type PricedCart = Awaited<ReturnType<typeof priceItems>>;

interface OrderDraft {
  priced: PricedCart;
  /** What the client was quoted, not what the courier would say now. */
  shippingINR?: number;
  codFeeINR?: number;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: unknown;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid';
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  giftWrapped?: boolean;
  notes?: string | null;
}

/**
 * Writes an order and its lines.
 *
 * Shared by the browser's confirmation and by Razorpay's webhook, which race
 * each other whenever a payment succeeds. The unique index on
 * razorpay_payment_id decides which one wins; the loser is told 'duplicate'
 * rather than raising, because a second attempt at the same payment is the
 * system working, not a fault.
 */
/**
 * The next order number, counted out by the database.
 *
 * It used to be a random four-digit number on a unique column, which by about
 * a hundred and twenty orders was a coin flip to collide — and a collision was
 * read as a duplicate payment, so a paying client would have seen an error and
 * had no order recorded. A counter cannot collide.
 *
 * If the sequence cannot be reached the order still has to be written, so it
 * falls back to a timestamp-based number: ugly, but unique, and an ugly number
 * is better than a lost sale.
 */
async function nextOrderNumber(db: ReturnType<typeof getDb>): Promise<string> {
  const { data, error } = await db.rpc('next_order_number');
  if (error || !data) {
    console.error(`Order number sequence unavailable: ${error?.message}`);
    return `AK${Date.now().toString().slice(-8)}`;
  }
  return String(data);
}

/** True only for the unique index on razorpay_payment_id — the one that means
 *  "this payment is already an order", as opposed to any other clash. */
function isDuplicatePayment(err: any): boolean {
  if (err?.code !== '23505') return false;
  const text = `${err.message ?? ''} ${err.details ?? ''} ${err.hint ?? ''}`;
  return /razorpay_payment_id/.test(text);
}

async function writeOrder(env: Env, draft: OrderDraft) {
  const db = getDb(env);
  const id = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const orderNumber = await nextOrderNumber(db);
  const shippingINR = Math.max(0, Math.round(Number(draft.shippingINR) || 0));
  const codFeeINR = Math.max(0, Math.round(Number(draft.codFeeINR) || 0));

  const { data: orderRow, error: orderErr } = await db
    .from('orders')
    .insert({
      id,
      order_number: orderNumber,
      user_id: draft.userId,
      customer_name: draft.customerName,
      customer_email: draft.customerEmail,
      customer_phone: draft.customerPhone,
      shipping_address: draft.shippingAddress,
      subtotal_inr: draft.priced.subtotalINR,
      tax_inr: draft.priced.taxINR,
      discount_inr: 0,
      shipping_inr: shippingINR,
      cod_fee_inr: codFeeINR,
      // What was actually charged: the goods, the delivery, and the cash fee.
      total_inr: draft.priced.totalINR + shippingINR + codFeeINR,
      total_usd: draft.priced.totalUSD,
      payment_method: draft.paymentMethod,
      payment_status: draft.paymentStatus,
      order_status: 'Placed',
      razorpay_order_id: draft.razorpayOrderId,
      razorpay_payment_id: draft.razorpayPaymentId,
      gift_wrapped: !!draft.giftWrapped,
      notes: draft.notes ?? null,
    })
    .select('*')
    .single();

  // Only a repeat of the same payment is a duplicate. Any other unique clash is
  // a fault of ours and must be raised, not quietly reported to a paying client
  // as "this payment has already been used".
  if (isDuplicatePayment(orderErr)) return 'duplicate' as const;
  if (orderErr || !orderRow) throw new Error(orderErr?.message ?? 'Order insert failed');

  const { error: itemsErr } = await db.from('order_items').insert(
    draft.priced.lines.map(l => ({
      order_id: id,
      product_id: l.product.id,
      product_name: l.product.name,
      quantity: l.quantity,
      price_inr: l.product.priceINR,
      price_usd: l.product.priceUSD,
      image: l.product.image,
      selected_metal: l.selectedMetal ?? null,
      selected_size: l.selectedSize ?? null,
    }))
  );
  if (itemsErr) throw new Error(itemsErr.message);

  // Take the pieces off the shelf. The database settles this, not us: two
  // clients paying in the same second would otherwise both read the same count
  // and both write one less, selling the last piece twice.
  for (const line of draft.priced.lines) {
    const { data: taken, error: stockErr } = await db.rpc('decrement_stock', {
      p_product_id: line.product.id,
      p_quantity: line.quantity,
    });
    if (stockErr) {
      console.error(`Stock update failed for ${line.product.id}: ${stockErr.message}`);
    } else if (taken === false) {
      // The piece sold out between paying and recording. Refusing now would
      // strand a client who has already been charged, so the order stands and
      // the maison is told to sort it out.
      console.error(
        `OVERSOLD: order ${orderNumber} took ${line.quantity} x ${line.product.name} (${line.product.id}) with insufficient stock`
      );
    }
  }

  const { data: full } = await db.from('orders').select('*, order_items(*)').eq('id', id).single();
  const order = rowToOrder(full);

  // Both the browser's confirmation and the webhook's recovery come through
  // here, so a client whose browser died is still written to. A mail failure
  // is never allowed to undo an order that has already been paid for.
  try {
    await sendOrderEmails(env, order);
  } catch (err) {
    console.error(`Order emails failed for ${order.orderNumber}:`, err);
  }

  return order;
}

app.post('/api/orders', optionalAuth, async c => {
  const body = await c.req.json();
  const { items, shippingAddress, customerName, customerEmail, customerPhone, paymentMethod, giftWrapped, notes } = body;

  if (!shippingAddress || !customerName || !customerPhone) {
    return c.json({ error: 'Shipping address, name and phone are required' }, 400);
  }

  const priced = await priceItems(c.env, items);
  const user = currentUser(c);

  // What delivery costs on this order. For a card payment the figure is taken
  // from the parked checkout rather than asked again: courier rates move, and a
  // fresh quote a rupee different from the one the client was charged would see
  // their own payment rejected as a mismatch.
  let shippingINR = 0;
  let codFeeINR = 0;
  const parkedId = body.payment?.razorpay_order_id;
  const parked = parkedId
    ? (
        await getDb(c.env)
          .from('pending_checkouts')
          .select('shipping_inr, cod_fee_inr')
          .eq('razorpay_order_id', parkedId)
          .maybeSingle()
      ).data
    : null;

  if (parked) {
    shippingINR = Math.round(Number(parked.shipping_inr) || 0);
    codFeeINR = Math.round(Number(parked.cod_fee_inr) || 0);
  } else {
    const quote = await quoteShipping(c.env, {
      pincode: pincodeOf(shippingAddress),
      cod: paymentMethod === 'COD',
      goodsINR: priced.totalINR,
      pieces: priced.lines.reduce((n, l) => n + l.quantity, 0),
    });
    shippingINR = quote.shippingINR;
    codFeeINR = quote.codFeeINR;
  }

  const payableINR = priced.totalINR + shippingINR + codFeeINR;

  let paymentStatus: 'Pending' | 'Paid' = 'Pending';
  let razorpayOrderId: string | null = null;
  let razorpayPaymentId: string | null = null;

  if (paymentMethod === 'Razorpay') {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body.payment ?? {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return c.json({ error: 'Missing Razorpay payment details' }, 400);
    }
    const valid = await verifyRazorpaySignature(c.env, razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!valid) return c.json({ error: 'Payment verification failed' }, 400);

    // A valid signature only proves a payment exists — not that it was for this
    // cart, and not that it has not already been spent on another order. Both
    // have to be checked against Razorpay and against our own orders table.
    const payment = await fetchRazorpayPayment(c.env, razorpay_payment_id);
    const expectedPaise = Math.round(payableINR * 100);

    const mismatch = !payment
      ? 'no such payment at Razorpay'
      : payment.order_id !== razorpay_order_id
        ? `payment belongs to order ${payment.order_id}`
        : payment.currency !== 'INR'
          ? `currency ${payment.currency}`
          : payment.status !== 'captured' && payment.status !== 'authorized'
            ? `status ${payment.status}`
            : payment.amount !== expectedPaise
              ? `paid ${payment.amount} paise, cart is ${expectedPaise}`
              : null;

    if (mismatch) {
      // Log loudly: a real customer may have been charged, and that money must
      // not disappear silently just because we refused the order.
      console.error(
        `Rejected Razorpay payment ${razorpay_payment_id} (order ${razorpay_order_id}): ${mismatch}`
      );
      return c.json({ error: 'Payment does not match this order' }, 400);
    }

    // The webhook may have written this order already — it usually reaches us
    // before the client's browser does. By this point the payment has been
    // verified against Razorpay and against this cart's total, so the order it
    // produced is this client's own: hand it back rather than refusing. A
    // stranger cannot get here, since the signature cannot be forged without
    // the key secret.
    const { data: settled } = await getDb(c.env)
      .from('orders')
      .select('*, order_items(*)')
      .eq('razorpay_payment_id', razorpay_payment_id)
      .maybeSingle();
    if (settled) {
      console.log(`Payment ${razorpay_payment_id} already settled as ${settled.order_number}`);
      return c.json(rowToOrder(settled), 200);
    }

    paymentStatus = 'Paid';
    razorpayOrderId = razorpay_order_id;
    razorpayPaymentId = razorpay_payment_id;
  } else if (paymentMethod !== 'COD') {
    return c.json({ error: 'Unsupported payment method' }, 400);
  }

  const written = await writeOrder(c.env, {
    priced,
    shippingINR,
    codFeeINR,
    userId: user?.sub ?? null,
    customerName,
    customerEmail: customerEmail ?? user?.email ?? '',
    customerPhone,
    shippingAddress,
    paymentMethod,
    paymentStatus,
    razorpayOrderId,
    razorpayPaymentId,
    giftWrapped,
    notes,
  });

  if (written === 'duplicate') {
    // The webhook got there in the moment between the check above and this
    // insert. The money is accounted for either way, so the client is shown
    // the order rather than an error.
    const { data: settled } = await getDb(c.env)
      .from('orders')
      .select('*, order_items(*)')
      .eq('razorpay_payment_id', razorpayPaymentId)
      .maybeSingle();
    if (settled) return c.json(rowToOrder(settled), 200);
    return c.json({ error: 'This payment has already been used' }, 409);
  }

  if (razorpayOrderId) {
    await getDb(c.env).from('pending_checkouts').delete().eq('razorpay_order_id', razorpayOrderId);
  }

  return c.json(written, 201);
});

// ---------------------------------------------------------------- shipping

/** Hands an order to the courier and records what comes back. */
app.post('/api/orders/:id/ship', requireAdmin, async c => {
  if (!isShipmozoConfigured(c.env)) {
    return c.json({ error: 'Shipmozo is not configured yet' }, 503);
  }

  const db = getDb(c.env);
  const orderId = c.req.param('id');
  const { data: row } = await db
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .maybeSingle();
  if (!row) return c.json({ error: 'Order not found' }, 404);
  if (row.awb_number || row.shipmozo_order_id) {
    return c.json({ error: 'This order has already been sent to the courier' }, 409);
  }

  const body = await c.req.json().catch(() => ({}));
  const result = await pushOrder(c.env, rowToOrder(row), {
    weightGrams: Number(body?.weightGrams) || undefined,
  });

  const { data: updated, error } = await db
    .from('orders')
    .update({
      shipmozo_order_id: result.shipmozoOrderId,
      awb_number: result.awbNumber,
      courier_name: result.courierName,
      shipped_at: new Date().toISOString(),
      // Only claim it has shipped once a parcel actually has a number.
      order_status: result.awbNumber ? 'Shipped via Express' : row.order_status,
    })
    .eq('id', orderId)
    .select('*, order_items(*)')
    .single();
  if (error) throw new Error(error.message);

  return c.json(rowToOrder(updated));
});

/** Records an AWB entered by hand, for a parcel booked in the courier's panel. */
app.put('/api/orders/:id/awb', requireAdmin, async c => {
  const { awbNumber, courierName } = await c.req.json();
  const awb = String(awbNumber ?? '').trim();
  if (!awb) return c.json({ error: 'An AWB number is required' }, 400);

  const { data, error } = await getDb(c.env)
    .from('orders')
    .update({
      awb_number: awb,
      courier_name: courierName ? String(courierName).trim() : null,
      shipped_at: new Date().toISOString(),
      order_status: 'Shipped via Express',
    })
    .eq('id', c.req.param('id'))
    .select('*, order_items(*)')
    .maybeSingle();

  // The unique index: that number is already on another order.
  if (error?.code === '23505') {
    return c.json({ error: 'That AWB is already on another order' }, 409);
  }
  if (error) throw new Error(error.message);
  if (!data) return c.json({ error: 'Order not found' }, 404);
  return c.json(rowToOrder(data));
});

/**
 * Where the parcel is now.
 *
 * A client may ask about their own order; an administrator about any. The
 * answer is fetched live from the courier and the last status kept on the
 * order, so the archive still reads sensibly when the courier is unreachable.
 */
app.get('/api/orders/:orderNumber/tracking', requireAuth, async c => {
  const user = currentUser(c)!;
  const db = getDb(c.env);

  const { data: row } = await db
    .from('orders')
    .select('id, user_id, awb_number, courier_name, tracking_status, tracking_updated_at')
    .eq('order_number', c.req.param('orderNumber'))
    .maybeSingle();

  if (!row || (user.role !== 'admin' && row.user_id !== user.sub)) {
    return c.json({ error: 'Order not found' }, 404);
  }
  if (!row.awb_number) {
    return c.json({ awbNumber: null, status: null, history: [] });
  }
  if (!isShipmozoConfigured(c.env)) {
    return c.json({
      awbNumber: row.awb_number,
      courierName: row.courier_name,
      status: row.tracking_status,
      history: [],
    });
  }

  try {
    const update = await trackByAwb(c.env, row.awb_number);
    await db
      .from('orders')
      .update({
        tracking_status: update.status,
        courier_name: update.courierName ?? row.courier_name,
        tracking_updated_at: new Date().toISOString(),
      })
      .eq('id', row.id);

    return c.json({
      awbNumber: row.awb_number,
      courierName: update.courierName ?? row.courier_name,
      status: update.status,
      history: update.history,
    });
  } catch (err: any) {
    // A courier having a bad morning must not break the order page.
    console.error(`Tracking failed for ${row.awb_number}: ${err?.message}`);
    return c.json({
      awbNumber: row.awb_number,
      courierName: row.courier_name,
      status: row.tracking_status,
      history: [],
      stale: true,
    });
  }
});

app.post('/api/orders/:id/pickup', requireAdmin, async c => {
  const { data: row } = await getDb(c.env)
    .from('orders')
    .select('shipmozo_order_id')
    .eq('id', c.req.param('id'))
    .maybeSingle();
  if (!row?.shipmozo_order_id) {
    return c.json({ error: 'This order has not been sent to the courier yet' }, 400);
  }
  await schedulePickup(c.env, row.shipmozo_order_id);
  return c.json({ status: 'pickup scheduled' });
});

/** Tells a client, before they order, whether anyone will deliver to them. */
app.post('/api/shipping/serviceability', async c => {
  const { pincode } = await c.req.json();
  const delivery = String(pincode ?? '').replace(/\D/g, '');
  if (delivery.length !== 6) return c.json({ error: 'Enter a six-digit pin code' }, 400);
  if (!isShipmozoConfigured(c.env)) return c.json({ serviceable: null });

  try {
    const quotes = await getQuotes(
      c.env,
      delivery,
      c.env.SHIPMOZO_PICKUP_PINCODE || '396191'
    );
    return c.json({
      serviceable: quotes.length > 0,
      // The cheapest quote is what the maison would actually pay to send it.
      fromINR: quotes[0]?.totalINR ?? null,
    });
  } catch {
    // Unknown is better than a wrong "no" that turns a client away.
    return c.json({ serviceable: null });
  }
});

/**
 * Everything that must happen once an order becomes Cancelled.
 *
 * Called from two places — the panel and the client's own cancel button — and
 * it must be safe to reach twice: an order already carrying a cancelled_at is
 * left alone, so a second press cannot restock the same pieces again.
 *
 * Nothing in here is allowed to fail the cancellation. A courier that will not
 * answer, or a restock that errors, is logged and stepped over; the client has
 * been told their order is cancelled and that must remain true.
 */
async function settleCancellation(
  env: Env,
  db: ReturnType<typeof getDb>,
  row: any,
  by: 'customer' | 'admin',
  reason?: string
): Promise<void> {
  // Tell the courier too, or a cancelled order is still collected and sent.
  if (row.shipmozo_order_id && isShipmozoConfigured(env)) {
    try {
      await cancelShipment(env, row.shipmozo_order_id);
    } catch (err: any) {
      console.error(
        `Order ${row.order_number} cancelled here but Shipmozo refused: ${err?.message}`
      );
    }
  }

  // The pieces go back on the shelf.
  for (const item of row.order_items ?? []) {
    const { error: stockErr } = await db.rpc('increment_stock', {
      p_product_id: item.product_id,
      p_quantity: item.quantity,
    });
    if (stockErr) {
      console.error(`Could not restock ${item.product_id}: ${stockErr.message}`);
    }
  }

  // Money that has been taken and is no longer owed is money to be sent back.
  // It is recorded, not refunded — a refund leaves the shop's account, and that
  // is the shop's decision to make, not this code's.
  const refundStatus = row.payment_status === 'Paid' ? 'Due' : null;

  const { error } = await db
    .from('orders')
    .update({
      cancelled_at: new Date().toISOString(),
      cancelled_by: by,
      cancellation_reason: reason?.slice(0, 500) || null,
      refund_status: refundStatus,
    })
    .eq('id', row.id);
  if (error) console.error(`Could not record the cancellation: ${error.message}`);
}

/** Statuses a client may still cancel from. Once it is with the courier, no. */
const CANCELLABLE = ['Placed', 'In Artisan Crafting', 'Quality Assured'];

/**
 * A client cancelling their own order.
 *
 * Deliberately narrower than the panel's power: only their own order, only
 * before it has been handed to a courier. Past that point the parcel is moving
 * and stopping it is a conversation, not a button.
 */
app.post('/api/orders/:orderNumber/cancel', requireAuth, async c => {
  const user = currentUser(c)!;
  const db = getDb(c.env);
  const { reason } = await c.req.json<{ reason?: string }>().catch(() => ({ reason: undefined }));

  const { data: row, error } = await db
    .from('orders')
    .select('*, order_items(*)')
    .eq('order_number', c.req.param('orderNumber'))
    .maybeSingle();
  if (error) throw new Error(error.message);

  // Same silence as elsewhere: not yours and not there read alike.
  if (!row || (user.role !== 'admin' && row.user_id !== user.sub)) {
    return c.json({ error: 'Order not found' }, 404);
  }

  if (row.order_status === 'Cancelled') {
    // Already done is not an error; the client only wants to see it cancelled.
    return c.json(rowToOrder(row));
  }

  if (row.awb_number || !CANCELLABLE.includes(row.order_status)) {
    throw new CartError(
      'This order is already on its way, so it cannot be cancelled here. Write to us and we will help.'
    );
  }

  const { data: updated, error: updateErr } = await db
    .from('orders')
    .update({ order_status: 'Cancelled' })
    .eq('id', row.id)
    .eq('order_status', row.order_status) // lost race = someone else moved it on
    .select('*, order_items(*)')
    .maybeSingle();
  if (updateErr) throw new Error(updateErr.message);
  if (!updated) {
    throw new CartError('This order has just been updated. Reload the page and try again.');
  }

  // An administrator can reach this route too; the record should say who it
  // actually was, not who the route was written for.
  await settleCancellation(
    c.env,
    db,
    updated,
    user.role === 'admin' ? 'admin' : 'customer',
    reason
  );

  const { data: fresh } = await db
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', row.id)
    .maybeSingle();
  return c.json(rowToOrder(fresh ?? updated));
});

/** Marks a refund as sent. The money moves in Razorpay; this records that it did. */
app.put('/api/orders/:id/refund', requireAdmin, async c => {
  const { refunded } = await c.req.json<{ refunded?: boolean }>();
  const db = getDb(c.env);

  const { data, error } = await db
    .from('orders')
    .update({ refund_status: refunded === false ? 'Due' : 'Refunded' })
    .eq('id', c.req.param('id'))
    .select('*, order_items(*)')
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return c.json({ error: 'Order not found' }, 404);
  return c.json(rowToOrder(data));
});

app.put('/api/orders/:id/status', requireAdmin, async c => {
  const { status } = await c.req.json();
  const allowed = ['Placed', 'In Artisan Crafting', 'Quality Assured', 'Shipped via Express', 'Delivered', 'Cancelled'];
  if (!allowed.includes(status)) return c.json({ error: 'Invalid status' }, 400);

  const db = getDb(c.env);
  const orderId = c.req.param('id');

  const { data: before } = await db
    .from('orders')
    .select('order_status')
    .eq('id', orderId)
    .maybeSingle();

  const { data, error } = await db
    .from('orders')
    .update({ order_status: status })
    .eq('id', orderId)
    .select('*, order_items(*)')
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return c.json({ error: 'Order not found' }, 404);

  // Cancelling puts the pieces back on the shelf — but only on the way into
  // Cancelled, so re-saving a cancelled order does not conjure stock.
  if (status === 'Cancelled' && before?.order_status !== 'Cancelled') {
    await settleCancellation(c.env, db, data, 'admin');
    const { data: fresh } = await db
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .maybeSingle();
    if (fresh) return c.json(rowToOrder(fresh));
  }

  return c.json(rowToOrder(data));
});

// ---------------------------------------------------------------- payments (Razorpay)

app.post('/api/payments/razorpay/order', optionalAuth, async c => {
  const body = await c.req.json();
  const { items, shippingAddress, customerName, customerEmail, customerPhone, giftWrapped, notes } = body;
  // Razorpay is asked for the whole amount, delivery included — a payment
  // window showing less than the order costs is a shortfall nobody can fix
  // afterwards.
  const priced = await priceOrder(c.env, items, { address: shippingAddress, cod: false });
  const rzpOrder = await createRazorpayOrder(c.env, priced.grandTotalINR, `rcpt_${Date.now()}`);
  const user = currentUser(c);

  // A checkout that was opened and abandoned leaves its basket parked forever.
  // Razorpay orders expire long before this, so anything older is dead weight.
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await getDb(c.env).from('pending_checkouts').delete().lt('created_at', cutoff);

  // Park the basket before the payment window opens. If the client pays and
  // their browser never makes it back, the webhook has everything it needs to
  // finish the order without them.
  if (shippingAddress && customerName && customerPhone) {
    const { error } = await getDb(c.env).from('pending_checkouts').insert({
      razorpay_order_id: rzpOrder.id,
      user_id: user?.sub ?? null,
      customer_name: customerName,
      customer_email: customerEmail ?? user?.email ?? '',
      customer_phone: customerPhone,
      shipping_address: shippingAddress,
      items,
      gift_wrapped: !!giftWrapped,
      notes: notes ?? null,
      shipping_inr: priced.shippingINR,
      cod_fee_inr: priced.codFeeINR,
    });
    // Never block the payment over this — losing recovery is far better than
    // refusing a client who is ready to pay.
    if (error) console.error(`Could not park checkout ${rzpOrder.id}: ${error.message}`);
  }

  return c.json({
    razorpayOrderId: rzpOrder.id,
    amount: rzpOrder.amount, // paise
    currency: rzpOrder.currency,
    keyId: c.env.RAZORPAY_KEY_ID, // public key id — safe to expose
    totalINR: priced.grandTotalINR,
    shippingINR: priced.shippingINR,
  });
});

/**
 * Razorpay's own account of what happened.
 *
 * This is the safety net for a payment that succeeded while the client's
 * browser did not come back — a closed tab, a flat battery, a train tunnel.
 * Razorpay retries a delivery it cannot get a 2xx for, so anything that a
 * retry cannot fix answers 200 and shouts in the log instead.
 */
app.post('/api/payments/razorpay/webhook', async c => {
  const secret = c.env.RAZORPAY_WEBHOOK_SECRET;
  // Without a secret nothing can be trusted, and accepting unsigned events
  // would let anyone mark orders paid.
  if (!secret) {
    console.error('Razorpay webhook arrived but RAZORPAY_WEBHOOK_SECRET is not set');
    return c.json({ error: 'Webhooks are not configured' }, 503);
  }

  const signature = c.req.header('X-Razorpay-Signature');
  const raw = await c.req.text();
  if (!signature || !(await verifyWebhookSignature(secret, raw, signature))) {
    return c.json({ error: 'Invalid signature' }, 400);
  }

  const event = JSON.parse(raw);
  const payment = event?.payload?.payment?.entity;
  if (event?.event !== 'payment.captured' || !payment?.id) {
    return c.json({ status: 'ignored' });
  }

  const db = getDb(c.env);
  const { data: already } = await db
    .from('orders')
    .select('id')
    .eq('razorpay_payment_id', payment.id)
    .maybeSingle();
  // The usual case: the browser came back and wrote the order itself.
  if (already) return c.json({ status: 'already recorded' });

  const { data: parked } = await db
    .from('pending_checkouts')
    .select('*')
    .eq('razorpay_order_id', payment.order_id)
    .maybeSingle();

  if (!parked) {
    console.error(
      `Captured payment ${payment.id} (order ${payment.order_id}) has no order and no parked checkout — needs manual reconciliation`
    );
    return c.json({ status: 'unmatched' });
  }

  const priced = await priceItems(c.env, parked.items);
  // The charges the client was quoted when the payment window opened, not what
  // a courier would say now.
  const shippingINR = Math.round(Number(parked.shipping_inr) || 0);
  const codFeeINR = Math.round(Number(parked.cod_fee_inr) || 0);
  const expectedPaise = Math.round((priced.totalINR + shippingINR + codFeeINR) * 100);
  if (payment.amount !== expectedPaise || payment.currency !== 'INR') {
    console.error(
      `Captured payment ${payment.id} is ${payment.amount} ${payment.currency}, parked basket is ${expectedPaise} INR — not recording`
    );
    return c.json({ status: 'mismatched' });
  }

  const written = await writeOrder(c.env, {
    priced,
    shippingINR,
    codFeeINR,
    userId: parked.user_id,
    customerName: parked.customer_name,
    customerEmail: parked.customer_email,
    customerPhone: parked.customer_phone,
    shippingAddress: parked.shipping_address,
    paymentMethod: 'Razorpay',
    paymentStatus: 'Paid',
    razorpayOrderId: payment.order_id,
    razorpayPaymentId: payment.id,
    giftWrapped: parked.gift_wrapped,
    notes: parked.notes,
  });

  await db.from('pending_checkouts').delete().eq('razorpay_order_id', payment.order_id);

  if (written === 'duplicate') return c.json({ status: 'already recorded' });

  console.log(`Recovered order ${written.orderNumber} from webhook for payment ${payment.id}`);
  return c.json({ status: 'recorded', orderNumber: written.orderNumber });
});

// ---------------------------------------------------------------- currency rates

// Live exchange rates with INR as the base, from open.er-api.com (free, no key).
// Cloudflare caches the upstream response for 6 hours so we stay well within limits.
app.get('/api/rates', async c => {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/INR', {
      cf: { cacheTtl: 21600, cacheEverything: true },
    } as RequestInit);
    if (!res.ok) throw new Error(`Rates upstream returned ${res.status}`);
    const data: any = await res.json();
    if (data?.result !== 'success' || !data?.rates) throw new Error('Bad rates payload');
    return c.json(
      { base: 'INR', rates: data.rates, updated: data.time_last_update_utc ?? null },
      200,
      { 'Cache-Control': 'public, max-age=3600' }
    );
  } catch (err) {
    console.error('Rates fetch failed, serving fallback:', err);
    // Approximate fallback so the shop still works if the rates API is down
    return c.json({
      base: 'INR',
      rates: { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0094, AED: 0.044, SAR: 0.045, SGD: 0.016, AUD: 0.018, CAD: 0.016, JPY: 1.78 },
      updated: null,
      fallback: true,
    });
  }
});

// ---------------------------------------------------------------- customers

app.get('/api/users', requireAdmin, async c => {
  const db = getDb(c.env);
  const { data: users, error } = await db
    .from('users')
    .select('id, name, email, phone, role, avatar, address, created_at, password_hash')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);

  const { data: orders } = await db
    .from('orders')
    .select('user_id, customer_email, total_inr, payment_status, created_at');

  return c.json(
    (users ?? []).map(({ password_hash, created_at, ...user }) => {
      // Orders are matched on email as well as id, so a purchase made as a
      // guest still shows against the account that later used that address.
      const theirs = (orders ?? []).filter(
        o =>
          (o.user_id && o.user_id === user.id) ||
          (!!user.email &&
            String(o.customer_email ?? '').trim().toLowerCase() === user.email)
      );

      return {
        ...user,
        createdAt: created_at,
        // A row carrying no password was created by Google sign-in.
        signUpMethod: password_hash ? 'Email' : 'Google',
        orderCount: theirs.length,
        totalSpentINR: theirs
          .filter(o => o.payment_status === 'Paid')
          .reduce((sum, o) => sum + Number(o.total_inr ?? 0), 0),
        lastOrderAt: theirs.reduce<string | null>(
          (latest, o) => (!latest || String(o.created_at) > latest ? String(o.created_at) : latest),
          null
        ),
      };
    })
  );
});

// ---------------------------------------------------------------- newsletter

app.get('/api/newsletter', requireAdmin, async c => {
  const db = getDb(c.env);
  const { data, error } = await db
    .from('newsletter_subscribers')
    .select('id, email, subscribed_at')
    .order('subscribed_at', { ascending: false });
  if (error) throw new Error(error.message);
  return c.json(data ?? []);
});

app.post('/api/newsletter', async c => {
  const { email } = await c.req.json();
  if (!email || !String(email).includes('@')) return c.json({ error: 'A valid email is required' }, 400);
  const db = getDb(c.env);
  const { error } = await db
    .from('newsletter_subscribers')
    .upsert({ email: String(email).trim().toLowerCase() }, { onConflict: 'email', ignoreDuplicates: true });
  if (error) throw new Error(error.message);
  return c.json({ success: true, message: 'Subscribed to the AL-KAIFF newsletter' });
});

// ---------------------------------------------------------------- images (R2)

app.post('/api/uploads', requireAdmin, async c => {
  const form = await c.req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return c.json({ error: 'Attach an image as the "file" field' }, 400);
  if (!file.type.startsWith('image/')) return c.json({ error: 'Only image files are allowed' }, 400);
  if (file.size > 8 * 1024 * 1024) return c.json({ error: 'Image must be under 8 MB' }, 400);

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const key = `products/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  await c.env.IMAGES.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  const url = new URL(c.req.url);
  return c.json({ key, url: `${url.origin}/api/images/${key}` }, 201);
});

app.get('/api/images/*', async c => {
  const key = c.req.path.replace('/api/images/', '');
  const object = await c.env.IMAGES.get(key);
  if (!object) return c.json({ error: 'Image not found' }, 404);
  return new Response(object.body as ReadableStream, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType ?? 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
      etag: object.httpEtag,
    },
  });
});

// ---------------------------------------------------------------- one-time setup

// Creates the admin account (from ADMIN_EMAIL / ADMIN_PASSWORD secrets) and seeds
// the product catalogue if the tables are empty. Safe to call repeatedly.
app.post('/api/setup/init', async c => {
  const db = getDb(c.env);
  const result: Record<string, unknown> = {};

  const { data: admin } = await db.from('users').select('id').eq('role', 'admin').limit(1).maybeSingle();
  if (!admin) {
    if (!c.env.ADMIN_EMAIL || !c.env.ADMIN_PASSWORD) {
      return c.json({ error: 'ADMIN_EMAIL and ADMIN_PASSWORD secrets are not set' }, 500);
    }
    const { error } = await db.from('users').insert({
      name: 'AL-KAIFF Master Admin',
      email: c.env.ADMIN_EMAIL.trim().toLowerCase(),
      password_hash: await hashPassword(c.env.ADMIN_PASSWORD),
      role: 'admin',
    });
    if (error) throw new Error(error.message);
    result.adminCreated = true;
  } else {
    result.adminCreated = false;
  }

  const { count: categoryCount, error: catCheckErr } = await db
    .from('categories')
    .select('id', { count: 'exact', head: true });
  if (catCheckErr) throw new Error(`categories table missing? Run migrations/001_categories.sql (${catCheckErr.message})`);
  if (!categoryCount) {
    const defaults = [
      { id: 'jewellery', name: 'Fine Jewellery', parent_id: null, sort: 1 },
      { id: 'necklaces', name: 'Necklaces', parent_id: 'jewellery', sort: 1 },
      { id: 'rings', name: 'Rings', parent_id: 'jewellery', sort: 2 },
      { id: 'bangles', name: 'Bangles & Bracelets', parent_id: 'jewellery', sort: 3 },
      { id: 'earrings', name: 'Earrings', parent_id: 'jewellery', sort: 4 },
      { id: 'perfumes', name: 'Bespoke Perfumes', parent_id: null, sort: 2 },
      { id: 'attar', name: 'Pure Attar', parent_id: 'perfumes', sort: 1 },
      { id: 'eau-de-parfum', name: 'Eau de Parfum', parent_id: 'perfumes', sort: 2 },
      { id: 'watches', name: 'Royal Timepieces', parent_id: null, sort: 3 },
      { id: 'mens-watches', name: "Men's Watches", parent_id: 'watches', sort: 1 },
      { id: 'womens-watches', name: "Women's Watches", parent_id: 'watches', sort: 2 },
    ];
    const { error } = await db.from('categories').insert(defaults);
    if (error) throw new Error(error.message);
    result.categoriesSeeded = defaults.length;
  } else {
    result.categoriesSeeded = 0;
  }

  // Demo products are only inserted when explicitly asked for (?seed=demo).
  // Without this guard, an empty catalogue would be re-filled with sample data.
  if (c.req.query('seed') === 'demo') {
    const { count } = await db.from('products').select('id', { count: 'exact', head: true });
    if (!count) {
      const { error } = await db.from('products').insert(
        SEED_PRODUCTS.map(p =>
          productToRow({
            ...p,
            subtitle: p.subtitle ?? '',
            subcategory: p.subcategory ?? null,
            secondaryImages: p.secondaryImages ?? [],
            featured: p.featured ?? false,
            isNewArrival: p.isNewArrival ?? false,
            inStock: p.inStock ?? true,
            specifications: p.specifications ?? {},
            artisanStory: p.artisanStory ?? '',
            sku: p.sku ?? '',
          })
        )
      );
      if (error) throw new Error(error.message);
      result.productsSeeded = SEED_PRODUCTS.length;
    }
  }

  return c.json({ message: 'Setup complete', ...result });
});

export default app;
