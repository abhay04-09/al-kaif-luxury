import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { Navbar } from "@/components/layout/navbar";
import { getStoreProductById } from "@/lib/product-service";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await getStoreProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-3xl px-5 pb-24 pt-36 sm:px-8 lg:px-10">
        <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">
          Admin / {product.category}
        </p>
        <h1 className="mt-4 font-serif text-5xl text-porcelain">Edit Product</h1>
        <ProductForm product={product} />
      </main>
    </>
  );
}
