import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, X, Upload, Package, Star,
  MoreHorizontal, Copy, SlidersHorizontal, ChevronLeft, ChevronRight,
  Globe, ChevronDown,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiFetch, apiJson } from '../api';
import { Product, Category } from '../types';

const EMPTY_FORM: Partial<Product> = {
  name: '',
  subtitle: '',
  category: 'jewellery',
  subcategory: '',
  priceINR: 100000,
  priceUSD: 1200,
  image: '',
  secondaryImages: [],
  description: '',
  inStock: true,
  featured: false,
  isNewArrival: false,
};

const SORT_OPTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'alpha', label: 'A → Z' },
  { value: 'price-high', label: 'Price: high to low' },
  { value: 'price-low', label: 'Price: low to high' },
] as const;
type SortOpt = (typeof SORT_OPTS)[number]['value'];

const PER_PAGE = 10;

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
      <td className="p-4"><div className="h-5 bg-[#1a2a1f] rounded-full w-16" /></td>
      <td className="p-4"><div className="w-4 h-4 bg-[#1a2a1f] rounded-full ml-1" /></td>
      <td className="p-4"><div className="h-7 w-7 bg-[#1a2a1f] rounded-xs ml-auto" /></td>
    </tr>
  );
}

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // toolbar state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOpt>('newest');
  const [page, setPage] = useState(1);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>(EMPTY_FORM);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // row action menu
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const refresh = async () => {
    try {
      setProducts(await apiJson<Product[]>('/api/products'));
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
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const selectedCategory = categories.find(c => c.id === form.category);
  const subOptions = selectedCategory?.children ?? [];

  // ── filtering / sorting / pagination ──
  const filtered = useMemo(() => {
    let list = [...products];
    if (categoryFilter !== 'all') list = list.filter(p => p.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'alpha') list.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'price-high') list.sort((a, b) => b.priceINR - a.priceINR);
    if (sortBy === 'price-low') list.sort((a, b) => a.priceINR - b.priceINR);
    return list;
  }, [products, search, categoryFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageSafe = Math.min(page, totalPages);
  const pageItems = filtered.slice((pageSafe - 1) * PER_PAGE, pageSafe * PER_PAGE);

  useEffect(() => { setPage(1); }, [search, categoryFilter, sortBy]);

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
          <h1 className="font-serif text-2xl text-gold-gradient uppercase">Products</h1>
          <p className="text-[11px] text-[#A7A7A7] mt-1">
            {loading ? 'Loading…' : `${filtered.length} of ${products.length} pieces`}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2.5 bg-[#C5A059] text-black text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#FFD700] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
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
              <th className="p-4">Status</th>
              <th className="p-4">Featured</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2a] bg-[#000e07]">
            {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading && pageItems.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-14 h-14 rounded-xs bg-[#00140a] border border-[#2A2A2a] flex items-center justify-center">
                      {search || categoryFilter !== 'all'
                        ? <Search className="w-6 h-6 text-[#A7A7A7]" />
                        : <Package className="w-6 h-6 text-[#A7A7A7]" />}
                    </div>
                    <p className="text-white font-medium">
                      {search
                        ? `No results for "${search}"`
                        : categoryFilter !== 'all'
                          ? 'No products in this category'
                          : 'No products yet'}
                    </p>
                    <p className="text-[#A7A7A7] text-[11px]">
                      {search || categoryFilter !== 'all' ? 'Try different keywords or clear the filters.' : 'Start building your luxury catalogue.'}
                    </p>
                    {!search && categoryFilter === 'all' && (
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
                    <div>
                      <span className="font-serif text-white block">{p.name}</span>
                      <span className="text-[10px] text-[#A7A7A7]">{p.subtitle}</span>
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
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] rounded-full border ${
                    p.inStock
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                      : 'bg-red-950/60 text-red-400 border-red-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${p.inStock ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    {p.inStock ? 'In stock' : 'Out of stock'}
                  </span>
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
                <td className="p-4 text-right relative">
                  <button
                    onClick={() => setMenuFor(menuFor === p.id ? null : p.id)}
                    className="p-1.5 border border-[#2A2A2a] hover:border-[#C5A059] text-[#DFC27C] rounded-xs"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {menuFor === p.id && (
                    <div
                      ref={menuRef}
                      className="absolute right-4 top-12 z-20 w-40 bg-[#00140a] border border-[#C5A059]/50 rounded-xs shadow-2xl text-left overflow-hidden"
                    >
                      <button onClick={() => openEdit(p)} className="w-full px-4 py-2.5 text-left hover:bg-[#C5A059]/10 flex items-center gap-2 text-[#F5F2EE]">
                        <Edit2 className="w-3.5 h-3.5 text-[#DFC27C]" /> Edit
                      </button>
                      <button onClick={() => handleDuplicate(p)} className="w-full px-4 py-2.5 text-left hover:bg-[#C5A059]/10 flex items-center gap-2 text-[#F5F2EE]">
                        <Copy className="w-3.5 h-3.5 text-[#DFC27C]" /> Duplicate
                      </button>
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
      {!loading && filtered.length > PER_PAGE && (
        <div className="flex items-center justify-between text-xs text-[#A7A7A7]">
          <span>
            Showing {(pageSafe - 1) * PER_PAGE + 1}–{Math.min(pageSafe * PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={pageSafe === 1}
              className="p-2 border border-[#2A2A2a] rounded-xs hover:border-[#C5A059] disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1.5 bg-[#00140a] border border-[#2A2A2a] rounded-xs text-[#DFC27C]">
              {pageSafe} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={pageSafe === totalPages}
              className="p-2 border border-[#2A2A2a] rounded-xs hover:border-[#C5A059] disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#00140a] border border-[#C5A059] p-8 max-w-2xl w-full rounded-sm space-y-4 max-h-[92vh] overflow-y-auto">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#DFC27C] block mb-1">PRICE (INR) *</label>
                  <input
                    type="number" required value={form.priceINR ?? ''}
                    onChange={e => setForm({ ...form, priceINR: Number(e.target.value) })}
                    className="w-full bg-black/60 border border-[#2A2A2a] p-2.5 rounded-xs focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#DFC27C] block mb-1">PRICE (USD) *</label>
                  <input
                    type="number" required value={form.priceUSD ?? ''}
                    onChange={e => setForm({ ...form, priceUSD: Number(e.target.value) })}
                    className="w-full bg-black/60 border border-[#2A2A2a] p-2.5 rounded-xs focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
              </div>

              {/* Main image */}
              <div>
                <label className="text-[#DFC27C] block mb-1">MAIN IMAGE</label>
                <div className="flex items-center gap-3">
                  {form.image && (
                    <img src={form.image} alt="Preview" className="w-14 h-14 object-cover rounded-xs border border-[#2A2A2a]" />
                  )}
                  <label
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleDroppedImages(Array.from(e.dataTransfer.files));
                    }}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 p-4 border border-dashed rounded-xs cursor-pointer transition-colors ${
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
                <div className="flex flex-wrap gap-2">
                  {(form.secondaryImages ?? []).map((url, i) => (
                    <div key={i} className="relative group/img">
                      <img src={url} alt={`Gallery ${i + 1}`} className="w-14 h-14 object-cover rounded-xs border border-[#2A2A2a]" />
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, secondaryImages: (f.secondaryImages ?? []).filter((_, j) => j !== i) }))}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white rounded-full items-center justify-center hidden group-hover/img:flex"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                  <label
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      handleGalleryUpload(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')));
                    }}
                    className="w-14 h-14 flex items-center justify-center border border-dashed border-[#C5A059]/60 rounded-xs cursor-pointer hover:border-[#FFD700] text-[#DFC27C]"
                    title="Click, drop images here, or paste with Ctrl+V"
                  >
                    <Plus className="w-4 h-4" />
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
