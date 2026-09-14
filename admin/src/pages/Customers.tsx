import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Loader2, Search, Shield, ShoppingBag, UserRound } from 'lucide-react';
import { apiJson } from '../api';
import { Customer, Order } from '../types';
import { ExportButton } from '../components/ExportButton';
import { customerColumns, orderColumns } from '../exports';

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
  <div className="border border-[#EAE5D9] rounded-xs bg-[#FBF9F5] p-4">
    <span className="text-[10px] uppercase tracking-[0.2em] text-[#6B7280]">{label}</span>
    <p className="mt-2 font-serif text-2xl text-[#18181B]">{value}</p>
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
        <Loader2 className="w-6 h-6 text-[#B8860B] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl text-gold-gradient uppercase">
          Customers ({customers.length})
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <ExportButton
            rows={visible}
            columns={customerColumns}
            filename="al-kaif-customers"
            label="Export customers"
          />
          <ExportButton
            rows={orders}
            columns={orderColumns}
            filename="al-kaif-orders"
            label="Export all orders"
          />
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search name, email or phone"
            className="w-72 bg-[#FBF9F5] border border-[#EAE5D9] rounded-xs pl-9 pr-3 py-2 text-xs text-[#18181B] placeholder:text-[#6B7280]/60 focus:border-[#B8860B] outline-none"
          />
        </div>
        </div>
      </div>

      {error && (
        <div className="border border-red-500/40 bg-red-50 rounded-xs p-4 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3 max-w-2xl">
        <Stat label="Total sign-ups" value={String(customers.length)} />
        <Stat label="Joined this month" value={String(signedUpThisMonth)} />
        <Stat label="Have ordered" value={String(withOrders)} />
      </div>

      <div className="border border-[#EAE5D9] rounded-xs bg-[#FBF9F5] overflow-x-auto">
        <table className="w-full text-xs min-w-[900px]">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-[#6B7280] border-b border-[#EAE5D9]">
              <th className="p-4 font-normal">Customer</th>
              <th className="p-4 font-normal">Phone</th>
              <th className="p-4 font-normal hidden lg:table-cell">Saved address</th>
              <th className="p-4 font-normal">Signed up via</th>
              <th className="p-4 font-normal">Joined</th>
              <th className="p-4 font-normal">Orders</th>
              <th className="p-4 font-normal">Spent</th>
              <th className="p-4 font-normal">Last order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE5D9]">
            {visible.map(person => {
              const theirOrders = ordersByCustomer.get(person.id) ?? [];
              const isOpen = expanded === person.id;
              return (
              <React.Fragment key={person.id}>
              <tr
                className={`hover:bg-[#FBF9F5] ${theirOrders.length ? 'cursor-pointer' : ''}`}
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
                        className="w-8 h-8 rounded-full object-cover border border-[#EAE5D9]"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full border border-[#EAE5D9] flex items-center justify-center">
                        <UserRound className="w-4 h-4 text-[#B8860B]" />
                      </span>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#18181B]">{person.name}</span>
                        {person.role === 'admin' && (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-[#B8860B] border border-[#B8860B]/50 px-1.5 py-0.5">
                            <Shield className="w-2.5 h-2.5" />
                            Admin
                          </span>
                        )}
                      </div>
                      <a
                        href={`mailto:${person.email}`}
                        className="text-[10px] text-[#6B7280] hover:text-[#B8860B]"
                      >
                        {person.email}
                      </a>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-[#6B7280]">
                  {person.phone ? (
                    <a href={`tel:${person.phone}`} className="hover:text-[#B8860B]">
                      {person.phone}
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                {/* What they saved to their account, which is what checkout
                    fills in for them next time. */}
                <td className="p-4 text-[#6B7280] hidden lg:table-cell max-w-64">
                  {person.address ? (
                    <span className="block whitespace-pre-line leading-relaxed" title={person.address}>
                      {person.address}
                    </span>
                  ) : (
                    <span className="text-[#6B7280]/50">Not saved</span>
                  )}
                </td>
                <td className="p-4">
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-1 border ${
                      person.signUpMethod === 'Google'
                        ? 'border-[#4285F4]/50 text-[#1A73E8]'
                        : 'border-[#B8860B]/40 text-[#996515]'
                    }`}
                  >
                    {person.signUpMethod}
                  </span>
                </td>
                <td className="p-4 text-[#6B7280]">{formatDate(person.createdAt)}</td>
                <td className="p-4">
                  {person.orderCount > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-[#18181B]">
                      <ShoppingBag className="w-3 h-3 text-[#B8860B]" />
                      {person.orderCount}
                      {theirOrders.length > 0 && (
                        <ChevronDown
                          className={`w-3 h-3 text-[#6B7280] transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </span>
                  ) : (
                    <span className="text-[#6B7280]">—</span>
                  )}
                </td>
                <td className="p-4 text-[#18181B]">
                  {person.totalSpentINR > 0 ? inr(person.totalSpentINR) : '—'}
                </td>
                <td className="p-4 text-[#6B7280]">{formatDate(person.lastOrderAt)}</td>
              </tr>

              {isOpen && (
                <tr className="bg-[#F5F2EB]">
                  <td colSpan={7} className="p-0">
                    <div className="px-4 py-4 border-l-2 border-[#B8860B]">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B7280] mb-3">
                        {person.name}&rsquo;s orders
                      </p>
                      <div className="space-y-2">
                        {theirOrders.map(order => (
                          <div
                            key={order.id}
                            className="flex flex-wrap items-center gap-x-6 gap-y-2 border border-[#EAE5D9] bg-[#FBF9F5] px-4 py-3"
                          >
                            <span className="font-serif text-sm text-[#996515] w-32">
                              {order.orderNumber}
                            </span>
                            <span className="text-[10px] text-[#6B7280] w-24">
                              {formatDate(order.createdAt)}
                            </span>
                            <span className="text-[11px] text-[#18181B] flex-1 min-w-[12rem]">
                              {(order.items ?? [])
                                .map(item => `${item.product?.name ?? 'Piece'} x${item.quantity}`)
                                .join(', ') || '—'}
                            </span>
                            <span
                              className={`text-[9px] uppercase tracking-wider px-2 py-1 border ${
                                order.paymentStatus === 'Paid'
                                  ? 'border-emerald-500/40 text-emerald-700'
                                  : order.paymentStatus === 'Failed'
                                    ? 'border-red-500/40 text-red-700'
                                    : 'border-[#B8860B]/40 text-[#996515]'
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider px-2 py-1 border border-[#EAE5D9] text-[#6B7280]">
                              {order.orderStatus}
                            </span>
                            <span className="text-sm text-[#18181B] w-20 text-right">
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
          <div className="p-10 text-center text-xs text-[#6B7280]">
            {customers.length === 0
              ? 'Nobody has signed up yet.'
              : 'No customer matches that search.'}
          </div>
        )}
      </div>
    </div>
  );
};
