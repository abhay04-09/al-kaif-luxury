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
  currency: "INR";
  image: string;
  gallery: string[];
  description: string;
  details: string[];
  material: string;
  stock: number;
  featured: boolean;
};

export type CartItem = {
  productId: string;
  quantity: number;
};
