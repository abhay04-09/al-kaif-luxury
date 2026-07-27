import "server-only";
import { prisma } from "@/lib/prisma";
import { products as fallbackProducts } from "@/lib/products";
import type { Product, ProductCategory } from "@/types/product";

type DbProduct = {
  id: string;
  slug: string;
  name: string;
  collection: string;
  price: number;
  currency: string;
  image: string;
  gallery: string[];
  description: string;
  details: string[];
  material: string;
  stock: number;
  featured: boolean;
};

export type ProductInput = {
  name: string;
  category: ProductCategory;
  collection: string;
  price: number;
  image: string;
  gallery: string[];
  description: string;
  details: string[];
  material: string;
  stock: number;
  featured: boolean;
};

function normalizeProduct(product: DbProduct, category: ProductCategory): Product {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category,
    collection: product.collection,
    price: product.price,
    currency: "INR",
    image: product.image,
    gallery: product.gallery,
    description: product.description,
    details: product.details,
    material: product.material,
    stock: product.stock,
    featured: product.featured
  };
}

function sortProducts(products: Product[]) {
  return products.sort((first, second) => first.name.localeCompare(second.name));
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function createUniqueSlug(name: string, category: ProductCategory, ignoredProductId?: string) {
  const baseSlug = slugify(name) || "al-kaif-product";
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const existing =
      category === "jewellery"
        ? await prisma.jewelleryProduct.findUnique({ where: { slug } })
        : await prisma.watchProduct.findUnique({ where: { slug } });

    if (!existing || existing.id === ignoredProductId) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

export async function getStoreProducts(category?: ProductCategory): Promise<Product[]> {
  if (!process.env.DATABASE_URL) {
    return fallbackProducts.filter((product) => !category || product.category === category);
  }

  try {
    if (category === "jewellery") {
      const jewellery = await prisma.jewelleryProduct.findMany({ orderBy: { createdAt: "desc" } });
      return jewellery.map((product) => normalizeProduct(product, "jewellery"));
    }

    if (category === "watches") {
      const watches = await prisma.watchProduct.findMany({ orderBy: { createdAt: "desc" } });
      return watches.map((product) => normalizeProduct(product, "watches"));
    }

    const [jewellery, watches] = await Promise.all([
      prisma.jewelleryProduct.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.watchProduct.findMany({ orderBy: { createdAt: "desc" } })
    ]);

    return sortProducts([
      ...jewellery.map((product) => normalizeProduct(product, "jewellery")),
      ...watches.map((product) => normalizeProduct(product, "watches"))
    ]);
  } catch (error) {
    console.warn("Using fallback products because database products could not load.", error);
    return fallbackProducts.filter((product) => !category || product.category === category);
  }
}

export async function getFeaturedStoreProducts(): Promise<Product[]> {
  const products = await getStoreProducts();
  return products.filter((product) => product.featured);
}

export async function getStoreProductBySlug(slug: string): Promise<Product | undefined> {
  if (!process.env.DATABASE_URL) {
    return fallbackProducts.find((product) => product.slug === slug);
  }

  try {
    const jewellery = await prisma.jewelleryProduct.findUnique({ where: { slug } });

    if (jewellery) {
      return normalizeProduct(jewellery, "jewellery");
    }

    const watch = await prisma.watchProduct.findUnique({ where: { slug } });

    if (watch) {
      return normalizeProduct(watch, "watches");
    }
  } catch (error) {
    console.warn("Using fallback product because database product could not load.", error);
  }

  return fallbackProducts.find((product) => product.slug === slug);
}

export async function getStoreProductById(id: string): Promise<Product | undefined> {
  if (!process.env.DATABASE_URL) {
    return fallbackProducts.find((product) => product.id === id);
  }

  try {
    const jewellery = await prisma.jewelleryProduct.findUnique({ where: { id } });

    if (jewellery) {
      return normalizeProduct(jewellery, "jewellery");
    }

    const watch = await prisma.watchProduct.findUnique({ where: { id } });

    if (watch) {
      return normalizeProduct(watch, "watches");
    }
  } catch (error) {
    console.warn("Using fallback product because database product could not load.", error);
  }

  return fallbackProducts.find((product) => product.id === id);
}

export async function createStoreProduct(input: ProductInput): Promise<Product> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required before products can be saved.");
  }

  const slug = await createUniqueSlug(input.name, input.category);
  const data = {
    slug,
    name: input.name,
    collection: input.collection,
    price: input.price,
    currency: "INR",
    image: input.image,
    gallery: input.gallery,
    description: input.description,
    details: input.details,
    material: input.material,
    stock: input.stock,
    featured: input.featured
  };

  if (input.category === "jewellery") {
    const product = await prisma.jewelleryProduct.create({ data });
    return normalizeProduct(product, "jewellery");
  }

  const product = await prisma.watchProduct.create({ data });
  return normalizeProduct(product, "watches");
}

export async function updateStoreProduct(id: string, input: ProductInput): Promise<Product> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required before products can be saved.");
  }
  
  const existing = await getStoreProductById(id);

  if (!existing) {
    throw new Error("Product not found.");
  }

  if (existing.category !== input.category) {
    throw new Error("Product category cannot be changed after creation.");
  }

  const slug =
    existing.name === input.name
      ? existing.slug
      : await createUniqueSlug(input.name, input.category, id);
  const data = {
    slug,
    name: input.name,
    collection: input.collection,
    price: input.price,
    currency: "INR",
    image: input.image,
    gallery: input.gallery,
    description: input.description,
    details: input.details,
    material: input.material,
    stock: input.stock,
    featured: input.featured
  };

  if (input.category === "jewellery") {
    const product = await prisma.jewelleryProduct.update({ where: { id }, data });
    return normalizeProduct(product, "jewellery");
  }

  const product = await prisma.watchProduct.update({ where: { id }, data });
  return normalizeProduct(product, "watches");
}
export async function deleteStoreProduct(id: string): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required before products can be deleted.");
  }

  const existing = await getStoreProductById(id);

  if (!existing) {
    throw new Error("Product not found.");
  }

  if (existing.category === "jewellery") {
    await prisma.jewelleryProduct.delete({
      where: { id }
    });
    return;
  }

  await prisma.watchProduct.delete({
    where: { id }
  });
}