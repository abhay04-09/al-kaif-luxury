import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Package, Mail, Plus, ArrowRight, FolderTree, Star } from 'lucide-react';
import { apiJson } from '../api';
import { Order, Product } from '../types';

const ORDER_BADGES: Record<string, string> = {
  'Placed': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'In Artisan Crafting': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Quality Assured': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Shipped via Express': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Delivered': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Cancelled': 'bg-red-500/10 text-red-400 border-red-500/20',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1a2a1f] rounded ${className}`} />;
}

function StatCard({
  label, value, icon: Icon, sub, loading,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  sub?: string;
  loading: boolean;
}) {
  return (
    <div className="p-6 bg-[#00140a] border border-[#2A2A2a] hover:border-[#C5A059]/60 rounded-xs transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] text-[#A7A7A7] uppercase tracking-widest">{label}</span>
        <div className="p-2 bg-black/50 rounded-xs group-hover:bg-[#C5A059]/10 transition-colors">
          <Icon className="w-4 h-4 text-[#C5A059]" />
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-28" />
      ) : (
        <span className="font-serif text-2xl text-[#FFD700] block">{value}</span>
      )}
      {sub && !loading && <p className="text-[10px] text-[#A7A7A7] mt-1">{sub}</p>}
    </div>
  );
}

export const DashboardPage: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      apiJson<Order[]>('/api/orders').then(setOrders),
      apiJson<Product[]>('/api/products').then(setProducts),
      apiJson<any[]>('/api/newsletter').then(s => setSubscriberCount(s.length)),
    ]).finally(() => setLoading(false));
  }, []);

  const paidRevenue = orders
    .filter(o => o.paymentStatus === 'Paid')
    .reduce((acc, o) => acc + o.totalINR, 0);
  const pendingOrders = orders.filter(o => o.orderStatus === 'Placed').length;
  const featuredCount = products.filter(p => p.featured).length;
  const outOfStock = products.filter(p => !p.inStock).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-gold-gradient uppercase">Dashboard</h1>
          <p className="text-[11px] text-[#A7A7A7] mt-1">Welcome back — here's how the Maison is doing.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate?.('products')}
            className="px-4 py-2.5 bg-[#C5A059] text-black text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#FFD700] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
          <button
            onClick={() => onNavigate?.('categories')}
            className="px-4 py-2.5 border border-[#C5A059]/60 text-[#DFC27C] text-xs uppercase tracking-wider rounded-xs hover:border-[#FFD700] hover:text-[#FFD700] flex items-center gap-2"
          >
            <FolderTree className="w-4 h-4" />
            <span>Categories</span>
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Paid Revenue"
          value={`₹${paidRevenue.toLocaleString('en-IN')}`}
          icon={DollarSign}
          sub={`${orders.filter(o => o.paymentStatus === 'Paid').length} paid orders`}
          loading={loading}
        />
        <StatCard
          label="Orders"
          value={String(orders.length)}
          icon={ShoppingBag}
          sub={pendingOrders > 0 ? `${pendingOrders} awaiting action` : 'All handled'}
          loading={loading}
        />
        <StatCard
          label="Products"
          value={String(products.length)}
          icon={Package}
          sub={outOfStock > 0 ? `${outOfStock} out of stock` : `${featuredCount} featured`}
          loading={loading}
        />
        <StatCard
          label="Subscribers"
          value={String(subscriberCount)}
          icon={Mail}
          sub="Newsletter circle"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-widest text-[#DFC27C]">Latest Orders</h2>
            <button
              onClick={() => onNavigate?.('orders')}
              className="text-[10px] text-[#A7A7A7] hover:text-[#FFD700] uppercase tracking-wider flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="border border-[#2A2A2a] rounded-xs divide-y divide-[#2A2A2a] bg-[#000e07]">
            {loading && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 flex justify-between items-center">
                <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-44" /></div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
            {!loading && orders.slice(0, 6).map(o => (
              <div key={o.id} className="p-4 flex items-center justify-between text-xs gap-3">
                <div className="min-w-0">
                  <span className="font-mono text-[#FFD700] block">{o.orderNumber}</span>
                  <span className="text-[#A7A7A7] text-[10px] truncate block">
                    {o.customerName} • {timeAgo(o.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-2 py-0.5 text-[10px] rounded-full border ${ORDER_BADGES[o.orderStatus] ?? ORDER_BADGES['Placed']}`}>
                    {o.orderStatus}
                  </span>
                  <span className="font-mono text-white">₹{o.totalINR.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
            {!loading && orders.length === 0 && (
              <div className="p-10 text-center text-xs text-[#A7A7A7]">No orders yet — they'll appear here.</div>
            )}
          </div>
        </div>

        {/* Featured products */}
        <div className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-[#DFC27C]">Featured Pieces</h2>
          <div className="border border-[#2A2A2a] rounded-xs divide-y divide-[#2A2A2a] bg-[#000e07]">
            {loading && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3 flex items-center gap-3">
                <Skeleton className="w-10 h-10 shrink-0" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
            {!loading && products.filter(p => p.featured).slice(0, 5).map(p => (
              <div key={p.id} className="p-3 flex items-center gap-3 text-xs">
                <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-xs border border-[#2A2A2a]" />
                <div className="min-w-0 flex-1">
                  <span className="text-white truncate block">{p.name}</span>
                  <span className="font-mono text-[10px] text-[#FFD700]">₹{p.priceINR.toLocaleString('en-IN')}</span>
                </div>
                <Star className="w-3.5 h-3.5 text-[#FFD700] fill-[#FFD700] shrink-0" />
              </div>
            ))}
            {!loading && products.filter(p => p.featured).length === 0 && (
              <div className="p-8 text-center text-xs text-[#A7A7A7]">
                No featured products — star some in the Products tab.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
