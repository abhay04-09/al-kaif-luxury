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
  const [image, setImage] = useState(product?.image ?? "");
  const [gallery, setGallery] = useState(product ? listToText(product.gallery) : "");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<"main" | "gallery" | null>(null);

  async function uploadImage(file: File, target: "main" | "gallery") {
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Please choose an image smaller than 10 MB.");
      return;
    }

    setError("");
    setUploadingTarget(target);

    try {
      const signatureResponse = await fetch("/api/uploads/cloudinary-signature", {
        method: "POST"
      });
      const signatureData = (await signatureResponse.json()) as {
        apiKey?: string;
        cloudName?: string;
        folder?: string;
        signature?: string;
        timestamp?: number;
        message?: string;
      };

      if (!signatureResponse.ok || !signatureData.apiKey || !signatureData.cloudName) {
        throw new Error(signatureData.message ?? "Could not prepare the image upload.");
      }

      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("api_key", signatureData.apiKey);
      uploadData.append("timestamp", String(signatureData.timestamp));
      uploadData.append("signature", signatureData.signature ?? "");
      uploadData.append("folder", signatureData.folder ?? "");

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
        { method: "POST", body: uploadData }
      );
      const uploadResult = (await uploadResponse.json()) as {
        secure_url?: string;
        error?: { message?: string };
      };

      if (!uploadResponse.ok || !uploadResult.secure_url) {
        throw new Error(uploadResult.error?.message ?? "Image upload failed.");
      }

      if (target === "main") {
        setImage(uploadResult.secure_url);
      } else {
        setGallery((current) =>
          current.trim() ? `${current.trim()}\n${uploadResult.secure_url}` : uploadResult.secure_url as string
        );
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setUploadingTarget(null);
    }
  }

  async function handleSubmit(formData: FormData) {
    setError("");
    setIsSaving(true);

    const mainImage = image.trim() || fallbackImage(category);
    const galleryImages = gallery.trim() || mainImage;

    const payload = {
      name: formData.get("name"),
      category,
      collection: formData.get("collection"),
      price: formData.get("price"),
      image: mainImage,
      gallery: galleryImages,
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
        <input className={inputClass} name="image" onChange={(event) => setImage(event.target.value)} type="text" value={image} />
      </label>

      <label className="inline-flex min-h-12 w-fit cursor-pointer items-center justify-center bg-gold px-5 py-3 text-[0.72rem] uppercase tracking-luxury text-obsidian transition hover:bg-gold-light">
        <input
          accept="image/*"
          className="sr-only"
          disabled={uploadingTarget !== null}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void uploadImage(file, "main");
            event.target.value = "";
          }}
          type="file"
        />
        {uploadingTarget === "main" ? "Uploading Image..." : "Upload Main Image"}
      </label>

      <label className="inline-flex min-h-12 w-fit cursor-pointer items-center justify-center border border-gold px-5 py-3 text-[0.72rem] uppercase tracking-luxury text-gold-light transition hover:bg-gold hover:text-obsidian">
        <input
          accept="image/*"
          capture="environment"
          className="sr-only"
          disabled={uploadingTarget !== null}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void uploadImage(file, "main");
            event.target.value = "";
          }}
          type="file"
        />
        {uploadingTarget === "main" ? "Uploading Photo..." : "Take Product Photo"}
      </label>

      {image ? (
        <div className="border border-white/10 bg-obsidian p-4">
          <p className="mb-3 text-[0.68rem] uppercase tracking-luxury text-gold-light">Main image preview</p>
          <img alt="Selected main product image" className="aspect-[4/5] w-48 object-cover" src={image} />
          <p className="mt-3 text-sm text-porcelain/65">Click Save Product or Update Product to attach this image to the product.</p>
        </div>
      ) : null}

      <label className="grid gap-2 text-sm text-porcelain/70">
        Gallery image URLs
        <textarea
          className={textareaClass}
          onChange={(event) => setGallery(event.target.value)}
          name="gallery"
          placeholder="One image URL per line"
          value={gallery}
        />
      </label>

      <label className="inline-flex min-h-12 w-fit cursor-pointer items-center justify-center border border-gold px-5 py-3 text-[0.72rem] uppercase tracking-luxury text-gold-light transition hover:bg-gold hover:text-obsidian">
        <input
          accept="image/*"
          className="sr-only"
          disabled={uploadingTarget !== null}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void uploadImage(file, "gallery");
            event.target.value = "";
          }}
          type="file"
        />
        {uploadingTarget === "gallery" ? "Uploading Image..." : "Add Gallery Image"}
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
