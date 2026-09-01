import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, X, Upload, Package, Star,
  MoreHorizontal, Copy, SlidersHorizontal, ChevronLeft, ChevronRight,
  Globe, ChevronDown, Archive, ArchiveRestore,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiFetch, apiJson } from '../api';
import { Product, Category } from '../types';
import { ExportButton } from '../components/ExportButton';
import { productColumns } from '../exports';
import { StockCell } from '../components/StockCell';

/** A counted piece with stock left, but not much of it. */
const isLowStock = (p: Product) =>
  p.stockQuantity !== null &&
  p.stockQuantity !== undefined &&
  p.stockQuantity > 0 &&
  p.stockQuantity <= (p.lowStockThreshold ?? 3);

const EMPTY_FORM: Partial<Product> = {
  name: '',
  subtitle: '',
  category: 'jewellery',
  subcategory: '',
  sku: '',
  sizes: [],
  priceINR: 100000,
  image: '',
  secondaryImages: [],
  description: '',
  inStock: true,
  featured: false,
  isNewArrival: false,
};

const SORT_OPTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'alpha', label: 'A → Z' },
  { value: 'price-high', label: 'Price: high to low' },
  { value: 'price-low', label: 'Price: low to high' },
] as const;
type SortOpt = (typeof SORT_OPTS)[number]['value'];

const PER_PAGE_OPTS = [10, 25, 50] as const;

/** "3 days ago" for recent uploads, an absolute date once that stops being useful. */
function relativeDate(iso?: string | null) {
  if (!iso) return '—';
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '—';

  const days = Math.floor((Date.now() - then.getTime()) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return then.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Page buttons around the current page, with `null` standing in for a gap. */
function pageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current, current - 1, current + 1]);
  const shown = [...pages].filter(n => n >= 1 && n <= total).sort((a, b) => a - b);

  return shown.flatMap((n, i) => (i > 0 && n - shown[i - 1] > 1 ? [null, n] : [n]));
}

function exactDate(iso?: string | null) {
  if (!iso) return 'Date unknown';
  const then = new Date(iso);
  return Number.isNaN(then.getTime()) ? 'Date unknown' : then.toLocaleString('en-IN');
}

function CharBar({ count, limit }: { count: number; limit: number }) {
  const pct = Math.min((count / limit) * 100, 100);
  const isOver = count > limit;
  const isWarn = count > limit * 0.85;
  return (
    <div className="space-y-1 mt-1.5">
      <div className="h-[3px] rounded-full bg-[#1a2a1f] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${isOver ? 'bg-red-500' : isWarn ? 'bg-amber-500' : 'bg-[#C5A059]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px]">
        <span className={count === 0 ? 'text-[#3a3a3a]' : isOver ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-[#A7A7A7]'}>
          {count} / {limit}
        </span>
        {isOver ? (
          <span className="text-red-400">{count - limit} over limit</span>
        ) : count > 0 ? (
          <span className="text-[#3a3a3a]">{limit - count} remaining</span>
        ) : null}
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-[#2A2A2a]/60 animate-pulse">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xs bg-[#1a2a1f] shrink-0" />
          <div className="space-y-2">
            <div className="h-3.5 bg-[#1a2a1f] rounded w-40" />
            <div className="h-2.5 bg-[#1a2a1f] rounded w-24" />
          </div>
        </div>
      </td>
      <td className="p-4"><div className="h-5 bg-[#1a2a1f] rounded-full w-20" /></td>
      <td className="p-4"><div className="h-3.5 bg-[#1a2a1f] rounded w-20" /></td>
      <td className="p-4 hidden lg:table-cell"><div className="h-3.5 bg-[#1a2a1f] rounded w-16" /></td>
      <td className="p-4 hidden xl:table-cell"><div className="h-3.5 bg-[#1a2a1f] rounded w-20" /></td>
      <td className="p-4"><div className="h-5 bg-[#1a2a1f] rounded-full w-16" /></td>
      <td className="p-4"><div className="w-4 h-4 bg-[#1a2a1f] rounded-full ml-1" /></td>
      <td className="p-4"><div className="h-7 w-7 bg-[#1a2a1f] rounded-xs ml-auto" /></td>
    </tr>
  );
}

/** Renders the live catalogue, or the archive when `archived` is set. */
export const ProductsPage: React.FC<{ archived?: boolean }> = ({ archived = false }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // toolbar state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'out' | 'low'>('all');
  const [sortBy, setSortBy] = useState<SortOpt>('newest');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(10);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>(EMPTY_FORM);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [sizeInput, setSizeInput] = useState('');

  const addSize = () => {
    const size = sizeInput.trim();
    if (!size) return;
    if ((form.sizes ?? []).includes(size)) {
      toast.error(`"${size}" is already listed`);
      return;
    }
    setForm(f => ({ ...f, sizes: [...(f.sizes ?? []), size] }));
    setSizeInput('');
  };

  // Row action menu. The table scrolls, which clips an absolutely positioned
  // menu, so it is pinned to the viewport from the button's own rectangle.
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Roughly 42px a row: Edit / Duplicate / Archive / Delete, minus one in the archive.
  const MENU_HEIGHT = archived ? 128 : 170;

  const openMenu = (id: string, button: HTMLElement) => {
    if (menuFor === id) {
      setMenuFor(null);
      return;
    }
    const rect = button.getBoundingClientRect();
    const flipUp = rect.bottom + MENU_HEIGHT > window.innerHeight - 12;
    setMenuPos({
      top: flipUp ? rect.top - MENU_HEIGHT - 6 : rect.bottom + 6,
      right: window.innerWidth - rect.right,
    });
    setMenuFor(id);
  };

  const refresh = async () => {
    try {
      setProducts(await apiJson<Product[]>(`/api/products${archived ? '?archived=true' : ''}`));
    } catch (err: any) {
      toast.error(err?.message || 'Could not load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    apiJson<Category[]>('/api/categories').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuFor(null);
    };
    // Pinned to the viewport, so scrolling would leave it stranded.
    const dismiss = () => setMenuFor(null);
    document.addEventListener('mousedown', close);
    window.addEventListener('scroll', dismiss, true);
    window.addEventListener('resize', dismiss);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', dismiss, true);
      window.removeEventListener('resize', dismiss);
    };
  }, []);

  const selectedCategory = categories.find(c => c.id === form.category);
  const subOptions = selectedCategory?.children ?? [];

  // ── filtering / sorting / pagination ──
  const filtered = useMemo(() => {
    let list = [...products];
    if (stockFilter === 'in') list = list.filter(p => p.inStock);
    else if (stockFilter === 'out') list = list.filter(p => !p.inStock);
    else if (stockFilter === 'low') list = list.filter(p => isLowStock(p));
    if (categoryFilter !== 'all') list = list.filter(p => p.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)
      );
    }
    const uploadedAt = (p: Product) => new Date(p.createdAt ?? 0).getTime() || 0;
    if (sortBy === 'newest') list.sort((a, b) => uploadedAt(b) - uploadedAt(a));
    if (sortBy === 'oldest') list.sort((a, b) => uploadedAt(a) - uploadedAt(b));
    if (sortBy === 'alpha') list.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'price-high') list.sort((a, b) => b.priceINR - a.priceINR);
    if (sortBy === 'price-low') list.sort((a, b) => a.priceINR - b.priceINR);
    return list;
  }, [products, search, categoryFilter, stockFilter, sortBy]);

  const stockCounts = useMemo(
    () => ({
      all: products.length,
      in: products.filter(p => p.inStock).length,
      out: products.filter(p => !p.inStock).length,
      low: products.filter(p => isLowStock(p)).length,
    }),
    [products]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageSafe = Math.min(page, totalPages);
  const pageItems = filtered.slice((pageSafe - 1) * perPage, pageSafe * perPage);

  useEffect(() => { setPage(1); }, [search, categoryFilter, stockFilter, sortBy, perPage]);

  // ── actions ──
  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, category: categories[0]?.id ?? 'jewellery' });
    setIsModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ ...p, secondaryImages: p.secondaryImages ?? [] });
    setIsModalOpen(true);
    setMenuFor(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editing) {
        await apiJson(`/api/products/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
        toast.success('Product updated');
      } else {
        await apiJson('/api/products', { method: 'POST', body: JSON.stringify(form) });
        toast.success('Product created');
      }
      await refresh();
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Could not save the product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (p: Product) => {
    setMenuFor(null);
    if (!window.confirm(`Delete "${p.name}" permanently?`)) return;
    try {
      await apiJson(`/api/products/${p.id}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(x => x.id !== p.id));
      toast.success('Product deleted');
    } catch (err: any) {
      toast.error(err?.message || 'Could not delete the product');
    }
  };

  const handleArchive = async (p: Product, restore: boolean) => {
    setMenuFor(null);
    try {
      await apiJson(`/api/products/${p.id}/archive`, {
        method: 'PUT',
        body: JSON.stringify({ archived: !restore }),
      });
      // The row belongs to the other list now, so drop it from this one.
      setProducts(prev => prev.filter(x => x.id !== p.id));
      toast.success(restore ? `"${p.name}" restored to the catalogue` : `"${p.name}" archived`);
    } catch (err: any) {
      toast.error(err?.message || 'Could not update the product');
    }
  };

  const handleDuplicate = async (p: Product) => {
    setMenuFor(null);
    try {
      const copy: Partial<Product> = { ...p, name: `${p.name} (Copy)`, sku: '' };
      delete (copy as any).id;
      await apiJson('/api/products', { method: 'POST', body: JSON.stringify(copy) });
      await refresh();
      toast.success('Product duplicated');
    } catch (err: any) {
      toast.error(err?.message || 'Could not duplicate the product');
    }
  };

  const toggleFeatured = async (p: Product) => {
    const next = !p.featured;
    setProducts(prev => prev.map(x => (x.id === p.id ? { ...x, featured: next } : x)));
    try {
      await apiJson(`/api/products/${p.id}`, { method: 'PUT', body: JSON.stringify({ featured: next }) });
    } catch (err: any) {
      setProducts(prev => prev.map(x => (x.id === p.id ? { ...x, featured: !next } : x)));
      toast.error(err?.message || 'Could not update featured');
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await apiFetch('/api/uploads', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data?.error || 'Upload failed');
      return null;
    }
    return data.url as string;
  };

  const handleMainUpload = async (file: File) => {
    setIsUploading(true);
    const url = await uploadImage(file);
    if (url) setForm(f => ({ ...f, image: url }));
    setIsUploading(false);
  };

  const handleGalleryUpload = async (files: FileList | File[]) => {
    setIsUploading(true);
    for (const file of Array.from(files)) {
      const url = await uploadImage(file);
      if (url) setForm(f => ({ ...f, secondaryImages: [...(f.secondaryImages ?? []), url] }));
    }
    setIsUploading(false);
  };

  /** Pasted or dropped images fill the main slot first, then the gallery. */
  const handleDroppedImages = async (files: File[]) => {
    const images = files.filter(file => file.type.startsWith('image/'));
    if (images.length === 0) return;

    setIsUploading(true);
    let [first, ...rest] = images;

    if (!form.image) {
      const url = await uploadImage(first);
      if (url) {
        setForm(f => ({ ...f, image: url }));
        toast.success('Main image added');
      }
    } else {
      rest = images;
    }

    for (const file of rest) {
      const url = await uploadImage(file);
      if (url) {
        setForm(f => ({ ...f, secondaryImages: [...(f.secondaryImages ?? []), url] }));
        toast.success('Added to gallery');
      }
    }
    setIsUploading(false);
  };

  // Ctrl+V anywhere in the open product form uploads a copied image.
  useEffect(() => {
    if (!isModalOpen) return;

    const onPaste = (event: ClipboardEvent) => {
      const files = Array.from(event.clipboardData?.items ?? [])
        .filter(item => item.kind === 'file' && item.type.startsWith('image/'))
        .map(item => item.getAsFile())
        .filter((file): file is File => file !== null);

      if (files.length > 0) {
        event.preventDefault();
        handleDroppedImages(files);
      }
    };

    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [isModalOpen, form.image]);

  const categoryName = (id: string) => categories.find(c => c.id === id)?.name ?? id;

  // ── render ──
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-gold-gradient uppercase">
            {archived ? 'Archived' : 'Products'}
          </h1>
          <p className="text-[11px] text-[#A7A7A7] mt-1">
            {loading
              ? 'Loading…'
              : archived
                ? `${filtered.length} of ${products.length} archived — hidden from the shop`
                : `${filtered.length} of ${products.length} pieces`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <ExportButton
          rows={filtered}
          columns={productColumns}
          filename={archived ? 'al-kaif-archived-products' : 'al-kaif-products'}
          label="Export"
        />
        {!archived && (
          <button
            onClick={openAdd}
            className="px-4 py-2.5 bg-[#C5A059] text-black text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#FFD700] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        )}
        </div>
      </div>

      {/* Stock status tabs */}
      <div className="flex flex-wrap gap-2">
        {([
          { id: 'all', label: 'All' },
          { id: 'in', label: 'In stock' },
          { id: 'low', label: 'Running low' },
          { id: 'out', label: 'Out of stock' },
        ] as const).map(tab => {
          const active = stockFilter === tab.id;
          const count = stockCounts[tab.id];
          return (
            <button
              key={tab.id}
              onClick={() => setStockFilter(tab.id)}
              className={`px-3.5 py-2 text-xs uppercase tracking-wider rounded-xs border transition-colors flex items-center gap-2 ${
                active
                  ? 'bg-[#C5A059] border-[#C5A059] text-black font-semibold'
                  : 'bg-[#00140a] border-[#2A2A2a] text-[#DFC27C] hover:border-[#C5A059]'
              }`}
            >
              {tab.label}
              <span
                className={`px-1.5 py-px text-[10px] rounded-full ${
                  active
                    ? 'bg-black/20 text-black'
                    : tab.id === 'out' && count > 0
                      ? 'bg-red-500/15 text-red-400'
                      : 'bg-[#1a2a1f] text-[#A7A7A7]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="w-4 h-4 text-[#C5A059] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, SKU or subtitle..."
            className="w-full bg-[#00140a] border border-[#2A2A2a] text-xs p-2.5 pl-9 rounded-xs focus:border-[#C5A059] focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A7A7A7] hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-[#00140a] border border-[#2A2A2a] text-xs text-[#DFC27C] p-2.5 rounded-xs focus:outline-none"
        >
          <option value="all">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <div className="flex items-center gap-2 bg-[#00140a] border border-[#2A2A2a] px-3 py-2.5 rounded-xs">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#C5A059]" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOpt)}
            className="bg-transparent text-xs text-[#DFC27C] focus:outline-none cursor-pointer"
          >
            {SORT_OPTS.map(o => <option key={o.value} value={o.value} className="bg-[#00140a]">{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-[#2A2A2a] rounded-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#00140a] text-[#DFC27C] uppercase tracking-wider border-b border-[#2A2A2a]">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price (INR)</th>
              <th className="p-4 hidden lg:table-cell">SKU</th>
              <th className="p-4 hidden xl:table-cell">Added</th>
              <th className="p-4">Status</th>
              <th className="p-4">Featured</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2a] bg-[#000e07]">
            {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading && pageItems.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-14 h-14 rounded-xs bg-[#00140a] border border-[#2A2A2a] flex items-center justify-center">
                      {search || categoryFilter !== 'all' || stockFilter !== 'all'
                        ? <Search className="w-6 h-6 text-[#A7A7A7]" />
                        : archived
                          ? <Archive className="w-6 h-6 text-[#A7A7A7]" />
                          : <Package className="w-6 h-6 text-[#A7A7A7]" />}
                    </div>
                    <p className="text-white font-medium">
                      {search
                        ? `No results for "${search}"`
                        : stockFilter === 'out'
                          ? 'Nothing is out of stock'
                          : stockFilter === 'in'
                            ? 'Nothing is in stock'
                            : categoryFilter !== 'all'
                              ? 'No products in this category'
                              : archived
                                ? 'Nothing archived'
                                : 'No products yet'}
                    </p>
                    <p className="text-[#A7A7A7] text-[11px]">
                      {search || categoryFilter !== 'all' || stockFilter !== 'all'
                        ? 'Try different keywords or clear the filters.'
                        : archived
                          ? 'Archived pieces are hidden from the shop but kept here, and can be restored any time.'
                          : 'Start building your luxury catalogue.'}
                    </p>
                    {!archived && !search && categoryFilter === 'all' && stockFilter === 'all' && (
                      <button onClick={openAdd} className="mt-1 px-4 py-2 bg-[#C5A059] text-black rounded-xs font-semibold flex items-center gap-2 hover:bg-[#FFD700]">
                        <Plus className="w-3.5 h-3.5" /> Add first product
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {!loading && pageItems.map(p => (
              <tr key={p.id} className="hover:bg-[#00140a]/60 group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-11 h-11 object-cover rounded-xs border border-[#2A2A2a]" />
                    <div className="min-w-0">
                      <span className="font-serif text-white block">{p.name}</span>
                      <span className="text-[10px] text-[#A7A7A7]">{p.subtitle}</span>
                      {(p.sizes ?? []).length > 0 && (
                        <span className="flex flex-wrap gap-1 mt-1.5">
                          {(p.sizes ?? []).map(size => (
                            <span
                              key={size}
                              className="px-1.5 py-px bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#DFC27C] text-[9px] uppercase tracking-wider rounded-xs"
                            >
                              {size}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-[#DFC27C]">{categoryName(p.category)}</span>
                  {p.subcategory && (
                    <span className="block text-[10px] text-[#A7A7A7]">↳ {categoryName(p.subcategory)}</span>
                  )}
                </td>
                <td className="p-4 font-mono text-[#FFD700]">₹{p.priceINR.toLocaleString('en-IN')}</td>
                <td className="p-4 font-mono text-[#A7A7A7] hidden lg:table-cell">{p.sku || '—'}</td>
                <td className="p-4 hidden xl:table-cell text-[#A7A7A7] whitespace-nowrap" title={exactDate(p.createdAt)}>
                  {relativeDate(p.createdAt)}
                </td>
                <td className="p-4">
                  <StockCell
                    product={p}
                    onChange={patch =>
                      setProducts(prev => prev.map(x => (x.id === p.id ? { ...x, ...patch } : x)))
                    }
                  />
                </td>
                <td className="p-4">
                  <button
                    onClick={() => toggleFeatured(p)}
                    title={p.featured ? 'Remove from featured' : 'Mark as featured'}
                    className="p-1 cursor-pointer"
                  >
                    <Star className={`w-4 h-4 transition-colors ${p.featured ? 'text-[#FFD700] fill-[#FFD700]' : 'text-[#3a3a3a] hover:text-[#C5A059]'}`} />
                  </button>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={e => openMenu(p.id, e.currentTarget)}
                    aria-label={`Actions for ${p.name}`}
                    className="p-1.5 border border-[#2A2A2a] hover:border-[#C5A059] text-[#DFC27C] rounded-xs"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {menuFor === p.id && (
                    <div
                      ref={menuRef}
                      style={{ top: menuPos.top, right: menuPos.right }}
                      className="fixed z-50 w-40 bg-[#00140a] border border-[#C5A059]/50 rounded-xs shadow-2xl text-left overflow-hidden"
                    >
                      <button onClick={() => openEdit(p)} className="w-full px-4 py-2.5 text-left hover:bg-[#C5A059]/10 flex items-center gap-2 text-[#F5F2EE]">
                        <Edit2 className="w-3.5 h-3.5 text-[#DFC27C]" /> Edit
                      </button>
                      {archived ? (
                        <button onClick={() => handleArchive(p, true)} className="w-full px-4 py-2.5 text-left hover:bg-[#C5A059]/10 flex items-center gap-2 text-[#F5F2EE]">
                          <ArchiveRestore className="w-3.5 h-3.5 text-[#DFC27C]" /> Restore
                        </button>
                      ) : (
                        <>
                          <button onClick={() => handleDuplicate(p)} className="w-full px-4 py-2.5 text-left hover:bg-[#C5A059]/10 flex items-center gap-2 text-[#F5F2EE]">
                            <Copy className="w-3.5 h-3.5 text-[#DFC27C]" /> Duplicate
                          </button>
                          <button onClick={() => handleArchive(p, false)} className="w-full px-4 py-2.5 text-left hover:bg-[#C5A059]/10 flex items-center gap-2 text-[#F5F2EE]">
                            <Archive className="w-3.5 h-3.5 text-[#DFC27C]" /> Archive
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDelete(p)} className="w-full px-4 py-2.5 text-left hover:bg-red-950/40 flex items-center gap-2 text-red-300 border-t border-[#2A2A2a]">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#A7A7A7]">
          <div className="flex items-center gap-3">
            <span>
              Showing {(pageSafe - 1) * perPage + 1}–{Math.min(pageSafe * perPage, filtered.length)} of {filtered.length}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider">Per page</span>
              <select
                value={perPage}
                onChange={e => setPerPage(Number(e.target.value))}
                className="bg-[#00140a] border border-[#2A2A2a] text-[#DFC27C] px-2 py-1 rounded-xs focus:outline-none focus:border-[#C5A059] cursor-pointer"
              >
                {PER_PAGE_OPTS.map(n => <option key={n} value={n} className="bg-[#00140a]">{n}</option>)}
              </select>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={pageSafe === 1}
              aria-label="Previous page"
              className="p-2 border border-[#2A2A2a] rounded-xs hover:border-[#C5A059] disabled:opacity-30 disabled:hover:border-[#2A2A2a]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {pageNumbers(pageSafe, totalPages).map((n, i) =>
              n === null ? (
                <span key={`gap-${i}`} className="px-1.5 text-[#3a3a3a]">…</span>
              ) : (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  aria-current={n === pageSafe ? 'page' : undefined}
                  className={`min-w-8 px-2.5 py-1.5 border rounded-xs transition-colors ${
                    n === pageSafe
                      ? 'bg-[#C5A059] border-[#C5A059] text-black font-semibold'
                      : 'bg-[#00140a] border-[#2A2A2a] text-[#DFC27C] hover:border-[#C5A059]'
                  }`}
                >
                  {n}
                </button>
              )
            )}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={pageSafe === totalPages}
              aria-label="Next page"
              className="p-2 border border-[#2A2A2a] rounded-xs hover:border-[#C5A059] disabled:opacity-30 disabled:hover:border-[#2A2A2a]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#00140a] border border-[#C5A059] p-8 max-w-3xl w-full rounded-sm space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#2A2A2a]">
              <h3 className="font-serif text-xl text-gold-gradient uppercase">
                {editing ? 'Edit Product' : 'Add Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#A7A7A7] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#DFC27C] block mb-1">NAME *</label>
                  <input
                    type="text" required value={form.name || ''}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-black/60 border border-[#2A2A2a] p-2.5 rounded-xs focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#DFC27C] block mb-1">SUBTITLE / MATERIALS</label>
                  <input
                    type="text" value={form.subtitle || ''}
                    onChange={e => setForm({ ...form, subtitle: e.target.value })}
                    className="w-full bg-black/60 border border-[#2A2A2a] p-2.5 rounded-xs focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#DFC27C] block mb-1">SKU / PRODUCT CODE</label>
                <input
                  type="text"
                  value={form.sku ?? ''}
                  onChange={e => setForm({ ...form, sku: e.target.value })}
                  placeholder="e.g. ALK-EAR-001 — leave blank to generate one automatically"
                  className="w-full bg-black/60 border border-[#2A2A2a] p-2.5 rounded-xs font-mono focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#DFC27C] block mb-1">CATEGORY</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value, subcategory: '' })}
                    className="w-full bg-black/60 border border-[#2A2A2a] p-2.5 rounded-xs text-[#F5F2EE]"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    {categories.length === 0 && <option value="jewellery">Jewellery</option>}
                  </select>
                </div>
                <div>
                  <label className="text-[#DFC27C] block mb-1">SUB-CATEGORY</label>
                  <select
                    value={form.subcategory ?? ''}
                    onChange={e => setForm({ ...form, subcategory: e.target.value })}
                    disabled={subOptions.length === 0}
                    className="w-full bg-black/60 border border-[#2A2A2a] p-2.5 rounded-xs text-[#F5F2EE] disabled:opacity-50"
                  >
                    <option value="">— None —</option>
                    {subOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#DFC27C] block mb-1">PRICE (INR) *</label>
                <input
                  type="number" required value={form.priceINR ?? ''}
                  onChange={e => setForm({ ...form, priceINR: Number(e.target.value) })}
                  className="w-full bg-black/60 border border-[#2A2A2a] p-2.5 rounded-xs focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              {/* Sizes */}
              <div>
                <label className="text-[#DFC27C] block mb-1">SIZE OPTIONS</label>
                <div className="flex flex-wrap items-center gap-2">
                  {(form.sizes ?? []).map((size, i) => (
                    <span
                      key={`${size}-${i}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C5A059]/15 border border-[#C5A059]/50 text-[#FFD700] rounded-xs"
                    >
                      {size}
                      <button
                        type="button"
                        title={`Remove size ${size}`}
                        onClick={() => setForm(f => ({ ...f, sizes: (f.sizes ?? []).filter((_, j) => j !== i) }))}
                        className="text-[#DFC27C] hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={sizeInput}
                    onChange={e => setSizeInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addSize();
                      }
                    }}
                    placeholder="Type a size and press Enter"
                    className="flex-1 min-w-44 bg-black/60 border border-[#2A2A2a] p-2.5 rounded-xs focus:border-[#C5A059] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addSize}
                    className="px-3 py-2.5 border border-[#C5A059]/60 text-[#DFC27C] hover:text-[#FFD700] hover:border-[#FFD700] rounded-xs uppercase tracking-wider text-[10px]"
                  >
                    Add
                  </button>
                </div>
                <p className="mt-1.5 text-[10px] text-[#A7A7A7]">
                  Customers pick one of these on the product page, and their choice appears on the order.
                  Leave empty if the piece has no sizes.
                </p>
              </div>

              {/* Main image */}
              <div>
                <label className="text-[#DFC27C] block mb-1">MAIN IMAGE</label>
                <div className="flex items-start gap-4">
                  {form.image && (
                    <div className="relative shrink-0">
                      <img
                        src={form.image}
                        alt="Main product"
                        className="w-36 h-36 object-cover rounded-xs border border-[#2A2A2a]"
                      />
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, image: '' }))}
                        title="Remove main image"
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <label
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleDroppedImages(Array.from(e.dataTransfer.files));
                    }}
                    className={`flex-1 self-stretch min-h-36 flex flex-col items-center justify-center gap-1 p-4 border border-dashed rounded-xs cursor-pointer transition-colors ${
                      isDragging ? 'border-[#FFD700] bg-[#C5A059]/10 text-[#FFD700]' : 'border-[#C5A059]/60 hover:border-[#FFD700] text-[#DFC27C]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span>{isUploading ? 'UPLOADING…' : 'Upload photo'}</span>
                    </span>
                    <span className="text-[10px] text-[#A7A7A7]">
                      or drag an image here, or press Ctrl+V to paste
                    </span>
                    <input
                      type="file" accept="image/*" className="hidden" disabled={isUploading}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleMainUpload(f); }}
                    />
                  </label>
                </div>
                <input
                  type="text" placeholder="...or paste an image URL" value={form.image || ''}
                  onChange={e => setForm({ ...form, image: e.target.value })}
                  className="w-full mt-2 bg-black/60 border border-[#2A2A2a] p-2.5 rounded-xs font-mono text-[10px]"
                />
              </div>

              {/* Gallery */}
              <div>
                <label className="text-[#DFC27C] block mb-1">GALLERY IMAGES</label>
                <div className="flex flex-wrap gap-3">
                  {(form.secondaryImages ?? []).map((url, i) => (
                    <div key={i} className="relative">
                      <img
                        src={url}
                        alt={`Gallery ${i + 1}`}
                        className="w-24 h-24 object-cover rounded-xs border border-[#2A2A2a]"
                      />
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, secondaryImages: (f.secondaryImages ?? []).filter((_, j) => j !== i) }))}
                        title="Remove this image"
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <label
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      handleGalleryUpload(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')));
                    }}
                    className="w-24 h-24 flex flex-col items-center justify-center gap-1 border border-dashed border-[#C5A059]/60 rounded-xs cursor-pointer hover:border-[#FFD700] text-[#DFC27C]"
                    title="Click, drop images here, or paste with Ctrl+V"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-[9px] uppercase tracking-wider">Add</span>
                    <input
                      type="file" accept="image/*" multiple className="hidden" disabled={isUploading}
                      onChange={e => { if (e.target.files?.length) handleGalleryUpload(e.target.files); }}
                    />
                  </label>
                </div>
                <p className="mt-1.5 text-[10px] text-[#A7A7A7]">
                  Drop several images at once, or paste with Ctrl+V.
                </p>
              </div>

              <div>
                <label className="text-[#DFC27C] block mb-1">DESCRIPTION</label>
                <textarea
                  rows={3} value={form.description || ''}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-black/60 border border-[#2A2A2a] p-2.5 rounded-xs focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              {/* SEO section */}
              <div className="border border-[#2A2A2a] rounded-xs">
                <button
                  type="button"
                  onClick={() => setSeoOpen(o => !o)}
                  className="w-full flex items-center justify-between p-3 text-[#DFC27C] hover:text-[#FFD700]"
                >
                  <span className="flex items-center gap-2 uppercase tracking-wider">
                    <Globe className="w-4 h-4" />
                    Search Engine Listing (SEO)
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${seoOpen ? 'rotate-180' : ''}`} />
                </button>

                {seoOpen && (
                  <div className="p-4 pt-1 space-y-4 border-t border-[#2A2A2a]">
                    {/* Google preview */}
                    <div className="p-3 bg-black/50 border border-[#2A2A2a] rounded-xs space-y-0.5">
                      <span className="text-[10px] text-[#A7A7A7] uppercase tracking-wider block mb-1.5">Google preview</span>
                      <p className="text-[#8ab4f8] text-sm leading-snug line-clamp-1">
                        {form.seoTitle || (form.name ? `${form.name} | AL-KAIFF` : 'Product Name | AL-KAIFF')}
                      </p>
                      <p className="text-emerald-500 text-[10px]">al-kaiff.com › product › {form.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'your-product'}</p>
                      <p className="text-[#A7A7A7] text-[11px] leading-snug line-clamp-2">
                        {form.seoDescription || form.description || 'Add a meta description to control how this product appears in Google search results.'}
                      </p>
                    </div>

                    <div>
                      <label className="text-[#DFC27C] block mb-1">SEO TITLE</label>
                      <input
                        type="text"
                        value={form.seoTitle ?? ''}
                        onChange={e => setForm({ ...form, seoTitle: e.target.value })}
                        placeholder={form.name ? `${form.name} | AL-KAIFF` : 'e.g. Royal Diamond Necklace | AL-KAIFF'}
                        className="w-full bg-black/60 border border-[#2A2A2a] p-2.5 rounded-xs focus:border-[#C5A059] focus:outline-none"
                      />
                      <CharBar count={(form.seoTitle ?? '').length} limit={60} />
                    </div>

                    <div>
                      <label className="text-[#DFC27C] block mb-1">SEO DESCRIPTION</label>
                      <textarea
                        rows={3}
                        value={form.seoDescription ?? ''}
                        onChange={e => setForm({ ...form, seoDescription: e.target.value })}
                        placeholder="A compelling 1–2 sentence summary shown in Google search results..."
                        className="w-full bg-black/60 border border-[#2A2A2a] p-2.5 rounded-xs focus:border-[#C5A059] focus:outline-none"
                      />
                      <CharBar count={(form.seoDescription ?? '').length} limit={160} />
                    </div>

                    <div>
                      <label className="text-[#DFC27C] block mb-1">SEO KEYWORDS</label>
                      <input
                        type="text"
                        value={form.seoKeywords ?? ''}
                        onChange={e => setForm({ ...form, seoKeywords: e.target.value })}
                        placeholder="gold necklace, diamond jewellery, luxury jaipur (comma separated)"
                        className="w-full bg-black/60 border border-[#2A2A2a] p-2.5 rounded-xs focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-6 text-[#DFC27C]">
                {([
                  ['inStock', 'In Stock'],
                  ['featured', 'Featured'],
                  ['isNewArrival', 'New Arrival'],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox" checked={!!form[key]}
                      onChange={e => setForm({ ...form, [key]: e.target.checked })}
                      className="accent-[#C5A059]"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={isUploading || isSaving}
                className="w-full py-3 bg-[#C5A059] text-black font-semibold uppercase tracking-widest rounded-xs hover:bg-[#FFD700] disabled:opacity-60"
              >
                {isSaving ? 'SAVING…' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
