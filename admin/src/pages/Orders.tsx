import React, { useEffect, useMemo, useState } from 'react';
import { Ban, IndianRupee, Search, ShoppingBag, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiJson } from '../api';
import { ExportButton } from '../components/ExportButton';
import { itemColumns, itemRows, orderColumns } from '../exports';
import { ShippingPanel } from '../components/ShippingPanel';
import { Order } from '../types';

const STATUSES = ['Placed', 'In Artisan Crafting', 'Quality Assured', 'Shipped via Express', 'Delivered', 'Cancelled'];

const STATUS_BADGES: Record<string, string> = {
  'Placed': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'In Artisan Crafting': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Quality Assured': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Shipped via Express': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Delivered': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Cancelled': 'bg-red-500/10 text-red-400 border-red-500/20',
};

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1a2a1f] rounded ${className}`} />;
}

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  // Cancelled orders are a different job from live ones — they are chased for
  // refunds, not packed — so they get their own list rather than sitting in the
  // middle of the queue where they are scrolled past.
  const [view, setView] = useState<'active' | 'cancelled' | 'all'>('active');

  const refresh = () =>
    apiJson<Order[]>('/api/orders')
      .then(setOrders)
      .catch((err: any) => toast.error(err?.message || 'Could not load orders'))
      .finally(() => setLoading(false));

  useEffect(() => { refresh(); }, []);

  const cancelled = useMemo(
    () => orders.filter(o => o.orderStatus === 'Cancelled'),
    [orders]
  );
  const refundsDue = useMemo(
    () => cancelled.filter(o => o.refundStatus === 'Due'),
    [cancelled]
  );
  const refundDueTotal = useMemo(
    () => refundsDue.reduce((sum, o) => sum + (o.totalINR ?? 0), 0),
    [refundsDue]
  );

  const filtered = useMemo(() => {
    let list = orders;
    if (view === 'active') list = list.filter(o => o.orderStatus !== 'Cancelled');
    if (view === 'cancelled') list = cancelled;
    if (statusFilter !== 'all') list = list.filter(o => o.orderStatus === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        o =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, cancelled, search, statusFilter, view]);

  const updateStatus = async (orderId: string, status: string) => {
    const prev = orders;
    setOrders(os => os.map(o => (o.id === orderId ? { ...o, orderStatus: status as Order['orderStatus'] } : o)));
    try {
      await apiJson(`/api/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      toast.success(`Order marked "${status}"`);
    } catch (err: any) {
      setOrders(prev);
      toast.error(err?.message || 'Could not update status');
    }
  };

  const setRefunded = async (orderId: string, refunded: boolean) => {
    const prev = orders;
    setOrders(os =>
      os.map(o => (o.id === orderId ? { ...o, refundStatus: refunded ? 'Refunded' : 'Due' } : o))
    );
    try {
      await apiJson(`/api/orders/${orderId}/refund`, {
        method: 'PUT',
        body: JSON.stringify({ refunded }),
      });
      toast.success(refunded ? 'Marked as refunded' : 'Marked as still owed');
    } catch (err: any) {
      setOrders(prev);
      toast.error(err?.message || 'Could not record the refund');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-gold-gradient uppercase">Orders</h1>
          <p className="text-[11px] text-[#A7A7A7] mt-1">
            {loading
              ? 'Loading…'
              : `${filtered.length} of ${view === 'cancelled' ? cancelled.length : orders.length} orders`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportButton
            rows={filtered}
            columns={orderColumns}
            filename={view === 'cancelled' ? 'al-kaif-cancelled-orders' : 'al-kaif-orders'}
            label="Export orders"
          />
          <ExportButton
            rows={itemRows(filtered)}
            columns={itemColumns}
            filename="al-kaif-order-items"
            label="Export pieces sold"
          />
        </div>
      </div>

      {/* Which list you are working: the live queue, or the cancelled book. */}
      <div className="flex flex-wrap items-center gap-2">
        {([
          { key: 'active', label: 'Active', count: orders.length - cancelled.length },
          { key: 'cancelled', label: 'Cancelled', count: cancelled.length },
          { key: 'all', label: 'All', count: orders.length },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => { setView(tab.key); setStatusFilter('all'); }}
            className={`px-3 py-1.5 text-[11px] uppercase tracking-wider rounded-xs border transition-colors ${
              view === tab.key
                ? 'border-[#C5A059] bg-[#C5A059]/15 text-[#FFD700]'
                : 'border-[#2A2A2a] text-[#A7A7A7] hover:border-[#C5A059]/50 hover:text-[#DFC27C]'
            }`}
          >
            {tab.key === 'cancelled' && <Ban className="w-3 h-3 inline-block mr-1.5 -mt-0.5" />}
            {tab.label}
            <span className="ml-1.5 text-[10px] opacity-70">{loading ? '' : tab.count}</span>
          </button>
        ))}
      </div>

      {/* Money taken for orders that will not be delivered. It is stated in one
          line because it is the only thing in the cancelled book that is
          urgent — a client waiting on a refund is a client writing to you. */}
      {view === 'cancelled' && !loading && refundsDue.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border border-amber-500/30 bg-amber-500/5 px-4 py-3 rounded-xs">
          <IndianRupee className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-[#F5F2EE]">
            <strong className="text-amber-400">
              {refundsDue.length} refund{refundsDue.length === 1 ? '' : 's'} owed
            </strong>{' '}
            — ₹{refundDueTotal.toLocaleString('en-IN')} taken for orders that will not be delivered.
          </span>
          <span className="text-[10px] text-[#A7A7A7]">
            Refund in Razorpay, then mark it below.
          </span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="w-4 h-4 text-[#C5A059] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order number, customer, phone or email..."
            className="w-full bg-[#00140a] border border-[#2A2A2a] text-xs p-2.5 pl-9 rounded-xs focus:border-[#C5A059] focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A7A7A7] hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#00140a] border border-[#2A2A2a] text-xs text-[#DFC27C] p-2.5 rounded-xs focus:outline-none"
        >
          <option value="all">All statuses</option>
          {(view === 'cancelled' ? [] : view === 'active' ? STATUSES.filter(x => x !== 'Cancelled') : STATUSES)
            .map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Orders list */}
      <div className="space-y-4">
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-5 bg-[#00140a] border border-[#2A2A2a] rounded-xs space-y-4">
            <div className="flex justify-between"><Skeleton className="h-6 w-40" /><Skeleton className="h-8 w-44" /></div>
            <Skeleton className="h-10 w-full" />
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 border border-[#2A2A2a] rounded-xs">
            <div className="w-14 h-14 rounded-xs bg-[#00140a] border border-[#2A2A2a] flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-[#A7A7A7]" />
            </div>
            <p className="text-white font-medium text-sm">
              {search || statusFilter !== 'all'
                ? 'No orders match your filters'
                : view === 'cancelled'
                ? 'No cancelled orders'
                : 'No orders yet'}
            </p>
            <p className="text-[#A7A7A7] text-[11px]">
              {search || statusFilter !== 'all'
                ? 'Try clearing the search or status filter.'
                : view === 'cancelled'
                ? 'Nothing has been cancelled. Long may it last.'
                : 'New orders will appear here.'}
            </p>
          </div>
        )}

        {!loading && filtered.map(o => (
          <div key={o.id} className="p-5 bg-[#00140a] border border-[#2A2A2a] hover:border-[#C5A059]/40 rounded-xs space-y-4 text-xs transition-colors">
            <div className="flex flex-wrap justify-between items-start gap-3 pb-3 border-b border-[#2A2A2a]">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-serif text-lg text-[#FFD700]">{o.orderNumber}</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full border ${STATUS_BADGES[o.orderStatus] ?? STATUS_BADGES['Placed']}`}>
                    {o.orderStatus}
                  </span>
                </div>
                <span className="text-[10px] text-[#A7A7A7] block mt-1">
                  {o.customerName} • {o.customerPhone} • {new Date(o.createdAt).toLocaleString('en-IN')}
                </span>
                <span className={`text-[10px] block mt-0.5 ${o.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  Payment: {o.paymentStatus} ({o.paymentMethod})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#DFC27C] uppercase">Update:</span>
                <select
                  value={o.orderStatus}
                  onChange={e => updateStatus(o.id, e.target.value)}
                  className="bg-[#000e07] border border-[#C5A059] text-xs text-[#FFD700] p-1.5 rounded-xs"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              {o.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {item.product.image && (
                    <img src={item.product.image} alt={item.product.name} className="w-10 h-10 object-cover rounded-xs border border-[#2A2A2a]" />
                  )}
                  <span className="flex-1 text-[#F5F2EE]">
                    {item.product.name}
                    {item.selectedSize && (
                      <span className="ml-2 px-2 py-0.5 bg-[#C5A059]/15 border border-[#C5A059]/40 text-[#FFD700] text-[10px] uppercase tracking-wider rounded-xs">
                        Size: {item.selectedSize}
                      </span>
                    )}
                  </span>
                  <span className="text-[#A7A7A7]">× {item.quantity}</span>
                  <span className="font-mono text-[#FFD700]">
                    ₹{(item.product.priceINR * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#2A2A2a] flex flex-wrap justify-between gap-2 text-[#A7A7A7]">
              <span>
                Ship to: {(o.shippingAddress as any)?.addressLine1}, {(o.shippingAddress as any)?.city}{' '}
                {(o.shippingAddress as any)?.pincode}
              </span>
              <span className="font-mono text-[#FFD700]">Total: ₹{o.totalINR.toLocaleString('en-IN')}</span>
            </div>

            {o.orderStatus === 'Cancelled' ? (
              /* A cancelled order is not shipped, it is settled. What matters
                 here is when, who asked, why, and whether the money went back. */
              <div className="border-t border-[#2A2A2a] pt-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#A7A7A7] flex items-center gap-2">
                    <Ban className="w-3.5 h-3.5 text-red-400" />
                    Cancelled
                    {o.cancelledAt && (
                      <span className="normal-case tracking-normal text-[#F5F2EE]">
                        {new Date(o.cancelledAt).toLocaleString('en-IN')}
                      </span>
                    )}
                    {o.cancelledBy && (
                      <span className="normal-case tracking-normal">
                        · by the {o.cancelledBy === 'customer' ? 'customer' : 'shop'}
                      </span>
                    )}
                  </span>

                  {o.paymentStatus === 'Paid' && (
                    o.refundStatus === 'Refunded' ? (
                      <button
                        onClick={() => setRefunded(o.id, false)}
                        title="Recorded as refunded — click if that was a mistake"
                        className="inline-flex items-center gap-1.5 border border-emerald-500/40 text-emerald-400 px-2.5 py-1 text-[10px] uppercase tracking-wider rounded-xs hover:border-emerald-400"
                      >
                        <IndianRupee className="w-3 h-3" />
                        Refunded
                      </button>
                    ) : (
                      <button
                        onClick={() => setRefunded(o.id, true)}
                        className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/40 text-amber-400 px-2.5 py-1 text-[10px] uppercase tracking-wider rounded-xs hover:border-amber-400"
                      >
                        <IndianRupee className="w-3 h-3" />
                        Refund ₹{o.totalINR.toLocaleString('en-IN')} owed — mark sent
                      </button>
                    )
                  )}
                </div>

                {o.cancellationReason && (
                  <p className="text-[11px] text-[#F5F2EE]">
                    <span className="text-[#A7A7A7]">Reason: </span>
                    {o.cancellationReason}
                  </p>
                )}

                {o.awbNumber && (
                  <p className="text-[10px] text-[#A7A7A7]">
                    A parcel had already gone out on AWB{' '}
                    <span className="font-mono text-[#DFC27C]">{o.awbNumber}</span> — check the
                    courier before considering this closed.
                  </p>
                )}
              </div>
            ) : (
              <ShippingPanel
                order={o}
                onChange={updated =>
                  setOrders(os => os.map(x => (x.id === updated.id ? { ...x, ...updated } : x)))
                }
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
