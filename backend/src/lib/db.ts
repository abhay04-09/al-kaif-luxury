import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Env } from '../env';
import type { Product, Order, CartItem, Category } from '../types';

export function getDb(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ---- row <-> app-shape mappers (DB is snake_case, frontend is camelCase) ----

export function rowToProduct(r: any): Product {
  return {
    id: r.id,
    name: r.name,
    subtitle: r.subtitle ?? '',
    category: r.category,
    subcategory: r.subcategory ?? null,
    priceINR: Number(r.price_inr),
    priceUSD: Number(r.price_usd ?? 0),
    image: r.image,
    secondaryImages: r.secondary_images ?? [],
    description: r.description ?? '',
    featured: r.featured,
    isNewArrival: r.is_new_arrival,
    inStock: r.in_stock,
    // null means the piece is not counted; it is governed by inStock alone.
    stockQuantity: r.stock_quantity ?? null,
    lowStockThreshold: r.low_stock_threshold ?? 3,
    specifications: r.specifications ?? {},
    artisanStory: r.artisan_story ?? undefined,
    sku: r.sku ?? '',
    sizes: r.sizes ?? [],
    seoTitle: r.seo_title ?? null,
    seoDescription: r.seo_description ?? null,
    seoKeywords: r.seo_keywords ?? null,
    createdAt: r.created_at ?? null,
    archived: Boolean(r.archived),
    archivedAt: r.archived_at ?? null,
  };
}

export function productToRow(p: Partial<Product>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (p.id !== undefined) row.id = p.id;
  if (p.name !== undefined) row.name = p.name;
  if (p.subtitle !== undefined) row.subtitle = p.subtitle;
  if (p.category !== undefined) row.category = p.category;
  if (p.subcategory !== undefined) row.subcategory = p.subcategory || null;
  if (p.priceINR !== undefined) row.price_inr = p.priceINR;
  if (p.priceUSD !== undefined) row.price_usd = p.priceUSD;
  if (p.image !== undefined) row.image = p.image;
  if (p.secondaryImages !== undefined) row.secondary_images = p.secondaryImages;
  if (p.description !== undefined) row.description = p.description;
  if (p.featured !== undefined) row.featured = p.featured;
  if (p.isNewArrival !== undefined) row.is_new_arrival = p.isNewArrival;
  if (p.inStock !== undefined) row.in_stock = p.inStock;
  if (p.stockQuantity !== undefined) {
    // An empty field means "stop counting this piece", not "none left".
    const raw = p.stockQuantity as unknown;
    const counted =
      raw === null || raw === '' || Number.isNaN(Number(raw))
        ? null
        : Math.max(0, Math.floor(Number(raw)));
    row.stock_quantity = counted;
    // Counting a piece decides its availability, so the two cannot disagree.
    if (counted !== null) row.in_stock = counted > 0;
  }
  if (p.lowStockThreshold !== undefined) {
    row.low_stock_threshold = Math.max(0, Math.floor(Number(p.lowStockThreshold) || 0));
  }
  if (p.specifications !== undefined) row.specifications = p.specifications;
  if (p.artisanStory !== undefined) row.artisan_story = p.artisanStory;
  if (p.sku !== undefined) row.sku = p.sku;
  if (p.sizes !== undefined) row.sizes = p.sizes;
  if (p.seoTitle !== undefined) row.seo_title = p.seoTitle || null;
  if (p.seoDescription !== undefined) row.seo_description = p.seoDescription || null;
  if (p.seoKeywords !== undefined) row.seo_keywords = p.seoKeywords || null;
  return row;
}

export function rowToCategory(r: any): Category {
  return {
    id: r.id,
    name: r.name,
    parentId: r.parent_id ?? null,
    sort: r.sort ?? 0,
  };
}

/** Turns flat category rows into a tree: top-level categories with `children`. */
export function buildCategoryTree(rows: any[]): Category[] {
  const all = rows.map(rowToCategory);
  const top = all.filter(c => !c.parentId).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  for (const parent of top) {
    parent.children = all
      .filter(c => c.parentId === parent.id)
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  }
  return top;
}

export function rowToOrder(r: any): Order {
  const items: CartItem[] = (r.order_items ?? []).map((it: any) => ({
    product: {
      id: it.product_id,
      name: it.product_name,
      subtitle: '',
      category: 'jewellery',
      priceINR: Number(it.price_inr),
      priceUSD: Number(it.price_usd),
      image: it.image ?? '',
      description: '',
      inStock: true,
      specifications: {},
      sku: '',
    } as Product,
    quantity: it.quantity,
    selectedMetal: it.selected_metal ?? undefined,
    selectedSize: it.selected_size ?? undefined,
  }));

  return {
    id: r.id,
    orderNumber: r.order_number,
    createdAt: r.created_at,
    userId: r.user_id ?? undefined,
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    customerPhone: r.customer_phone,
    shippingAddress: r.shipping_address,
    items,
    subtotalINR: Number(r.subtotal_inr),
    taxINR: Number(r.tax_inr),
    discountINR: Number(r.discount_inr),
    totalINR: Number(r.total_inr),
    totalUSD: Number(r.total_usd),
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    orderStatus: r.order_status,
    razorpayOrderId: r.razorpay_order_id ?? undefined,
    razorpayPaymentId: r.razorpay_payment_id ?? undefined,
    giftWrapped: r.gift_wrapped,
    notes: r.notes ?? undefined,
  };
}
