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
  /** Earrings, rings, bangles — what the piece actually is. */
  subcategory: string | null;
  /** What this colour is called, when the design comes in more than one. */
  colourName: string | null;
  /** The word shared by every colour of one design. */
  colourGroup: string | null;
  /** Ticked in the admin panel. The only thing that makes a card say "New". */
  isNewArrival: boolean;
  /** Selectable size options, e.g. ring sizes. Empty when the piece has no sizes. */
  sizes: string[];
};

/** "Any 4 earrings for ₹899" — set up by the shop in the admin panel. */
export type Combo = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  /** How many pieces the client chooses. */
  pieces: number;
  /** What the whole combo costs. */
  price: number;
  /** The pieces on the shelf that the client may choose from. */
  productIds: string[];
};

export type ComboPick = { productId: string; size?: string };

export type CartItem = {
  productId: string;
  quantity: number;
  size?: string;
  /**
   * Present when this line is a combo rather than a single piece. `productId`
   * then holds a made-up id for the line (see comboLineId); the real pieces are
   * in `picks`. The name and price are kept only so the bag can still be drawn
   * before the live offer has loaded — the server prices every combo itself.
   */
  combo?: {
    id: string;
    name: string;
    price: number;
    picks: ComboPick[];
  };
};
