import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Shield, LayoutDashboard, Package, ShoppingBag, Mail, LogOut, Loader2, FolderTree, Archive, Users } from 'lucide-react';
import { apiJson, getToken, setToken } from './api';
import { User } from './types';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { ProductsPage } from './pages/Products';
import { OrdersPage } from './pages/Orders';
import { SubscribersPage } from './pages/Subscribers';
import { CategoriesPage } from './pages/Categories';
import { CustomersPage } from './pages/Customers';

type Tab = 'dashboard' | 'products' | 'archived' | 'categories' | 'orders' | 'customers' | 'subscribers';

const NAV: { id: Tab; label: string; icon: React.FC<any> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'archived', label: 'Archived', icon: Archive },
  { id: 'categories', label: 'Categories', icon: FolderTree },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'subscribers', label: 'Subscribers', icon: Mail },
];

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);
  const [tab, setTab] = useState<Tab>('dashboard');

  useEffect(() => {
    const boot = async () => {
      if (getToken()) {
        try {
          const { user: me } = await apiJson<{ user: User | null }>('/api/auth/me');
          if (me?.role === 'admin') setUser(me);
          else setToken(null);
        } catch {
          setToken(null);
        }
      }
      setBooting(false);
    };
    boot();
  }, []);

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginPage onLogin={setUser} />;

  return (
    <div className="min-h-screen flex">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#00140a', color: '#F5F2EE', border: '1px solid #C5A059', fontSize: '13px' },
          success: { iconTheme: { primary: '#C5A059', secondary: '#000' } },
        }}
      />
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-[#00140a] border-r border-[#2A2A2a] flex flex-col">
        <div className="p-5 border-b border-[#2A2A2a]">
          <div className="flex items-center gap-2 text-[#FFD700]">
            <Shield className="w-5 h-5" />
            <span className="font-serif text-lg text-gold-gradient">AL-KAIFF</span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#DFC27C]">Admin Panel</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xs text-xs uppercase tracking-wider transition-colors ${
                  tab === item.id
                    ? 'bg-[#C5A059] text-black font-semibold'
                    : 'text-[#A7A7A7] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#2A2A2a] space-y-3">
          <div className="text-xs">
            <span className="text-[#FFD700] block font-medium">{user.name}</span>
            <span className="text-[#A7A7A7] text-[10px]">{user.email}</span>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-950/70 hover:bg-red-900 border border-red-500/40 text-red-200 text-[11px] uppercase tracking-wider rounded-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
        {tab === 'dashboard' && <DashboardPage onNavigate={t => setTab(t as Tab)} />}
        {tab === 'products' && <ProductsPage key="live" />}
        {tab === 'archived' && <ProductsPage key="archived" archived />}
        {tab === 'categories' && <CategoriesPage />}
        {tab === 'orders' && <OrdersPage />}
        {tab === 'customers' && <CustomersPage />}
        {tab === 'subscribers' && <SubscribersPage />}
      </main>
    </div>
  );
};
