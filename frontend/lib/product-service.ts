import "server-only";
import { apiGet, type ApiCategory, type ApiProduct } from "@/lib/api";
import type { Product, ProductCategory } from "@/types/product";

// Products are managed in the AL-KAIFF admin panel and served by the
// Cloudflare Worker API. This module is the only place that talks to it.

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Turns the specifications object into the bullet list the product page renders. */
function toDetails(product: ApiProduct): string[] {
  const details: string[] = [];
  const specs = product.specifications ?? {};

  for (const [key, value] of Object.entries(specs)) {
    if (!value) continue;
    const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

    if (typeof value === "string" || typeof value === "number") {
      details.push(`${label}: ${value}`);
    } else if (typeof value === "object") {
      for (const [innerKey, innerValue] of Object.entries(value as Record<string, unknown>)) {
        if (innerValue) {
          details.push(`${innerKey.replace(/^./, (c) => c.toUpperCase())} notes: ${innerValue}`);
        }
      }
    }
  }

  if (product.artisanStory) details.push(product.artisanStory);
  if (product.sku) details.push(`SKU: ${product.sku}`);

  return details;
}

function normalize(product: ApiProduct): Product {
  const specs = (product.specifications ?? {}) as Record<string, unknown>;

  return {
    id: product.id,
    // The backend has no slug column, so derive a stable one from the name and
    // fall back to the id when a name produces nothing usable.
    slug: slugify(product.name) || product.id,
    name: product.name,
    category: product.category,
    collection: product.subtitle || product.category,
    price: Math.round(product.priceINR),
    currency: "INR",
    image: product.image,
    gallery: product.secondaryImages ?? [],
    description: product.description,
    details: toDetails(product),
    material: typeof specs.material === "string" ? specs.material : "",
    stock: product.inStock ? 99 : 0,
    featured: Boolean(product.featured),
    sizes: product.sizes ?? []
  };
}

async function fetchProducts(category?: ProductCategory, subcategory?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (subcategory) params.set("subcategory", subcategory);
  const query = params.toString();

  const products = await apiGet<ApiProduct[]>(`/api/products${query ? `?${query}` : ""}`);
  if (!products) return [];
  return products.map(normalize);
}

export async function getStoreProducts(
  category?: ProductCategory,
  subcategory?: string
): Promise<Product[]> {
  return fetchProducts(category, subcategory);
}

export async function getFeaturedStoreProducts(): Promise<Product[]> {
  const products = await fetchProducts();
  const featured = products.filter((product) => product.featured);
  // If nothing is flagged as featured yet, show the newest pieces instead of an empty row.
  return featured.length > 0 ? featured : products.slice(0, 4);
}

export async function getStoreProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await fetchProducts();
  return products.find((product) => product.slug === slug);
}

export async function getStoreProductById(id: string): Promise<Product | undefined> {
  const product = await apiGet<ApiProduct>(`/api/products/${id}`);
  return product ? normalize(product) : undefined;
}

/** Top-level categories (with their sub-categories) as configured in the admin panel. */
export async function getStoreCategories(): Promise<ApiCategory[]> {
  return (await apiGet<ApiCategory[]>("/api/categories")) ?? [];
}
