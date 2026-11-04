"use client";

import { useEffect, useState } from "react";
import { API_BASE, type ApiCombo, type ApiProduct } from "@/lib/api";
import { toCombo } from "@/lib/combos";
import { slugify, slugsById } from "@/lib/slug";
import type { Combo, Product } from "@/types/product";

function normalize(product: ApiProduct, slug?: string): Product {
  const specs = (product.specifications ?? {}) as Record<string, unknown>;

  return {
    id: product.id,
    slug: slug ?? (slugify(product.name) || product.id),
    name: product.name,
    category: product.category,
    collection: product.subtitle || product.category,
    price: Math.round(product.priceINR),
    // Only a genuine reduction is carried through; anything at or below the
    // selling price would print a strikethrough that says nothing.
    mrp:
      product.mrpINR && product.mrpINR > product.priceINR
        ? Math.round(product.mrpINR)
        : null,
    currency: "INR",
    image: product.image,
    gallery: product.secondaryImages ?? [],
    description: product.description,
    details: [],
    material: typeof specs.material === "string" ? specs.material : "",
    inStock: product.inStock ?? true,
    stockQuantity:
      product.stockQuantity === null || product.stockQuantity === undefined
        ? null
        : Number(product.stockQuantity),
    lowStockThreshold: product.lowStockThreshold ?? 3,
    netQuantity: product.netQuantity ?? null,
    featured: Boolean(product.featured),
    subcategory: product.subcategory?.trim() || null,
    colourName: product.colourName?.trim() || null,
    colourGroup: product.colourGroup?.trim() || null,
    colourHex: /^#[0-9a-f]{6}$/i.test(product.colourHex ?? "") ? product.colourHex! : null,
    isNewArrival: Boolean(product.isNewArrival),
    sizes: product.sizes ?? []
  };
}

/**
 * Loads the live catalogue in client components (cart, checkout).
 *
 * `combos` is null until the live offers have arrived, and stays null if they
 * cannot be reached — a bag holding a combo is then drawn from what was saved
 * with it, and the server has the final say at checkout either way.
 */
export function useCatalogue() {
  const [catalogue, setCatalogue] = useState<Product[]>([]);
  const [combos, setCombos] = useState<Combo[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const products = fetch(`${API_BASE}/api/products`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ApiProduct[]) => {
        if (cancelled || !Array.isArray(data)) return;
        const slugs = slugsById(data);
        setCatalogue(data.map((product) => normalize(product, slugs.get(product.id))));
      })
      .catch(() => undefined);

    // Offers load alongside the catalogue but never hold it up: a shop with no
    // combos, or a Worker that has not been given the table yet, answers with
    // an error here and the rest of the bag carries on.
    const offers = fetch(`${API_BASE}/api/combos`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ApiCombo[] | null) => {
        if (!cancelled && Array.isArray(data)) setCombos(data.map(toCombo));
      })
      .catch(() => undefined);

    Promise.all([products, offers]).finally(() => {
      if (!cancelled) setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { catalogue, combos, isLoading };
}
