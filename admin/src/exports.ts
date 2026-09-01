import { Column, isoDate, toCsv } from './csv';
import { Customer, Order, Product } from './types';

const address = (value: Order['shippingAddress']): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  // The address is JSON on some orders and a plain line on others, depending on
  // when it was placed.
  const a = value as unknown as Partial<Record<string, string>>;
  return [a.addressLine1, a.addressLine2, a.city, a.state, a.pincode, a.country]
    .filter(Boolean)
    .join(', ');
};

/**
 * One row per order, for reconciliation and GST filing. The taxable value and
 * the GST are kept apart because that is what a return asks for.
 */
export const orderColumns: Column<Order>[] = [
  { header: 'Order number', value: o => o.orderNumber },
  { header: 'Placed on', value: o => isoDate(o.createdAt) },
  { header: 'Customer', value: o => o.customerName },
  { header: 'Email', value: o => o.customerEmail },
  { header: 'Phone', value: o => o.customerPhone },
  { header: 'Delivery address', value: o => address(o.shippingAddress) },
  {
    header: 'Items',
    value: o =>
      (o.items ?? [])
        .map(i => `${i.product?.name ?? 'Piece'} x${i.quantity}`)
        .join('; ')
  },
  { header: 'Pieces', value: o => (o.items ?? []).reduce((n, i) => n + i.quantity, 0) },
  { header: 'Taxable value (INR)', value: o => o.subtotalINR },
  { header: 'GST (INR)', value: o => o.taxINR },
  { header: 'Discount (INR)', value: o => o.discountINR ?? 0 },
  { header: 'Total (INR)', value: o => o.totalINR },
  { header: 'Payment method', value: o => o.paymentMethod },
  { header: 'Payment status', value: o => o.paymentStatus },
  { header: 'Order status', value: o => o.orderStatus },
  { header: 'Razorpay order', value: o => o.razorpayOrderId ?? '' },
  { header: 'Razorpay payment', value: o => o.razorpayPaymentId ?? '' },
  { header: 'Gift wrapped', value: o => (o.giftWrapped ? 'Yes' : 'No') },
  { header: 'Notes', value: o => o.notes ?? '' }
];

/** One row per line item — what you need to see which pieces actually sell. */
type ItemRow = { order: Order; name: string; quantity: number; priceINR: number; size: string };

export const itemColumns: Column<ItemRow>[] = [
  { header: 'Order number', value: r => r.order.orderNumber },
  { header: 'Placed on', value: r => isoDate(r.order.createdAt) },
  { header: 'Customer', value: r => r.order.customerName },
  { header: 'Piece', value: r => r.name },
  { header: 'Size', value: r => r.size },
  { header: 'Quantity', value: r => r.quantity },
  { header: 'Unit price (INR)', value: r => r.priceINR },
  { header: 'Line total (INR)', value: r => r.priceINR * r.quantity },
  { header: 'Payment status', value: r => r.order.paymentStatus },
  { header: 'Order status', value: r => r.order.orderStatus }
];

export function itemRows(orders: Order[]): ItemRow[] {
  return orders.flatMap(order =>
    (order.items ?? []).map(item => ({
      order,
      name: item.product?.name ?? 'Piece',
      quantity: item.quantity,
      priceINR: item.product?.priceINR ?? 0,
      size: (item as { selectedSize?: string }).selectedSize ?? ''
    }))
  );
}

export const customerColumns: Column<Customer>[] = [
  { header: 'Name', value: c => c.name },
  { header: 'Email', value: c => c.email },
  { header: 'Phone', value: c => c.phone ?? '' },
  { header: 'Role', value: c => c.role },
  { header: 'Signed up via', value: c => c.signUpMethod },
  { header: 'Joined', value: c => isoDate(c.createdAt) },
  { header: 'Orders', value: c => c.orderCount },
  { header: 'Total spent (INR)', value: c => c.totalSpentINR },
  { header: 'Last order', value: c => isoDate(c.lastOrderAt) }
];

export const productColumns: Column<Product>[] = [
  { header: 'Name', value: p => p.name },
  { header: 'SKU', value: p => p.sku ?? '' },
  { header: 'Category', value: p => p.category },
  { header: 'Subcategory', value: p => p.subcategory ?? '' },
  { header: 'Price (INR)', value: p => p.priceINR },
  { header: 'In stock', value: p => (p.inStock ? 'Yes' : 'No') },
  {
    header: 'Stock quantity',
    value: p =>
      p.stockQuantity === null || p.stockQuantity === undefined ? 'Not counted' : p.stockQuantity
  },
  { header: 'Featured', value: p => (p.featured ? 'Yes' : 'No') },
  { header: 'New arrival', value: p => (p.isNewArrival ? 'Yes' : 'No') },
  { header: 'Added', value: p => isoDate(p.createdAt) }
];

export { toCsv };
