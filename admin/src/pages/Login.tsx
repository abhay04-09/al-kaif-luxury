import React, { useState } from 'react';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';
import { apiJson, setToken } from '../api';
import { User } from '../types';

export const LoginPage: React.FC<{ onLogin: (user: User) => void; notice?: string | null }> = ({
  onLogin,
  notice,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const data = await apiJson<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.user.role !== 'admin') {
        setError('This account does not have admin access.');
        return;
      }
      setToken(data.token);
      onLogin(data.user);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#FFFFFF] border border-[#B8860B] rounded-sm p-8 space-y-6 shadow-2xl"
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-[#B8860B]/10 border border-[#B8860B]/50 flex items-center justify-center mx-auto text-[#B8860B] mb-3">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl text-gold-gradient uppercase">AL-KAIFF Admin</h1>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="text-[#996515] block mb-1 font-medium">ADMIN EMAIL</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#B8860B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#FBF9F5] border border-[#EAE5D9] text-[#18181B] p-2.5 pl-9 rounded-xs focus:border-[#B8860B] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[#996515] block mb-1 font-medium">PASSWORD</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#B8860B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#FBF9F5] border border-[#EAE5D9] text-[#18181B] p-2.5 pl-9 rounded-xs focus:border-[#B8860B] focus:outline-none"
              />
            </div>
          </div>

          {!error && notice && (
            <div className="p-3 bg-[#FDF6E3] border border-[#B8860B]/40 rounded-xs text-[#7A5C05] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#B8860B]" />
              <span>{notice}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-500/40 rounded-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-700" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#B8860B] text-black font-bold tracking-widest uppercase rounded-xs hover:bg-[#D19A1C] transition-colors disabled:opacity-60"
          >
            {isSubmitting ? 'SIGNING IN...' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  );
};
