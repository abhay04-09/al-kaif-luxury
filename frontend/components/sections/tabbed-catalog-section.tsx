"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Layers, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/types/product";

const collectionSheets = [
  { id: "necklaces", label: "Necklace Sets", subcategory: "necklaces" },
  { id: "bangles", label: "Royal Bangles", subcategory: "bangles" },
  { id: "rings", label: "Bridal Rings", subcategory: "rings" },
  { id: "earrings", label: "Earrings", subcategory: "earrings" },
  { id: "chokers", label: "Kundan Chokers", subcategory: "chokers" },
  { id: "pendants", label: "Pendant Sets", subcategory: "pendants" }
];

type TabbedCatalogSectionProps = {
  allProducts: Product[];
};

export function TabbedCatalogSection({ allProducts }: TabbedCatalogSectionProps) {
  const [activeTabId, setActiveTabId] = useState(collectionSheets[0].id);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const activeSheet = collectionSheets.find((sheet) => sheet.id === activeTabId) || collectionSheets[0];

  // Filter products for active collection sheet, or generate curated collection products capped at 20
  const filteredProducts = allProducts.filter((product) => {
    const nameLower = product.name.toLowerCase();
    const descLower = (product.description || "").toLowerCase();
    const sub = activeSheet.subcategory;

    if (sub === "necklaces") return nameLower.includes("necklace") || nameLower.includes("set") || nameLower.includes("haard");
    if (sub === "bangles") return nameLower.includes("bangle") || nameLower.includes("kada") || nameLower.includes("bracelet");
    if (sub === "rings") return nameLower.includes("ring") || descLower.includes("ring");
    if (sub === "earrings") return nameLower.includes("earring") || nameLower.includes("jhumka") || nameLower.includes("chandbali");
    if (sub === "chokers") return nameLower.includes("choker") || nameLower.includes("kundan") || descLower.includes("choker");
    if (sub === "pendants") return nameLower.includes("pendant") || nameLower.includes("locket");
    return true;
  });

  // Ensure curated list has up to 20 items per collection tab (using catalog fallback if needed)
  const curatedCollection = (filteredProducts.length >= 4 ? filteredProducts : allProducts).slice(0, 20);

  // Pagination calculation: 10 items per page (Page 1 of 2)
  const totalItems = curatedCollection.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedProducts = curatedCollection.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  function handleTabChange(id: string) {
    setActiveTabId(id);
    setCurrentPage(1);
  }

  return (
    <section className="w-full bg-white dark:bg-obsidian py-16 sm:py-24 px-3 sm:px-6 lg:px-8 border-t border-gray-100 dark:border-white/10">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-700 dark:text-gold-light" />
              <p className="text-[0.7rem] uppercase tracking-luxury text-amber-700 dark:text-gold-light font-bold">
                The Inside Sheet / 2×2 Tabbed Catalog
              </p>
            </div>
            <h2 className="mt-1 font-serif text-2xl sm:text-4xl font-bold uppercase tracking-wider text-gray-900 dark:text-porcelain">
              EXPLORE BY CATEGORY
            </h2>
          </div>

          <p className="text-xs text-gray-500 dark:text-porcelain/60">
            Select a collection tab to view 20 curated masterworks.
          </p>
        </div>

        {/* Collection Pill Tabs (Top Bar) - Horizontal Scrollable Row */}
        <div className="relative my-6 pb-2">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth">
            {collectionSheets.map((sheet) => {
              const isActive = sheet.id === activeTabId;
              return (
                <button
                  key={sheet.id}
                  onClick={() => handleTabChange(sheet.id)}
                  className={`shrink-0 rounded-full px-5 py-2.5 text-xs font-extrabold uppercase tracking-luxury transition-all duration-300 transform active:scale-95 ${
                    isActive
                      ? "bg-amber-600 dark:bg-gold text-white dark:text-obsidian shadow-lg ring-2 ring-amber-600/40 dark:ring-gold/40 scale-105"
                      : "bg-gray-100 dark:bg-onyx/80 text-gray-700 dark:text-porcelain/80 border border-gray-200 dark:border-white/10 hover:border-amber-600 dark:hover:border-gold-light hover:text-amber-700 dark:hover:text-gold-light"
                  }`}
                >
                  {sheet.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Sheet Panel with Smooth Transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTabId + "-" + currentPage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="my-6"
          >
            {/* Curated 20 Items Grid (Strict 2x2 Mobile Grid -> 4-Column Desktop) */}
            <div className="grid grid-cols-2 gap-3 p-1 sm:p-3 md:grid-cols-4 md:gap-6 items-stretch">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id + "-" + activeTabId} product={product} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Inline Pagination & Prominent "VIEW ALL" CTA Controls */}
        <div className="mt-10 border-t border-gray-200 dark:border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Page Indicators */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-onyx text-gray-700 dark:text-porcelain transition hover:border-amber-600 dark:hover:border-gold-light disabled:opacity-30"
              aria-label="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-porcelain/80">
              Page <strong className="text-gray-900 dark:text-gold-light">{currentPage}</strong> of {totalPages} ({totalItems} Items Loaded)
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-onyx text-gray-700 dark:text-porcelain transition hover:border-amber-600 dark:hover:border-gold-light disabled:opacity-30"
              aria-label="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Prominent CTA Button */}
          <Link
            href={`/products?category=jewellery`}
            className="group inline-flex items-center justify-center gap-3 rounded-full bg-amber-600 dark:bg-gold-light px-7 py-3.5 text-xs font-extrabold uppercase tracking-luxury text-white dark:text-obsidian shadow-xl hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all transform hover:scale-105 active:scale-95"
          >
            <span>VIEW ALL 20+ {activeSheet.label}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
