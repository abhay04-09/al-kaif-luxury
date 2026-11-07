import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, Undo2, Wand2, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiJson } from '../api';
import { Category, Product } from '../types';

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const PAGE = 50;

type PriceRule = 'keep' | 'set' | 'pct_up' | 'pct_down' | 'amt_up' | 'amt_down';
type MrpRule = 'keep' | 'set' | 'discount' | 'remove' | 'pct_up' | 'pct_down';
type Rounding = 'none' | '10' | '50' | 'end9';

/** The figures a row would be changed to, as the shop typed or computed them. */
type Draft = { price: string; mrp: string };

/** Rounds a rupee amount the way a shop prices: to a tidy figure, or one ending in 9. */
function round(n: number, mode: Rounding): number {
  if (mode === '10') return Math.round(n / 10) * 10;
  if (mode === '50') return Math.round(n / 50) * 50;
  if (mode === 'end9') return Math.max(9, Math.round((n + 1) / 10) * 10 - 1);
  return Math.round(n);
}

/**
 * Bulk pricing.
 *
 * Pick the products, say what should happen to their prices, look at old beside
 * new, change any single figure by hand, and only then save. Nothing is written
 * until Save, and the last batch can be undone.
 */
export const PricingPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // which products are shown
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);

  // which are chosen, and what is planned for them
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  // the rule
  const [priceRule, setPriceRule] = useState<PriceRule>('keep');
  const [priceValue, setPriceValue] = useState('');
  const [mrpRule, setMrpRule] = useState<MrpRule>('keep');
  const [mrpValue, setMrpValue] = useState('');
  const [rounding, setRounding] = useState<Rounding>('none');

  const [saving, setSaving] = useState(false);
  const [lastBatch, setLastBatch] = useState<{ id: string; priceINR: number; mrpINR: number | null }[] | null>(null);

  const load = async () => {
    try {
      const [list, cats] = await Promise.all([
        apiJson<Product[]>('/api/products'),
        apiJson<Category[]>('/api/categories'),
      ]);
      setProducts(list);
      setCategories(cats);
    } catch (err: any) {
      toast.error(err?.message || 'Could not load the products');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const subOptions = useMemo(
    () => categories.find(c => c.id === category)?.children ?? [],
    [categories, category]
  );

  const matching = useMemo(() => {
    const q = search.trim().toLowerCase();
    const lo = minPrice === '' ? -Infinity : Number(minPrice);
    const hi = maxPrice === '' ? Infinity : Number(maxPrice);
    return products.filter(p => {
      if (category && p.category !== category) return false;
      if (subcategory && (p.subcategory ?? '') !== subcategory) return false;
      if (p.priceINR < lo || p.priceINR > hi) return false;
      if (q && !`${p.name} ${p.sku}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, search, category, subcategory, minPrice, maxPrice]);

  const pageCount = Math.max(1, Math.ceil(matching.length / PAGE));
  const shown = matching.slice((page - 1) * PAGE, page * PAGE);
  useEffect(() => { setPage(1); }, [search, category, subcategory, minPrice, maxPrice]);

  const draftOf = (p: Product): Draft => drafts[p.id] ?? { price: String(p.priceINR), mrp: p.mrpINR ? String(p.mrpINR) : '' };

  /** A row whose figures match what it already has is not a change. */
  const setDraft = (p: Product, next: Draft) => {
    const same = Number(next.price) === p.priceINR && (next.mrp === '' ? null : Number(next.mrp)) === (p.mrpINR ?? null);
    setDrafts(prev => {
      const copy = { ...prev };
      if (same) delete copy[p.id];
      else copy[p.id] = next;
      return copy;
    });
  };

  const problem = (d: Draft): string | null => {
    const price = Number(d.price);
    if (!Number.isFinite(price) || price < 1) return 'Enter a selling price';
    if (d.mrp !== '' && !(Number(d.mrp) > price)) return 'MRP must be above the price';
    return null;
  };

  const applyRule = () => {
    const chosen = products.filter(p => selected.has(p.id));
    if (chosen.length === 0) {
      toast.error('Tick the products to change first.');
      return;
    }
    const pv = Number(priceValue);
    const mv = Number(mrpValue);
    if (priceRule !== 'keep' && !(pv > 0)) return void toast.error('Enter a number for the selling price rule.');
    if (['set', 'discount', 'pct_up', 'pct_down'].includes(mrpRule) && !(mv > 0)) {
      return void toast.error('Enter a number for the MRP rule.');
    }
    if (mrpRule === 'discount' && mv >= 90) return void toast.error('A discount of 90% or more looks like a mistake.');

    const next = { ...drafts };
    for (const p of chosen) {
      let price = p.priceINR;
      if (priceRule === 'set') price = pv;
      else if (priceRule === 'pct_up') price = price * (1 + pv / 100);
      else if (priceRule === 'pct_down') price = price * (1 - pv / 100);
      else if (priceRule === 'amt_up') price = price + pv;
      else if (priceRule === 'amt_down') price = price - pv;
      if (priceRule !== 'keep') price = Math.max(1, round(price, rounding));

      let mrp: number | null = p.mrpINR ?? null;
      if (mrpRule === 'set') mrp = round(mv, rounding);
      else if (mrpRule === 'remove') mrp = null;
      else if (mrpRule === 'discount') mrp = round(price / (1 - mv / 100), rounding);
      else if (mrpRule === 'pct_up' && mrp) mrp = round(mrp * (1 + mv / 100), rounding);
      else if (mrpRule === 'pct_down' && mrp) mrp = round(mrp * (1 - mv / 100), rounding);

      const draft: Draft = { price: String(price), mrp: mrp === null ? '' : String(mrp) };
      const same = price === p.priceINR && mrp === (p.mrpINR ?? null);
      if (same) delete next[p.id];
      else next[p.id] = draft;
    }
    setDrafts(next);
    toast.success(`Worked out new prices for ${chosen.length} products. Check them, then press Save.`);
  };

  const changed = products.filter(p => drafts[p.id]);
  const broken = changed.filter(p => problem(drafts[p.id]));

  const save = async () => {
    if (changed.length === 0) return;
    if (broken.length > 0) {
      toast.error(`${broken.length} product${broken.length === 1 ? ' has' : 's have'} a price problem, marked in red. Fix or clear them first.`);
      return;
    }
    const ups = changed.filter(p => Number(drafts[p.id].price) > p.priceINR).length;
    const downs = changed.filter(p => Number(drafts[p.id].price) < p.priceINR).length;
    if (!window.confirm(
      `Change the prices of ${changed.length} product${changed.length === 1 ? '' : 's'}?\n\n` +
      `${ups} going up, ${downs} going down. This goes live on the website straight away. ` +
      `You can undo the batch afterwards.`
    )) return;

    setSaving(true);
    try {
      const res = await apiJson<{ updated: number; failed: { id: string; error: string }[]; undo: { id: string; priceINR: number; mrpINR: number | null }[] }>(
        '/api/pricing/bulk',
        {
          method: 'POST',
          body: JSON.stringify({
            changes: changed.map(p => ({
              id: p.id,
              priceINR: Number(drafts[p.id].price),
              mrpINR: drafts[p.id].mrp === '' ? null : Number(drafts[p.id].mrp),
            })),
          }),
        }
      );
      setLastBatch(res.undo);
      if (res.failed.length > 0) {
        toast.error(`${res.updated} saved, ${res.failed.length} could not be: ${res.failed[0].error}`);
      } else {
        toast.success(`${res.updated} product${res.updated === 1 ? '' : 's'} updated`);
      }
      setDrafts({});
      setSelected(new Set());
      await load();
    } catch (err: any) {
      toast.error(err?.message || 'Could not save the prices');
    } finally {
      setSaving(false);
    }
  };

  const undo = async () => {
    if (!lastBatch || lastBatch.length === 0) return;
    if (!window.confirm(`Put the previous prices back on ${lastBatch.length} product${lastBatch.length === 1 ? '' : 's'}?`)) return;
    setSaving(true);
    try {
      await apiJson('/api/pricing/bulk', { method: 'POST', body: JSON.stringify({ changes: lastBatch }) });
      toast.success('Previous prices restored');
      setLastBatch(null);
      await load();
    } catch (err: any) {
      toast.error(err?.message || 'Could not undo');
    } finally {
      setSaving(false);
    }
  };

  const allShownSelected = shown.length > 0 && shown.every(p => selected.has(p.id));
  const toggleShown = () =>
    setSelected(prev => {
      const next = new Set(prev);
      if (allShownSelected) shown.forEach(p => next.delete(p.id));
      else shown.forEach(p => next.add(p.id));
      return next;
    });

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-[#6B7280] text-sm">
        <Loader2 className="w-4 h-4 animate-spin text-[#B8860B]" /> Loading…
      </div>
    );
  }

  const field = 'bg-[#FBF9F5] border border-[#EAE5D9] p-2.5 rounded-xs text-xs focus:border-[#B8860B] focus:outline-none';
  const label = 'block mb-1 text-[10px] uppercase tracking-wider text-[#996515]';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-gold-gradient uppercase">Bulk Pricing</h1>
          <p className="text-[11px] text-[#6B7280] mt-1 max-w-2xl">
            Choose products, say what should happen to their prices, check the new figures, then save.
            Nothing changes on the website until you press Save.
          </p>
        </div>
        {lastBatch && lastBatch.length > 0 && (
          <button
            onClick={undo}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#B8860B] text-[#996515] text-xs uppercase tracking-wider rounded-xs hover:bg-[#B8860B]/10 disabled:opacity-50"
          >
            <Undo2 className="w-4 h-4" /> Undo last batch ({lastBatch.length})
          </button>
        )}
      </div>

      {/* 1. which products */}
      <div className="p-4 bg-white border border-[#EAE5D9] rounded-xs space-y-3">
        <p className="text-[#996515] text-xs uppercase tracking-wider">1. Which products</p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#B8860B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name or code"
              className={`${field} pl-9 w-52`} />
          </div>
          <div>
            <select value={category} onChange={e => { setCategory(e.target.value); setSubcategory(''); }} className={field}>
              <option value="">All categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <select value={subcategory} onChange={e => setSubcategory(e.target.value)} disabled={subOptions.length === 0} className={`${field} disabled:opacity-50`}>
              <option value="">All types</option>
              {subOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            Price
            <input type="number" min="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="from" className={`${field} w-24`} />
            to
            <input type="number" min="0" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="to" className={`${field} w-24`} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B7280]">
          <span>{matching.length} product{matching.length === 1 ? '' : 's'} match · <strong className="text-[#18181B]">{selected.size} ticked</strong></span>
          <button type="button" onClick={() => setSelected(new Set(matching.map(p => p.id)))}
            className="underline text-[#996515] hover:text-[#18181B]">Tick all {matching.length} matching</button>
          {selected.size > 0 && (
            <button type="button" onClick={() => setSelected(new Set())} className="underline hover:text-[#18181B]">Clear ticks</button>
          )}
        </div>
      </div>

      {/* 2. what to do */}
      <div className="p-4 bg-white border border-[#EAE5D9] rounded-xs space-y-3">
        <p className="text-[#996515] text-xs uppercase tracking-wider">2. What to do to the ticked products</p>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <span className={label}>Selling price</span>
            <div className="flex gap-2">
              <select value={priceRule} onChange={e => setPriceRule(e.target.value as PriceRule)} className={field}>
                <option value="keep">Leave as it is</option>
                <option value="set">Set to ₹</option>
                <option value="pct_up">Increase by %</option>
                <option value="pct_down">Decrease by %</option>
                <option value="amt_up">Increase by ₹</option>
                <option value="amt_down">Decrease by ₹</option>
              </select>
              {priceRule !== 'keep' && (
                <input type="number" min="0" step="any" value={priceValue} onChange={e => setPriceValue(e.target.value)} placeholder="amount" className={`${field} w-24`} />
              )}
            </div>
          </div>
          <div>
            <span className={label}>MRP (struck-through price)</span>
            <div className="flex gap-2">
              <select value={mrpRule} onChange={e => setMrpRule(e.target.value as MrpRule)} className={field}>
                <option value="keep">Leave as it is</option>
                <option value="discount">Show a discount of % (MRP worked out)</option>
                <option value="set">Set to ₹</option>
                <option value="pct_up">Increase by %</option>
                <option value="pct_down">Decrease by %</option>
                <option value="remove">Remove (no discount shown)</option>
              </select>
              {['discount', 'set', 'pct_up', 'pct_down'].includes(mrpRule) && (
                <input type="number" min="0" step="any" value={mrpValue} onChange={e => setMrpValue(e.target.value)} placeholder="amount" className={`${field} w-24`} />
              )}
            </div>
          </div>
          <div>
            <span className={label}>Round to</span>
            <select value={rounding} onChange={e => setRounding(e.target.value as Rounding)} className={field}>
              <option value="none">Nearest ₹1</option>
              <option value="10">Nearest ₹10</option>
              <option value="50">Nearest ₹50</option>
              <option value="end9">Ending in 9 (299, 399…)</option>
            </select>
          </div>
          <button type="button" onClick={applyRule}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#B8860B] text-black text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#996515] hover:text-white">
            <Wand2 className="w-4 h-4" /> Work out new prices
          </button>
        </div>
        <p className="text-[10px] text-[#6B7280]">
          Example: tick all earrings, choose “Show a discount of 40%” and “Ending in 9”: each MRP is worked out
          from its price. You can still type over any single figure in the table below.
        </p>
      </div>

      {/* 3. check and save */}
      <div className="bg-white border border-[#EAE5D9] rounded-xs overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-[#EAE5D9]">
          <p className="text-[#996515] text-xs uppercase tracking-wider">3. Check the new prices, then save</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6B7280]">
              {changed.length} change{changed.length === 1 ? '' : 's'} waiting
              {broken.length > 0 && <span className="text-red-700"> · {broken.length} need fixing</span>}
            </span>
            {changed.length > 0 && (
              <button type="button" onClick={() => setDrafts({})}
                className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#18181B] underline">
                <X className="w-3 h-3" /> Clear all changes
              </button>
            )}
            <button type="button" onClick={save} disabled={saving || changed.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#B8860B] text-black text-xs font-semibold uppercase tracking-wider rounded-xs disabled:opacity-40">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save {changed.length > 0 ? changed.length : ''} change{changed.length === 1 ? '' : 's'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#FBF9F5] text-[#996515] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3 w-10"><input type="checkbox" checked={allShownSelected} onChange={toggleShown} aria-label="Tick everything on this page" /></th>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-right">Price now</th>
                <th className="p-3 text-right">MRP now</th>
                <th className="p-3 text-left">New price</th>
                <th className="p-3 text-left">New MRP</th>
                <th className="p-3 text-left">Discount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE5D9]">
              {shown.map(p => {
                const d = draftOf(p);
                const isChanged = !!drafts[p.id];
                const bad = isChanged ? problem(d) : null;
                const newPrice = Number(d.price);
                const newMrp = d.mrp === '' ? null : Number(d.mrp);
                const pct = newMrp && newMrp > newPrice ? Math.round(((newMrp - newPrice) / newMrp) * 100) : 0;
                return (
                  <tr key={p.id} className={isChanged ? 'bg-[#B8860B]/5' : ''}>
                    <td className="p-3"><input type="checkbox" checked={selected.has(p.id)}
                      onChange={() => setSelected(prev => { const n = new Set(prev); if (n.has(p.id)) n.delete(p.id); else n.add(p.id); return n; })}
                      aria-label={`Tick ${p.name}`} /></td>
                    <td className="p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={p.image} alt="" loading="lazy" className="w-9 h-9 object-cover rounded-xs border border-[#EAE5D9] shrink-0" />
                        <span className="truncate max-w-xs">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right text-[#6B7280]">{inr(p.priceINR)}</td>
                    <td className="p-3 text-right text-[#6B7280]">{p.mrpINR ? inr(p.mrpINR) : '—'}</td>
                    <td className="p-3">
                      <input type="number" min="1" value={d.price}
                        onChange={e => setDraft(p, { ...d, price: e.target.value })}
                        className={`${field} w-24 ${bad ? 'border-red-500' : ''}`} />
                    </td>
                    <td className="p-3">
                      <input type="number" min="1" value={d.mrp} placeholder="none"
                        onChange={e => setDraft(p, { ...d, mrp: e.target.value })}
                        className={`${field} w-24 ${bad ? 'border-red-500' : ''}`} />
                      {bad && <p className="text-[10px] text-red-700 mt-1">{bad}</p>}
                    </td>
                    <td className="p-3 text-[#996515]">{pct > 0 ? `${pct}% off` : '—'}</td>
                  </tr>
                );
              })}
              {shown.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-[#6B7280]">No products match.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {pageCount > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-[#EAE5D9] text-xs text-[#6B7280]">
            <span>Page {page} of {pageCount}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 border border-[#EAE5D9] rounded-xs disabled:opacity-40">Previous</button>
              <button disabled={page >= pageCount} onClick={() => setPage(page + 1)} className="px-3 py-1.5 border border-[#EAE5D9] rounded-xs disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
