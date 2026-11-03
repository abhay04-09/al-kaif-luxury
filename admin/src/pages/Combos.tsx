import React, { useEffect, useMemo, useState } from 'react';
import {
  Loader2, Plus, Pencil, Trash2, Copy, X, Search, Eye, EyeOff, AlertTriangle, ImagePlus,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiFetch, apiJson } from '../api';
import { makeVariants } from '../lib/make-variants';
import { Category, Combo, Product } from '../types';

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

type Form = {
  name: string;
  description: string;
  image: string | null;
  pieces: string;
  priceINR: string;
  categories: string[];
  productIds: string[];
  active: boolean;
  sort: string;
};

const BLANK: Form = {
  name: '', description: '', image: null, pieces: '4', priceINR: '',
  categories: [], productIds: [], active: true, sort: '0',
};

/**
 * Combo offers: "any 4 earrings for ₹899".
 *
 * The shop decides how many pieces, what they cost together, and what the
 * client may choose from — whole categories, single pieces, or both. Nothing
 * here needs a developer: a new offer is live on the website as soon as it is
 * saved, and switching it off takes it down just as quickly.
 */
export const CombosPage: React.FC = () => {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Combo | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(BLANK);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      const [list, cats] = await Promise.all([
        apiJson<Combo[]>('/api/combos/admin'),
        apiJson<Category[]>('/api/categories'),
      ]);
      setCombos(list);
      setCategories(cats);
    } catch (err: any) {
      toast.error(err?.message || 'Could not load the combos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const nameOf = useMemo(() => {
    const map = new Map<string, string>();
    for (const top of categories) {
      map.set(top.id, top.name);
      for (const child of top.children ?? []) map.set(child.id, child.name);
    }
    return (id: string) => map.get(id) ?? id;
  }, [categories]);

  const startNew = () => {
    setEditing(null);
    setForm(BLANK);
    setOpen(true);
  };

  const startEdit = (combo: Combo, copy = false) => {
    setEditing(copy ? null : combo);
    setForm({
      name: copy ? `${combo.name} (copy)` : combo.name,
      description: combo.description ?? '',
      image: combo.image,
      pieces: String(combo.pieces),
      priceINR: String(combo.priceINR),
      categories: combo.categories,
      productIds: combo.productIds,
      // A copy starts hidden, so it can be finished before anyone sees it.
      active: copy ? false : combo.active,
      sort: String(combo.sort ?? 0),
    });
    setOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.categories.length === 0 && form.productIds.length === 0) {
      toast.error('Choose at least one category or one piece for the client to pick from');
      return;
    }
    setSaving(true);
    try {
      const body = JSON.stringify({
        name: form.name,
        description: form.description,
        image: form.image,
        pieces: Number(form.pieces),
        priceINR: Number(form.priceINR),
        categories: form.categories,
        productIds: form.productIds,
        active: form.active,
        sort: Number(form.sort) || 0,
      });
      if (editing) {
        await apiJson(`/api/combos/${editing.id}`, { method: 'PUT', body });
      } else {
        await apiJson('/api/combos', { method: 'POST', body });
      }
      toast.success(editing ? 'Combo saved' : 'Combo created');
      setOpen(false);
      await load();
    } catch (err: any) {
      toast.error(err?.message || 'Could not save the combo');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (combo: Combo) => {
    try {
      await apiJson(`/api/combos/${combo.id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: !combo.active }),
      });
      toast.success(combo.active ? 'Hidden from the website' : 'Now showing on the website');
      await load();
    } catch (err: any) {
      toast.error(err?.message || 'Could not update');
    }
  };

  const remove = async (combo: Combo) => {
    if (!window.confirm(`Delete "${combo.name}"? Anything already in a client's bag can no longer be bought. This cannot be undone.`)) return;
    try {
      await apiJson(`/api/combos/${combo.id}`, { method: 'DELETE' });
      toast.success('Combo deleted');
      await load();
    } catch (err: any) {
      toast.error(err?.message || 'Could not delete');
    }
  };

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiFetch('/api/uploads', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Upload failed');
      await makeVariants(file, data.url as string);
      setForm(f => ({ ...f, image: data.url as string }));
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-[#6B7280] text-sm">
        <Loader2 className="w-4 h-4 animate-spin text-[#B8860B]" /> Loading…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-gold-gradient uppercase">Combo Offers</h1>
          <p className="text-[11px] text-[#6B7280] mt-1 max-w-xl">
            Set how many pieces, the price for the lot, and what the client may choose from.
            Changes go live on the website as soon as they are saved.
          </p>
        </div>
        <button
          onClick={startNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#B8860B] text-black text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-[#996515] hover:text-white"
        >
          <Plus className="w-4 h-4" /> New combo
        </button>
      </div>

      {combos.length === 0 ? (
        <div className="p-10 text-center border border-[#EAE5D9] rounded-xs text-[#6B7280] text-sm">
          No combos yet. Create one, for example “Any 4 earrings for ₹899”.
        </div>
      ) : (
        <div className="space-y-3">
          {combos.map(combo => {
            const short = (combo.available ?? 0) < combo.pieces;
            const loss =
              combo.cheapestWorthINR != null && combo.cheapestWorthINR < combo.priceINR;
            return (
              <div
                key={combo.id}
                className={`p-4 bg-white border rounded-xs ${combo.active ? 'border-[#EAE5D9]' : 'border-[#EAE5D9] opacity-60'}`}
              >
                <div className="flex items-start gap-4">
                  {combo.image ? (
                    <img src={combo.image} alt="" className="w-16 h-16 object-cover rounded-xs border border-[#EAE5D9] shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xs border border-dashed border-[#EAE5D9] shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-[#18181B] text-sm font-medium">{combo.name}</span>
                      <span className="text-[#996515] text-xs font-semibold">
                        Any {combo.pieces} for {inr(combo.priceINR)}
                      </span>
                      {!combo.active && (
                        <span className="text-[10px] uppercase tracking-wider text-[#6B7280]">Hidden</span>
                      )}
                    </div>

                    <p className="text-[11px] text-[#6B7280] mt-1">
                      Choose from:{' '}
                      {[
                        ...combo.categories.map(nameOf),
                        ...(combo.productIds.length ? [`${combo.productIds.length} chosen piece${combo.productIds.length === 1 ? '' : 's'}`] : []),
                      ].join(' · ') || 'nothing yet'}
                      {' — '}
                      {combo.available ?? 0} in stock
                    </p>

                    {combo.active && short && (
                      <p className="mt-2 flex items-start gap-1.5 text-[11px] text-red-700">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        Not showing on the website: it asks for {combo.pieces} pieces but only {combo.available ?? 0} are in stock.
                      </p>
                    )}
                    {loss && (
                      <p className="mt-2 flex items-start gap-1.5 text-[11px] text-amber-700">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        The {combo.pieces} cheapest pieces here cost {inr(combo.cheapestWorthINR!)} separately — less than the combo price, so a client choosing those would pay more than buying them one by one.
                      </p>
                    )}
                    {!short && !loss && combo.dearestWorthINR != null && (
                      <p className="mt-1 text-[11px] text-[#6B7280]">
                        Worth {inr(combo.cheapestWorthINR!)} to {inr(combo.dearestWorthINR)} depending on what is chosen.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleActive(combo)}
                      title={combo.active ? 'Hide from the website' : 'Show on the website'}
                      className="p-2 border border-[#EAE5D9] rounded-xs text-[#996515] hover:border-[#B8860B]"
                    >
                      {combo.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => startEdit(combo)}
                      title="Edit"
                      className="p-2 border border-[#EAE5D9] rounded-xs text-[#996515] hover:border-[#B8860B]"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => startEdit(combo, true)}
                      title="Duplicate"
                      className="p-2 border border-[#EAE5D9] rounded-xs text-[#996515] hover:border-[#B8860B]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => remove(combo)}
                      title="Delete"
                      className="p-2 border border-[#EAE5D9] rounded-xs text-red-700 hover:border-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <ComboForm
          form={form}
          setForm={setForm}
          categories={categories}
          editing={!!editing}
          saving={saving}
          uploading={uploading}
          onUpload={upload}
          onSave={save}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
};

const input =
  'w-full bg-[#FBF9F5] border border-[#EAE5D9] p-2.5 rounded-xs focus:border-[#B8860B] focus:outline-none';

const ComboForm: React.FC<{
  form: Form;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
  categories: Category[];
  editing: boolean;
  saving: boolean;
  uploading: boolean;
  onUpload: (file: File) => void;
  onSave: (event: React.FormEvent) => void;
  onClose: () => void;
}> = ({ form, setForm, categories, editing, saving, uploading, onUpload, onSave, onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');

  // Only needed for hand-picking, so it is fetched when the form opens.
  useEffect(() => {
    apiJson<Product[]>('/api/products').then(setProducts).catch(() => {});
  }, []);

  const byId = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(p => !form.productIds.includes(p.id) && `${p.name} ${p.sku}`.toLowerCase().includes(q))
      .slice(0, 12);
  }, [products, query, form.productIds]);

  const toggleCategory = (id: string) =>
    setForm(f => ({
      ...f,
      categories: f.categories.includes(id) ? f.categories.filter(c => c !== id) : [...f.categories, id],
    }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <div className="bg-white border border-[#B8860B] p-8 max-w-2xl w-full rounded-sm space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-[#EAE5D9]">
          <h3 className="font-serif text-xl text-gold-gradient uppercase">
            {editing ? 'Edit combo' : 'New combo'}
          </h3>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#18181B]"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={onSave} className="space-y-4 text-xs">
          <div>
            <label className="text-[#996515] block mb-1">NAME *</label>
            <input
              required value={form.name} placeholder="e.g. Earring Carnival"
              onChange={e => setForm({ ...form, name: e.target.value })} className={input}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#996515] block mb-1">NUMBER OF PIECES *</label>
              <input
                required type="number" min={1} max={20} value={form.pieces}
                onChange={e => setForm({ ...form, pieces: e.target.value })} className={input}
              />
              <p className="text-[10px] text-[#6B7280] mt-1">How many the client picks, e.g. 4.</p>
            </div>
            <div>
              <label className="text-[#996515] block mb-1">PRICE FOR ALL (INR) *</label>
              <input
                required type="number" min={1} value={form.priceINR} placeholder="e.g. 899"
                onChange={e => setForm({ ...form, priceINR: e.target.value })} className={input}
              />
              <p className="text-[10px] text-[#6B7280] mt-1">GST included, like every price.</p>
            </div>
          </div>

          <div>
            <label className="text-[#996515] block mb-1">DESCRIPTION</label>
            <textarea
              rows={2} value={form.description} placeholder="Shown under the name, e.g. Mix and match any four."
              onChange={e => setForm({ ...form, description: e.target.value })} className={input}
            />
          </div>

          <div>
            <label className="text-[#996515] block mb-1">CLIENT CHOOSES FROM — CATEGORIES</label>
            <div className="border border-[#EAE5D9] rounded-xs p-3 space-y-2 max-h-48 overflow-y-auto">
              {categories.map(top => (
                <div key={top.id}>
                  <label className="flex items-center gap-2 text-[#18181B] font-medium">
                    <input type="checkbox" checked={form.categories.includes(top.id)} onChange={() => toggleCategory(top.id)} />
                    All of {top.name}
                  </label>
                  <div className="ml-6 mt-1 grid grid-cols-2 gap-x-3 gap-y-1">
                    {(top.children ?? []).map(child => (
                      <label key={child.id} className="flex items-center gap-2 text-[#6B7280]">
                        <input type="checkbox" checked={form.categories.includes(child.id)} onChange={() => toggleCategory(child.id)} />
                        {child.name}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[#6B7280] mt-1">
              Tick several to let the client mix, e.g. earrings and rings.
            </p>
          </div>

          <div>
            <label className="text-[#996515] block mb-1">… AND THESE SPECIFIC PIECES (OPTIONAL)</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#B8860B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search a piece by name or code to add it"
                className={`${input} pl-9`}
              />
            </div>
            {matches.length > 0 && (
              <ul className="mt-1 border border-[#EAE5D9] rounded-xs divide-y divide-[#EAE5D9] max-h-48 overflow-y-auto">
                {matches.map(p => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => { setForm(f => ({ ...f, productIds: [...f.productIds, p.id] })); setQuery(''); }}
                      className="w-full flex items-center gap-3 p-2 text-left hover:bg-[#FBF9F5]"
                    >
                      <img src={p.image} alt="" className="w-8 h-8 object-cover rounded-xs" />
                      <span className="flex-1 truncate">{p.name}</span>
                      <span className="text-[#6B7280]">{inr(p.priceINR)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {form.productIds.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.productIds.map(id => (
                  <span key={id} className="inline-flex items-center gap-1.5 bg-[#FBF9F5] border border-[#EAE5D9] rounded-full pl-3 pr-1.5 py-1">
                    {byId.get(id)?.name ?? id}
                    <button
                      type="button" aria-label="Remove"
                      onClick={() => setForm(f => ({ ...f, productIds: f.productIds.filter(x => x !== id) }))}
                      className="text-[#6B7280] hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-[#996515] block mb-1">PICTURE (OPTIONAL)</label>
            <div className="flex items-center gap-3">
              {form.image ? (
                <img src={form.image} alt="" className="w-16 h-16 object-cover rounded-xs border border-[#EAE5D9]" />
              ) : null}
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-[#EAE5D9] rounded-xs cursor-pointer hover:border-[#B8860B]">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4 text-[#B8860B]" />}
                {form.image ? 'Change picture' : 'Add a picture'}
                <input
                  type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ''; }}
                />
              </label>
              {form.image && (
                <button type="button" onClick={() => setForm({ ...form, image: null })} className="text-[#6B7280] hover:text-red-700">
                  Remove
                </button>
              )}
            </div>
            <p className="text-[10px] text-[#6B7280] mt-1">Without one, a piece from the combo is shown.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className="text-[#996515] block mb-1">POSITION</label>
              <input
                type="number" value={form.sort}
                onChange={e => setForm({ ...form, sort: e.target.value })} className={input}
              />
              <p className="text-[10px] text-[#6B7280] mt-1">Smaller numbers come first.</p>
            </div>
            <label className="flex items-center gap-2 pb-6 text-[#18181B]">
              <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
              Showing on the website
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#EAE5D9]">
            <button type="button" onClick={onClose} className="px-4 py-2.5 border border-[#EAE5D9] rounded-xs text-[#6B7280] uppercase tracking-wider">
              Cancel
            </button>
            <button
              type="submit" disabled={saving || uploading}
              className="px-5 py-2.5 bg-[#B8860B] text-black font-semibold rounded-xs uppercase tracking-wider disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save combo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
