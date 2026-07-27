export type ProductCategory = "jewellery" | "watches";

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
