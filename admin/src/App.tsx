import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Shield, LayoutDashboard, Package, ShoppingBag, Mail, LogOut, Loader2, FolderTree, Archive, Users, SlidersHorizontal } from 'lucide-react';
import { apiJson, getToken, setToken, SESSION_EXPIRED_EVENT } from './api';
import { User } from './types';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { ProductsPage } from './pages/Products';
import { OrdersPage } from './pages/Orders';
import { SubscribersPage } from './pages/Subscribers';
import { CategoriesPage } from './pages/Categories';
import { CustomersPage } from './pages/Customers';
import { SettingsPage } from './pages/Settings';

type Tab = 'dashboard' | 'products' | 'archived' | 'categories' | 'orders' | 'customers' | 'subscribers' | 'settings';

const NAV: { id: Tab; label: string; icon: React.FC<any> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'archived', label: 'Archived', icon: Archive },
  { id: 'categories', label: 'Categories', icon: FolderTree },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'subscribers', label: 'Subscribers', icon: Mail },
  { id: 'settings', label: 'Settings', icon: SlidersHorizontal },
];

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [signedOutNotice, setSignedOutNotice] = useState<string | null>(null);

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
    setSignedOutNotice(null);
    setUser(null);
  };

  // A session that runs out while the panel is open used to leave a form that
  // simply refused to save. Now the sign-in screen comes back and says why.
  useEffect(() => {
    const expired = () => {
      setSignedOutNotice('Your session has expired, so that last change was not saved. Please sign in again and repeat it.');
      setUser(null);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, expired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, expired);
  }, []);

  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#B8860B] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <LoginPage
        notice={signedOutNotice}
        onLogin={next => {
          setSignedOutNotice(null);
          setUser(next);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#FFFFFF', color: '#18181B', border: '1px solid #B8860B', fontSize: '13px' },
          success: { iconTheme: { primary: '#B8860B', secondary: '#FFFFFF' } },
        }}
      />
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-[#FFFFFF] border-r border-[#EAE5D9] flex flex-col">
        <div className="p-5 border-b border-[#EAE5D9]">
          <div className="flex items-center gap-2 text-[#B8860B]">
            <Shield className="w-5 h-5" />
            <span className="font-serif text-lg text-gold-gradient">AL-KAIFF</span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#996515]">Admin Panel</span>
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
                    ? 'bg-[#B8860B] text-black font-semibold'
                    : 'text-[#6B7280] hover:text-[#18181B] hover:bg-[#F5F2EB]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#EAE5D9] space-y-3">
          <div className="text-xs">
            <span className="text-[#B8860B] block font-medium">{user.name}</span>
            <span className="text-[#6B7280] text-[10px]">{user.email}</span>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-500/40 text-red-700 text-[11px] uppercase tracking-wider rounded-xs"
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
        {tab === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
};
