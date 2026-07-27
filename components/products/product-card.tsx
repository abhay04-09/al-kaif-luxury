import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/products";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group">
      <Link
        className="block overflow-hidden border border-white/10 bg-onyx"
        href={`/products/${product.slug}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            alt={product.name}
            className="object-cover transition duration-700 group-hover:scale-105"
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            src={product.image}
          />
          <div className="absolute left-4 top-4 bg-obsidian/80 px-3 py-2 text-[0.64rem] uppercase tracking-luxury text-porcelain backdrop-blur">
            {product.category}
          </div>
        </div>
        <div className="space-y-3 p-5">
          <div>
            <p className="text-xs uppercase tracking-luxury text-gold-light">
              {product.collection}
            </p>
            <h3 className="mt-2 font-serif text-2xl text-porcelain">{product.name}</h3>
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-porcelain/78">{formatPrice(product.price)}</p>
            <span className="inline-flex h-10 w-10 items-center justify-center border border-white/10 text-gold-light transition group-hover:border-gold-light group-hover:bg-gold group-hover:text-obsidian">
              <ShoppingBag aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
