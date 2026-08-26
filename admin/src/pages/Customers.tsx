import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Loader2, Search, Shield, ShoppingBag, UserRound } from 'lucide-react';
import { apiJson } from '../api';
import { Customer, Order } from '../types';

const inr = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="border border-[#2A2A2a] rounded-xs bg-[#000e07] p-4">
    <span className="text-[10px] uppercase tracking-[0.2em] text-[#A7A7A7]">{label}</span>
    <p className="mt-2 font-serif text-2xl text-[#F5F2EE]">{value}</p>
  </div>
);

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([apiJson<Customer[]>('/api/users'), apiJson<Order[]>('/api/orders')])
      .then(([people, allOrders]) => {
        setCustomers(people);
        setOrders(allOrders);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Orders placed before someone signed in carry no user id, so they are
  // matched on the email address they were placed with as well.
  const ordersByCustomer = useMemo(() => {
    const grouped = new Map<string, Order[]>();
    const byEmail = new Map<string, string>();
    customers.forEach(person => {
      if (person.email) byEmail.set(person.email.trim().toLowerCase(), person.id);
    });

    orders.forEach(order => {
      const id =
        order.userId ?? byEmail.get((order.customerEmail ?? '').trim().toLowerCase());
      if (!id) return;
      const list = grouped.get(id) ?? [];
      list.push(order);
      grouped.set(id, list);
    });

    grouped.forEach(list =>
      list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    );
    return grouped;
  }, [customers, orders]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter(person =>
      [person.name, person.email, person.phone ?? ''].some(field =>
        field.toLowerCase().includes(term)
      )
    );
  }, [customers, query]);

  const signedUpThisMonth = useMemo(() => {
    const now = new Date();
    return customers.filter(person => {
      if (!person.createdAt) return false;
      const joined = new Date(person.createdAt);
      return joined.getMonth() === now.getMonth() && joined.getFullYear() === now.getFullYear();
    }).length;
  }, [customers]);

  const withOrders = customers.filter(person => person.orderCount > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#C5A059] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl text-gold-gradient uppercase">
          Customers ({customers.length})
        </h1>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#A7A7A7] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search name, email or phone"
            className="w-72 bg-[#000e07] border border-[#2A2A2a] rounded-xs pl-9 pr-3 py-2 text-xs text-[#F5F2EE] placeholder:text-[#A7A7A7]/60 focus:border-[#C5A059] outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="border border-red-500/40 bg-red-950/40 rounded-xs p-4 text-xs text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3 max-w-2xl">
        <Stat label="Total sign-ups" value={String(customers.length)} />
        <Stat label="Joined this month" value={String(signedUpThisMonth)} />
        <Stat label="Have ordered" value={String(withOrders)} />
      </div>

      <div className="border border-[#2A2A2a] rounded-xs bg-[#000e07] overflow-x-auto">
        <table className="w-full text-xs min-w-[900px]">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-[#A7A7A7] border-b border-[#2A2A2a]">
              <th className="p-4 font-normal">Customer</th>
              <th className="p-4 font-normal">Phone</th>
              <th className="p-4 font-normal">Signed up via</th>
              <th className="p-4 font-normal">Joined</th>
              <th className="p-4 font-normal">Orders</th>
              <th className="p-4 font-normal">Spent</th>
              <th className="p-4 font-normal">Last order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2a]">
            {visible.map(person => {
              const theirOrders = ordersByCustomer.get(person.id) ?? [];
              const isOpen = expanded === person.id;
              return (
              <React.Fragment key={person.id}>
              <tr
                className={`hover:bg-white/[0.02] ${theirOrders.length ? 'cursor-pointer' : ''}`}
                onClick={() =>
                  theirOrders.length && setExpanded(isOpen ? null : person.id)
                }
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {person.avatar ? (
                      <img
                        src={person.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-[#2A2A2a]"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full border border-[#2A2A2a] flex items-center justify-center">
                        <UserRound className="w-4 h-4 text-[#C5A059]" />
                      </span>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#F5F2EE]">{person.name}</span>
                        {person.role === 'admin' && (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-[#FFD700] border border-[#C5A059]/50 px-1.5 py-0.5">
                            <Shield className="w-2.5 h-2.5" />
                            Admin
                          </span>
                        )}
                      </div>
                      <a
                        href={`mailto:${person.email}`}
                        className="text-[10px] text-[#A7A7A7] hover:text-[#C5A059]"
                      >
                        {person.email}
                      </a>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-[#A7A7A7]">
                  {person.phone ? (
                    <a href={`tel:${person.phone}`} className="hover:text-[#C5A059]">
                      {person.phone}
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="p-4">
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-1 border ${
                      person.signUpMethod === 'Google'
                        ? 'border-[#4285F4]/50 text-[#8AB4F8]'
                        : 'border-[#C5A059]/40 text-[#DFC27C]'
                    }`}
                  >
                    {person.signUpMethod}
                  </span>
                </td>
                <td className="p-4 text-[#A7A7A7]">{formatDate(person.createdAt)}</td>
                <td className="p-4">
                  {person.orderCount > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-[#F5F2EE]">
                      <ShoppingBag className="w-3 h-3 text-[#C5A059]" />
                      {person.orderCount}
                      {theirOrders.length > 0 && (
                        <ChevronDown
                          className={`w-3 h-3 text-[#A7A7A7] transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </span>
                  ) : (
                    <span className="text-[#A7A7A7]">—</span>
                  )}
                </td>
                <td className="p-4 text-[#F5F2EE]">
                  {person.totalSpentINR > 0 ? inr(person.totalSpentINR) : '—'}
                </td>
                <td className="p-4 text-[#A7A7A7]">{formatDate(person.lastOrderAt)}</td>
              </tr>

              {isOpen && (
                <tr className="bg-black/30">
                  <td colSpan={7} className="p-0">
                    <div className="px-4 py-4 border-l-2 border-[#C5A059]">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#A7A7A7] mb-3">
                        {person.name}&rsquo;s orders
                      </p>
                      <div className="space-y-2">
                        {theirOrders.map(order => (
                          <div
                            key={order.id}
                            className="flex flex-wrap items-center gap-x-6 gap-y-2 border border-[#2A2A2a] bg-[#000e07] px-4 py-3"
                          >
                            <span className="font-serif text-sm text-[#DFC27C] w-32">
                              {order.orderNumber}
                            </span>
                            <span className="text-[10px] text-[#A7A7A7] w-24">
                              {formatDate(order.createdAt)}
                            </span>
                            <span className="text-[11px] text-[#F5F2EE] flex-1 min-w-[12rem]">
                              {(order.items ?? [])
                                .map(item => `${item.product?.name ?? 'Piece'} x${item.quantity}`)
                                .join(', ') || '—'}
                            </span>
                            <span
                              className={`text-[9px] uppercase tracking-wider px-2 py-1 border ${
                                order.paymentStatus === 'Paid'
                                  ? 'border-emerald-500/40 text-emerald-300'
                                  : order.paymentStatus === 'Failed'
                                    ? 'border-red-500/40 text-red-300'
                                    : 'border-[#C5A059]/40 text-[#DFC27C]'
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider px-2 py-1 border border-[#2A2A2a] text-[#A7A7A7]">
                              {order.orderStatus}
                            </span>
                            <span className="text-sm text-[#F5F2EE] w-20 text-right">
                              {inr(order.totalINR)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              </React.Fragment>
            );})}
          </tbody>
        </table>

        {visible.length === 0 && (
          <div className="p-10 text-center text-xs text-[#A7A7A7]">
            {customers.length === 0
              ? 'Nobody has signed up yet.'
              : 'No customer matches that search.'}
          </div>
        )}
      </div>
    </div>
  );
};
