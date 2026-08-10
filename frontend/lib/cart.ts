import type { CartItem, Product } from "@/types/product";

/**
 * Builds cart totals from the live catalogue. Callers pass the products they have
 * loaded from the API; anything no longer in the catalogue is dropped from the summary.
 */
export function getCartSummary(items: CartItem[], catalogue: Product[]) {
  const byId = new Map(catalogue.map((product) => [product.id, product]));

  const lines = items
    .map((item) => {
      const product = byId.get(item.productId);

      if (!product) {
        return null;
      }

      return {
        product,
        quantity: item.quantity,
        size: item.size,
        lineTotal: product.price * item.quantity
      };
    })
    .filter((line) => line !== null);

  const subtotal = lines.reduce((total, line) => total + line.lineTotal, 0);
  const shipping = subtotal > 0 ? 0 : 0;
  const total = subtotal + shipping;

  return {
    lines,
    subtotal,
    shipping,
    total
  };
}
