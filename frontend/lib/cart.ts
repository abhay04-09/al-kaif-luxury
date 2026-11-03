import type { CartItem, Combo, ComboPick, Product } from "@/types/product";

/**
 * The id a combo line carries in the bag.
 *
 * The bag tells its lines apart by product id and size. A combo is not one
 * product, so it is given an id made of the offer and the pieces chosen: the
 * same pieces added twice join up into one line of two, and a different choice
 * from the same offer stays a line of its own.
 */
export function comboLineId(comboId: string, picks: ComboPick[]) {
  const signature = picks
    .map((pick) => `${pick.productId}${pick.size ? `@${pick.size}` : ""}`)
    .sort()
    .join(",");
  return `combo:${comboId}:${signature}`;
}

/**
 * Builds cart totals from the live catalogue. Callers pass the products they have
 * loaded from the API; anything no longer in the catalogue is dropped from the summary.
 *
 * `combos` is null until the live offers have loaded; a combo in the bag is then
 * drawn from what was saved with it rather than reported as withdrawn.
 */
export function getCartSummary(
  items: CartItem[],
  catalogue: Product[],
  combos: Combo[] | null = null
) {
  const byId = new Map(catalogue.map((product) => [product.id, product]));
  const offers = new Map((combos ?? []).map((combo) => [combo.id, combo]));

  const lines = items
    .map((item) => {
      if (item.combo) {
        return comboLine(item, item.combo, byId, offers, combos !== null, catalogue.length > 0);
      }

      const product = byId.get(item.productId);

      if (!product) {
        return null;
      }

      return {
        product,
        quantity: item.quantity,
        size: item.size,
        lineTotal: product.price * item.quantity,
        href: `/products/${product.slug}`,
        combo: undefined as CartItem["combo"],
        bundle: undefined as { name: string; size?: string }[] | undefined,
        worth: undefined as number | undefined
      };
    })
    .filter((line) => line !== null);

  // A piece can sell out after it was added, so it is shown but not charged.
  const hasSoldOut = lines.some((line) => !line.product.inStock);
  const subtotal = lines
    .filter((line) => line.product.inStock)
    .reduce((total, line) => total + line.lineTotal, 0);
  const shipping = subtotal > 0 ? 0 : 0;
  const total = subtotal + shipping;

  // What the combos in the bag save against buying the same pieces one by one.
  const comboSavings = lines
    .filter((line) => line.product.inStock && line.worth !== undefined)
    .reduce((sum, line) => sum + (line.worth! - line.lineTotal), 0);

  return {
    lines,
    hasSoldOut,
    comboSavings,
    subtotal,
    shipping,
    total
  };
}

export type CartLine = ReturnType<typeof getCartSummary>["lines"][number];

/** A combo drawn as one line, so the bag and checkout need no second kind of row. */
function comboLine(
  item: CartItem,
  saved: NonNullable<CartItem["combo"]>,
  byId: Map<string, Product>,
  offers: Map<string, Combo>,
  offersLoaded: boolean,
  catalogueLoaded: boolean
) {
  // Until the catalogue has arrived there is nothing to draw the pieces from;
  // single pieces are held back in the same way.
  if (!catalogueLoaded) return null;

  const offer = offers.get(saved.id);
  const chosen = saved.picks.map((pick) => ({ pick, product: byId.get(pick.productId) }));

  const pieces = chosen.map(({ pick, product }) => ({
    name: product?.name ?? "A piece that is no longer listed",
    size: pick.size
  }));

  // An offer the shop has withdrawn, a piece sold since, or a combo whose size
  // changed: any of these means it cannot be bought as it stands.
  const buyable =
    chosen.every(({ product }) => product?.inStock) &&
    (!offersLoaded || (offer !== undefined && offer.pieces === saved.picks.length));

  const price = offer?.price ?? saved.price;
  const worth = chosen.reduce((sum, { product }) => sum + (product?.price ?? 0), 0);
  const first = chosen.find(({ product }) => product)?.product;

  const product: Product = {
    id: item.productId,
    slug: "",
    name: offer?.name ?? saved.name,
    category: "combo",
    collection: `Combo · ${saved.picks.length} pieces`,
    price,
    mrp: worth > price ? worth : null,
    currency: "INR",
    image: offer?.image ?? first?.image ?? "",
    gallery: [],
    description: "",
    details: [],
    material: "",
    inStock: buyable,
    stockQuantity: null,
    lowStockThreshold: 0,
    netQuantity: null,
    featured: false,
    subcategory: null,
    colourName: null,
    colourGroup: null,
    colourHex: null,
    isNewArrival: false,
    sizes: []
  };

  return {
    product,
    quantity: item.quantity,
    size: undefined as string | undefined,
    lineTotal: price * item.quantity,
    href: "/combos",
    combo: saved as CartItem["combo"],
    bundle: pieces as { name: string; size?: string }[] | undefined,
    // What the same pieces cost one by one, for the whole line. Only when it is
    // genuinely more than the combo price: a "saving" of nothing is not shown.
    worth: worth > price ? worth * item.quantity : undefined
  };
}

/** What the server is sent for one line: a piece, or a combo and its choices. */
export function toOrderItem(line: CartLine) {
  if (line.combo) {
    return {
      productId: line.product.id,
      comboId: line.combo.id,
      picks: line.combo.picks,
      quantity: line.quantity
    };
  }
  return {
    productId: line.product.id,
    quantity: line.quantity,
    selectedSize: line.size
  };
}
