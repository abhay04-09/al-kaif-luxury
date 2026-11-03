import type { ApiCombo } from "@/lib/api";
import type { Combo } from "@/types/product";

/** Safe to use on the server and in the browser. */
export function toCombo(combo: ApiCombo): Combo {
  return {
    id: combo.id,
    name: combo.name,
    description: combo.description ?? "",
    image: combo.image || null,
    pieces: combo.pieces,
    price: Math.round(combo.priceINR),
    productIds: combo.productIds ?? []
  };
}

/** "Any 4 pieces for ₹899" — the line that sells the offer. */
export function comboHeadline(combo: Pick<Combo, "pieces">, price: string) {
  return `Any ${combo.pieces} ${combo.pieces === 1 ? "piece" : "pieces"} for ${price}`;
}
