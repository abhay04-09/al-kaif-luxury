import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './env';
import { getDb, rowToProduct, productToRow, rowToOrder, rowToCategory, buildCategoryTree } from './lib/db';
import { hashPassword, verifyPassword } from './lib/passwords';
import { createToken, requireAdmin, optionalAuth, currentUser } from './lib/auth';
import { createRazorpayOrder, verifyRazorpaySignature } from './lib/razorpay';
import { SEED_PRODUCTS } from './data/seedProducts';

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({ origin: '*', allowHeaders: ['Content-Type', 'Authorization'] }));

app.onError((err, c) => {
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
    .select('id, name, email, phone, role, avatar')
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
    .select('id, name, email, phone, role, avatar, password_hash')
    .eq('email', String(email).trim().toLowerCase())
    .maybeSingle();

  if (!user || !(await verifyPassword(String(password), user.password_hash))) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  const { password_hash: _ph, ...safeUser } = user;
  const token = await createToken(safeUser, c.env.JWT_SECRET);
  return c.json({ user: safeUser, token });
});

app.get('/api/auth/me', optionalAuth, async c => {
  const payload = currentUser(c);
  if (!payload) return c.json({ user: null });
  const db = getDb(c.env);
  const { data: user } = await db
    .from('users')
    .select('id, name, email, phone, role, avatar')
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

app.post('/api/products', requireAdmin, async c => {
  const body = await c.req.json();
  const db = getDb(c.env);
  const row = productToRow(body);
  row.id = body.id && String(body.id).startsWith('p-') ? body.id : `p-${Date.now()}`;
  if (!row.sku) row.sku = `ALK-NEW-${Math.floor(1000 + Math.random() * 9000)}`;
  // The form no longer collects a dollar price, but the column is NOT NULL on
  // databases created before migration 003.
  if (row.price_usd === undefined) row.price_usd = 0;

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
async function priceItems(env: Env, items: IncomingItem[]) {
  if (!Array.isArray(items) || items.length === 0) throw new Error('Cart is empty');
  const db = getDb(env);
  const ids = items.map(i => i.productId);
  const { data: rows, error } = await db.from('products').select('*').in('id', ids);
  if (error) throw new Error(error.message);
  const byId = new Map((rows ?? []).map(r => [r.id, rowToProduct(r)]));

  let subtotalINR = 0;
  let subtotalUSD = 0;
  const lines = items.map(i => {
    const product = byId.get(i.productId);
    if (!product) throw new Error(`Product not found: ${i.productId}`);
    const quantity = Math.max(1, Math.min(50, Math.floor(Number(i.quantity) || 1)));
    subtotalINR += product.priceINR * quantity;
    subtotalUSD += (product.priceUSD ?? 0) * quantity;
    return { product, quantity, selectedMetal: i.selectedMetal, selectedSize: i.selectedSize };
  });

  const taxINR = Math.round(subtotalINR * 0.03);
  const taxUSD = Math.round(subtotalUSD * 0.03);
  return { lines, subtotalINR, taxINR, totalINR: subtotalINR + taxINR, totalUSD: subtotalUSD + taxUSD };
}

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

app.post('/api/orders', optionalAuth, async c => {
  const body = await c.req.json();
  const { items, shippingAddress, customerName, customerEmail, customerPhone, paymentMethod, giftWrapped, notes } = body;

  if (!shippingAddress || !customerName || !customerPhone) {
    return c.json({ error: 'Shipping address, name and phone are required' }, 400);
  }

  const priced = await priceItems(c.env, items);
  const user = currentUser(c);

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
    paymentStatus = 'Paid';
    razorpayOrderId = razorpay_order_id;
    razorpayPaymentId = razorpay_payment_id;
  } else if (paymentMethod !== 'COD') {
    return c.json({ error: 'Unsupported payment method' }, 400);
  }

  const db = getDb(c.env);
  const id = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const orderNumber = `ALK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const { data: orderRow, error: orderErr } = await db
    .from('orders')
    .insert({
      id,
      order_number: orderNumber,
      user_id: user?.sub ?? null,
      customer_name: customerName,
      customer_email: customerEmail ?? user?.email ?? '',
      customer_phone: customerPhone,
      shipping_address: shippingAddress,
      subtotal_inr: priced.subtotalINR,
      tax_inr: priced.taxINR,
      discount_inr: 0,
      total_inr: priced.totalINR,
      total_usd: priced.totalUSD,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      order_status: 'Placed',
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      gift_wrapped: !!giftWrapped,
      notes: notes ?? null,
    })
    .select('*')
    .single();
  if (orderErr || !orderRow) throw new Error(orderErr?.message ?? 'Order insert failed');

  const { error: itemsErr } = await db.from('order_items').insert(
    priced.lines.map(l => ({
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

  const { data: full } = await db.from('orders').select('*, order_items(*)').eq('id', id).single();
  return c.json(rowToOrder(full), 201);
});

app.put('/api/orders/:id/status', requireAdmin, async c => {
  const { status } = await c.req.json();
  const allowed = ['Placed', 'In Artisan Crafting', 'Quality Assured', 'Shipped via Express', 'Delivered', 'Cancelled'];
  if (!allowed.includes(status)) return c.json({ error: 'Invalid status' }, 400);

  const db = getDb(c.env);
  const { data, error } = await db
    .from('orders')
    .update({ order_status: status })
    .eq('id', c.req.param('id'))
    .select('*, order_items(*)')
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return c.json({ error: 'Order not found' }, 404);
  return c.json(rowToOrder(data));
});

// ---------------------------------------------------------------- payments (Razorpay)

app.post('/api/payments/razorpay/order', async c => {
  const { items } = await c.req.json();
  const priced = await priceItems(c.env, items);
  const rzpOrder = await createRazorpayOrder(c.env, priced.totalINR, `rcpt_${Date.now()}`);
  return c.json({
    razorpayOrderId: rzpOrder.id,
    amount: rzpOrder.amount, // paise
    currency: rzpOrder.currency,
    keyId: c.env.RAZORPAY_KEY_ID, // public key id — safe to expose
    totalINR: priced.totalINR,
  });
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
