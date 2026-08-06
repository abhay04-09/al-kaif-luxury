import React, { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { apiJson } from '../api';

interface Subscriber {
  id: number;
  email: string;
  subscribed_at: string;
}

export const SubscribersPage: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  useEffect(() => {
    apiJson<Subscriber[]>('/api/newsletter').then(setSubscribers).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-gold-gradient uppercase">
        Newsletter Subscribers ({subscribers.length})
      </h1>

      <div className="border border-[#2A2A2a] rounded-xs divide-y divide-[#2A2A2a] bg-[#000e07] max-w-2xl">
        {subscribers.map(s => (
          <div key={s.id} className="p-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#C5A059]" />
              <span className="text-[#F5F2EE]">{s.email}</span>
            </div>
            <span className="text-[10px] text-[#A7A7A7]">
              {new Date(s.subscribed_at).toLocaleDateString()}
            </span>
          </div>
        ))}
        {subscribers.length === 0 && (
          <div className="p-10 text-center text-xs text-[#A7A7A7]">No subscribers yet.</div>
        )}
      </div>
    </div>
  );
};
