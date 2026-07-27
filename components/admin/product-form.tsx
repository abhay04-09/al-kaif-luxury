"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product, ProductCategory } from "@/types/product";

type ProductFormProps = {
  product?: Product;
};

const inputClass =
  "min-h-12 border border-white/10 bg-obsidian px-4 text-porcelain outline-none focus:border-gold-light";
const textareaClass =
  "min-h-32 border border-white/10 bg-obsidian px-4 py-3 text-porcelain outline-none focus:border-gold-light";

function listToText(values: string[]) {
  return values.join("\n");
}

function fallbackImage(category: ProductCategory) {
  return category === "jewellery"
    ? "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1400&q=85"
    : "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1400&q=85";
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [category, setCategory] = useState<ProductCategory>(product?.category ?? "jewellery");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setIsSaving(true);

    const image = String(formData.get("image") ?? "").trim() || fallbackImage(category);
    const gallery = String(formData.get("gallery") ?? "").trim() || image;

    const payload = {
      name: formData.get("name"),
      category,
      collection: formData.get("collection"),
      price: formData.get("price"),
      image,
      gallery,
      description: formData.get("description"),
      details: formData.get("details"),
      material: formData.get("material"),
      stock: formData.get("stock"),
      featured: formData.get("featured") === "on"
    };

    const response = await fetch(product ? `/api/products/${product.id}` : "/api/products", {
      method: product ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = (await response.json()) as {
      message?: string;
      product?: Product;
    };

    setIsSaving(false);

    if (!response.ok || !result.product) {
      setError(result.message ?? "Product could not be saved.");
      return;
    }

    router.refresh();
    router.push(product ? `/products/${result.product.slug}` : "/admin");
  }

  return (
    <form action={handleSubmit} className="mt-10 grid gap-5 border border-white/10 bg-onyx p-6">
      {error ? (
        <p className="border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}

      <label className="grid gap-2 text-sm text-porcelain/70">
        Category
        <select
          className={inputClass}
          disabled={Boolean(product)}
          onChange={(event) => setCategory(event.target.value as ProductCategory)}
          value={category}
        >
          <option value="jewellery">Jewellery</option>
          <option value="watches">Watches</option>
        </select>
      </label>

      <label className="grid gap-2 text-sm text-porcelain/70">
        Product name
        <input className={inputClass} defaultValue={product?.name} name="name" required />
      </label>

      <label className="grid gap-2 text-sm text-porcelain/70">
        Collection
        <input className={inputClass} defaultValue={product?.collection} name="collection" required />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm text-porcelain/70">
          Price in INR
          <input
            className={inputClass}
            defaultValue={product?.price}
            min="0"
            name="price"
            required
            type="number"
          />
        </label>

        <label className="grid gap-2 text-sm text-porcelain/70">
          Stock
          <input
            className={inputClass}
            defaultValue={product?.stock ?? 0}
            min="0"
            name="stock"
            required
            type="number"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm text-porcelain/70">
        Material
        <input className={inputClass} defaultValue={product?.material} name="material" required />
      </label>

      <label className="grid gap-2 text-sm text-porcelain/70">
        Main image URL
        <input className={inputClass} defaultValue={product?.image} name="image" type="text" />
      </label>

      <label className="grid gap-2 text-sm text-porcelain/70">
        Gallery image URLs
        <textarea
          className={textareaClass}
          defaultValue={product ? listToText(product.gallery) : ""}
          name="gallery"
          placeholder="One image URL per line"
        />
      </label>

      <label className="grid gap-2 text-sm text-porcelain/70">
        Description
        <textarea
          className={textareaClass}
          defaultValue={product?.description}
          name="description"
          required
        />
      </label>

      <label className="grid gap-2 text-sm text-porcelain/70">
        Details
        <textarea
          className={textareaClass}
          defaultValue={product ? listToText(product.details) : ""}
          name="details"
          placeholder="One detail per line"
        />
      </label>

      <label className="flex items-center gap-3 text-sm text-porcelain/70">
        <input
          className="h-4 w-4 accent-gold"
          defaultChecked={product?.featured}
          name="featured"
          type="checkbox"
        />
        Featured product
      </label>

      <button
        className="min-h-12 bg-gold px-6 py-3 text-[0.72rem] uppercase tracking-luxury text-obsidian transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSaving}
        type="submit"
      >
        {isSaving ? "Saving..." : product ? "Update Product" : "Save Product"}
      </button>
    </form>
  );
}
