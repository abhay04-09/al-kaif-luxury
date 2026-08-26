import React, { useEffect, useMemo, useState } from 'react';
import { Search, ShoppingBag, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiJson } from '../api';
import { ExportButton } from '../components/ExportButton';
import { itemColumns, itemRows, orderColumns } from '../exports';
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

  const refresh = () =>
    apiJson<Order[]>('/api/orders')
      .then(setOrders)
      .catch((err: any) => toast.error(err?.message || 'Could not load orders'))
      .finally(() => setLoading(false));

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    let list = orders;
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
  }, [orders, search, statusFilter]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-gold-gradient uppercase">Orders</h1>
          <p className="text-[11px] text-[#A7A7A7] mt-1">
            {loading ? 'Loading…' : `${filtered.length} of ${orders.length} orders`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportButton
            rows={filtered}
            columns={orderColumns}
            filename="al-kaif-orders"
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
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
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
              {search || statusFilter !== 'all' ? 'No orders match your filters' : 'No orders yet'}
            </p>
            <p className="text-[#A7A7A7] text-[11px]">
              {search || statusFilter !== 'all' ? 'Try clearing the search or status filter.' : 'New orders will appear here.'}
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
          </div>
        ))}
      </div>
    </div>
  );
};
