"use client";

import { useEffect, useState } from "react";
import { API_BASE, type ApiProduct } from "@/lib/api";
import type { Product } from "@/types/product";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalize(product: ApiProduct): Product {
  const specs = (product.specifications ?? {}) as Record<string, unknown>;

  return {
    id: product.id,
    slug: slugify(product.name) || product.id,
    name: product.name,
    category: product.category,
    collection: product.subtitle || product.category,
    price: Math.round(product.priceINR),
    currency: "INR",
    image: product.image,
    gallery: product.secondaryImages ?? [],
    description: product.description,
    details: [],
    material: typeof specs.material === "string" ? specs.material : "",
    stock: product.inStock ? 99 : 0,
    featured: Boolean(product.featured)
  };
}

/** Loads the live catalogue in client components (cart, checkout). */
export function useCatalogue() {
  const [catalogue, setCatalogue] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE}/api/products`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ApiProduct[]) => {
        if (!cancelled && Array.isArray(data)) setCatalogue(data.map(normalize));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { catalogue, isLoading };
}
