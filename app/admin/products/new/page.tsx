import { ProductForm } from "@/components/admin/product-form";
import { Navbar } from "@/components/layout/navbar";

export default function NewProductPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-3xl px-5 pb-24 pt-36 sm:px-8 lg:px-10">
        <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">Admin</p>
        <h1 className="mt-4 font-serif text-5xl text-porcelain">Add Product</h1>
        <ProductForm />
      </main>
    </>
  );
}
