import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Pin, PinOff, Eye, EyeOff, Trash2, Search, Star, BadgeCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiJson } from '../api';
import { Review } from '../types';

/** "14 October 2026, 4:56 pm" — what the shop asked to see beside each review. */
const when = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(d);
};

const Stars: React.FC<{ rating: number }> = ({ rating }) => (
  <span className="inline-flex items-center gap-0.5" title={`${rating} of 5`}>
    {[1, 2, 3, 4, 5].map(n => (
      <Star
        key={n}
        className={`w-3.5 h-3.5 ${n <= rating ? 'fill-[#B8860B] text-[#B8860B]' : 'text-[#D8D2C4]'}`}
        strokeWidth={1.6}
      />
    ))}
  </span>
);

/**
 * Everything clients have written, and what the shop can do about it.
 *
 * A review appears on the website the moment it is written, so this page is
 * where it is taken down again: hidden if it may be wanted later, deleted if
 * it never should have been there, pinned if it deserves to be read first.
 */
export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'all' | 'shown' | 'hidden'>('all');
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    try {
      setReviews(await apiJson<Review[]>('/api/reviews'));
    } catch (err: any) {
      toast.error(err?.message || 'Could not load the reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter(r => {
      if (view === 'shown' && r.hidden) return false;
      if (view === 'hidden' && !r.hidden) return false;
      if (!q) return true;
      return `${r.productName} ${r.authorName} ${r.body}`.toLowerCase().includes(q);
    });
  }, [reviews, search, view]);

  const average = useMemo(() => {
    const shown = reviews.filter(r => !r.hidden);
    if (!shown.length) return null;
    return Math.round((shown.reduce((n, r) => n + r.rating, 0) / shown.length) * 10) / 10;
  }, [reviews]);

  const patch = async (review: Review, body: Partial<Review>, done: string) => {
    setBusy(review.id);
    try {
      const saved = await apiJson<Review>(`/api/reviews/${review.id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      setReviews(prev => prev.map(r => (r.id === review.id ? { ...r, ...saved } : r)));
      toast.success(done);
    } catch (err: any) {
      toast.error(err?.message || 'Could not save');
    } finally {
      setBusy(null);
    }
  };

  const remove = async (review: Review) => {
    // Deleting is the one thing here that cannot be undone.
    if (!window.confirm(`Delete ${review.authorName}'s review of ${review.productName}? This cannot be undone.`)) return;
    setBusy(review.id);
    try {
      await apiJson(`/api/reviews/${review.id}`, { method: 'DELETE' });
      setReviews(prev => prev.filter(r => r.id !== review.id));
      toast.success('Review deleted');
    } catch (err: any) {
      toast.error(err?.message || 'Could not delete');
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-[#6B7280] text-sm">
        <Loader2 className="w-4 h-4 animate-spin text-[#B8860B]" />
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-gold-gradient uppercase">Reviews</h1>
          <p className="text-[11px] text-[#6B7280] mt-1">
            {reviews.length} in all
            {average !== null && ` · ${average} stars on average across what is showing`}
            {' · '}reviews appear on the website as soon as they are written.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#B8860B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search piece, client or words"
              className="bg-[#FBF9F5] border border-[#EAE5D9] text-[#18181B] text-xs p-2.5 pl-9 rounded-xs w-64 focus:border-[#B8860B] focus:outline-none"
            />
          </div>
          {(['all', 'shown', 'hidden'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`px-3 py-2 text-[10px] uppercase tracking-wider rounded-xs border ${
                view === tab
                  ? 'border-[#B8860B] bg-[#B8860B]/10 text-[#996515]'
                  : 'border-[#EAE5D9] text-[#6B7280] hover:border-[#B8860B]/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="p-10 text-center border border-[#EAE5D9] rounded-xs text-[#6B7280] text-sm">
          {reviews.length === 0 ? 'No client has written a review yet.' : 'Nothing matches that.'}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(review => (
            <div
              key={review.id}
              className={`p-4 bg-white border rounded-xs ${
                review.hidden ? 'border-[#EAE5D9] opacity-60' : 'border-[#EAE5D9]'
              }`}
            >
              <div className="flex items-start gap-3">
                {review.productImage && (
                  <img
                    src={review.productImage}
                    alt={review.productName}
                    className="w-12 h-12 object-cover rounded-xs border border-[#EAE5D9] shrink-0"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Stars rating={review.rating} />
                    <span className="text-[#18181B] text-sm font-medium">{review.authorName}</span>
                    {review.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#996515]">
                        <BadgeCheck className="w-3 h-3" /> Verified buyer
                      </span>
                    )}
                    {review.pinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#B8860B]">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                    {review.hidden && (
                      <span className="text-[10px] uppercase tracking-wider text-[#6B7280]">Hidden</span>
                    )}
                  </div>

                  <p className="text-[11px] text-[#6B7280] mt-0.5">
                    {review.productName} · {when(review.createdAt)}
                  </p>

                  {review.body && (
                    <p className="mt-2 text-sm text-[#18181B] whitespace-pre-line">{review.body}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    disabled={busy === review.id}
                    onClick={() => patch(review, { pinned: !review.pinned },
                      review.pinned ? 'Unpinned' : 'Pinned to the top of that piece')}
                    title={review.pinned ? 'Stop showing this first' : 'Show this first on the product page'}
                    className="p-2 border border-[#EAE5D9] rounded-xs text-[#996515] hover:border-[#B8860B] disabled:opacity-40"
                  >
                    {review.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    disabled={busy === review.id}
                    onClick={() => patch(review, { hidden: !review.hidden },
                      review.hidden ? 'Showing on the website again' : 'Hidden from the website')}
                    title={review.hidden ? 'Show on the website again' : 'Hide from the website, keep it here'}
                    className="p-2 border border-[#EAE5D9] rounded-xs text-[#996515] hover:border-[#B8860B] disabled:opacity-40"
                  >
                    {review.hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    disabled={busy === review.id}
                    onClick={() => remove(review)}
                    title="Delete permanently"
                    className="p-2 border border-[#EAE5D9] rounded-xs text-red-700 hover:border-red-500 disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
