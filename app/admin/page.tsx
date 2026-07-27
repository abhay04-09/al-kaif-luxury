import Link from "next/link";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { Navbar } from "@/components/layout/navbar";
import { getStoreProducts } from "@/lib/product-service";

export default async function AdminPage() {
  const products = await getStoreProducts();
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const jewelleryCount = products.filter((product) => product.category === "jewellery").length;
  const watchCount = products.filter((product) => product.category === "watches").length;

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-7xl px-5 pb-24 pt-36 sm:px-8 lg:px-10">
        <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">Admin</p>

        <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-serif text-5xl text-porcelain">Dashboard</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-porcelain/70">
              Product management is now structured for separate jewellery and watch tables inside the same PostgreSQL database.
            </p>
          </div>

          <Link
            className="inline-flex min-h-12 items-center justify-center bg-gold px-6 py-3 text-[0.72rem] uppercase tracking-luxury text-obsidian transition hover:bg-gold-light"
            href="/admin/products/new"
          >
            Add Product
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-4">
          <div className="border border-white/10 bg-onyx p-6">
            <p className="text-sm text-porcelain/60">Products</p>
            <p className="mt-3 font-serif text-5xl text-porcelain">{products.length}</p>
          </div>

          <div className="border border-white/10 bg-onyx p-6">
            <p className="text-sm text-porcelain/60">Jewellery</p>
            <p className="mt-3 font-serif text-5xl text-porcelain">{jewelleryCount}</p>
          </div>

          <div className="border border-white/10 bg-onyx p-6">
            <p className="text-sm text-porcelain/60">Watches</p>
            <p className="mt-3 font-serif text-5xl text-porcelain">{watchCount}</p>
          </div>

          <div className="border border-white/10 bg-onyx p-6">
            <p className="text-sm text-porcelain/60">Stock Units</p>
            <p className="mt-3 font-serif text-5xl text-porcelain">{totalStock}</p>
          </div>
        </div>

        <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {products.map((product) => (
            <div className="grid gap-3 py-5 md:grid-cols-[1fr_auto_auto_auto]" key={product.id}>
              <div>
                <p className="font-serif text-2xl text-porcelain">{product.name}</p>
                <p className="text-sm text-porcelain/60">{product.collection}</p>
              </div>

              <p className="text-sm capitalize text-gold-light">{product.category}</p>

              <p className="text-sm text-porcelain/70">Stock: {product.stock}</p>

              <div className="flex items-center gap-4">
                <Link
                  className="text-sm text-gold-light hover:text-porcelain"
                  href={`/admin/products/${product.id}/edit`}
                >
                  Edit
                </Link>

                <DeleteProductButton productId={product.id} productName={product.name} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
    