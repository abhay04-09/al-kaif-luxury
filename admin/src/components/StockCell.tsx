import React, { useEffect, useState } from 'react';
import { Loader2, Minus, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiJson } from '../api';
import { Product } from '../types';

/**
 * The stock count for one piece, editable in place.
 *
 * A piece may be uncounted — stockQuantity null — in which case it behaves as it
 * always has, in or out of stock by a switch. Counting is opt-in so the maison
 * can start with the pieces that matter rather than inventorying everything
 * before anything works.
 */
export const StockCell: React.FC<{
  product: Product;
  onChange: (patch: Partial<Product>) => void;
}> = ({ product, onChange }) => {
  const counted = product.stockQuantity !== null && product.stockQuantity !== undefined;
  const [draft, setDraft] = useState(String(product.stockQuantity ?? ''));
  const [saving, setSaving] = useState(false);

  // Follow the row when it changes underneath — a sale, or another edit.
  useEffect(() => {
    setDraft(String(product.stockQuantity ?? ''));
  }, [product.stockQuantity]);

  const save = async (quantity: number | null) => {
    setSaving(true);
    try {
      const updated = await apiJson<Product>(`/api/products/${product.id}`, {
        method: 'PUT',
        body: JSON.stringify({ stockQuantity: quantity }),
      });
      onChange({
        stockQuantity: updated.stockQuantity ?? null,
        inStock: updated.inStock,
      });
    } catch (err: any) {
      toast.error(err?.message || 'Could not update stock');
      setDraft(String(product.stockQuantity ?? ''));
    } finally {
      setSaving(false);
    }
  };

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed === '') return save(null);
    const next = Math.max(0, Math.floor(Number(trimmed)));
    if (Number.isNaN(next) || next === product.stockQuantity) {
      setDraft(String(product.stockQuantity ?? ''));
      return;
    }
    return save(next);
  };

  const step = (by: number) => {
    const base = Number(product.stockQuantity ?? 0);
    save(Math.max(0, base + by));
  };

  if (!counted) {
    return (
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] rounded-full border ${
            product.inStock
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
              : 'bg-red-950/60 text-red-400 border-red-500/30'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${product.inStock ? 'bg-emerald-400' : 'bg-red-400'}`}
          />
          {product.inStock ? 'In stock' : 'Out of stock'}
        </span>
        <button
          type="button"
          disabled={saving}
          onClick={() => save(0)}
          title="Start counting this piece"
          className="text-[10px] uppercase tracking-wider text-[#A7A7A7] hover:text-[#C5A059] disabled:opacity-40"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Count'}
        </button>
      </div>
    );
  }

  const quantity = Number(product.stockQuantity ?? 0);
  const low = quantity > 0 && quantity <= (product.lowStockThreshold ?? 3);
  const tone = quantity === 0
    ? 'text-red-400 border-red-500/40'
    : low
      ? 'text-[#FFD700] border-[#C5A059]/50'
      : 'text-emerald-400 border-emerald-500/30';

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={saving || quantity === 0}
        onClick={() => step(-1)}
        title="One fewer"
        className="grid h-6 w-6 place-items-center border border-[#2A2A2a] text-[#A7A7A7] hover:border-[#C5A059] hover:text-[#C5A059] rounded-xs disabled:opacity-30"
      >
        <Minus className="w-3 h-3" />
      </button>

      <input
        value={draft}
        disabled={saving}
        onChange={e => setDraft(e.target.value.replace(/[^\d]/g, ''))}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          if (e.key === 'Escape') setDraft(String(product.stockQuantity ?? ''));
        }}
        inputMode="numeric"
        title="Pieces on the shelf — clear the field to stop counting"
        className={`w-14 bg-[#000e07] border rounded-xs px-2 py-1 text-center text-xs font-mono outline-none focus:border-[#C5A059] ${tone}`}
      />

      <button
        type="button"
        disabled={saving}
        onClick={() => step(1)}
        title="One more"
        className="grid h-6 w-6 place-items-center border border-[#2A2A2a] text-[#A7A7A7] hover:border-[#C5A059] hover:text-[#C5A059] rounded-xs disabled:opacity-30"
      >
        <Plus className="w-3 h-3" />
      </button>

      {saving && <Loader2 className="w-3 h-3 text-[#C5A059] animate-spin" />}
      {!saving && quantity === 0 && (
        <span className="text-[9px] uppercase tracking-wider text-red-400">Out</span>
      )}
      {!saving && low && (
        <span className="text-[9px] uppercase tracking-wider text-[#FFD700]">Low</span>
      )}
    </div>
  );
};
