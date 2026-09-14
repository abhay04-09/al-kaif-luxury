// Categories are managed in the admin panel, so this is an open-ended slug
// (e.g. "jewellery", "watches", "perfumes", or anything added later).
export type ProductCategory = string;

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  collection: string;
  price: number;
  /** Listed price, struck through beside the price. Null when not discounted. */
  mrp: number | null;
  currency: "INR";
  image: string;
  gallery: string[];
  description: string;
  details: string[];
  material: string;
  /** Set from the admin panel; drives the sold-out state across the shop. */
  inStock: boolean;
  /** Pieces on the shelf. Null when the shop does not count this piece. */
  stockQuantity: number | null;
  /** At or below this, the shop shows "only N left". */
  lowStockThreshold: number;
  /** What is in the box — "1 pair", "Set of 4", "50 ml". */
  netQuantity: string | null;
  featured: boolean;
  /** Selectable size options, e.g. ring sizes. Empty when the piece has no sizes. */
  sizes: string[];
};

export type CartItem = {
  productId: string;
  quantity: number;
  size?: string;
};
