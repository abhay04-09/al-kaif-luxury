import { getProductById } from "@/lib/products";
import type { CartItem } from "@/types/product";

export function getCartSummary(items: CartItem[]) {
  const lines = items
    .map((item) => {
      const product = getProductById(item.productId);

      if (!product) {
        return null;
      }

      return {
        product,
        quantity: item.quantity,
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
