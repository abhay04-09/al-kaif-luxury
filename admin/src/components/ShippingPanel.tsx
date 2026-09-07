import React, { useState } from 'react';
import { Copy, Loader2, MapPin, Package, RefreshCw, Truck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiJson } from '../api';
import { Order } from '../types';

type Tracking = {
  awbNumber: string | null;
  courierName?: string | null;
  status: string | null;
  history: { status: string; location?: string; at?: string }[];
  stale?: boolean;
};

/**
 * The shipping half of an order: hand it to the courier, or record an AWB
 * booked in the courier's own panel, then follow the parcel.
 *
 * Entering a number by hand matters as much as the button. However the maison
 * ends up booking a parcel — a bulk upload, a phone call, the courier's site —
 * the client should still be able to track it here.
 */
export const ShippingPanel: React.FC<{
  order: Order;
  onChange: (order: Order) => void;
}> = ({ order, onChange }) => {
  const [busy, setBusy] = useState<null | 'ship' | 'awb' | 'track' | 'pickup'>(null);
  const [awb, setAwb] = useState('');
  const [courier, setCourier] = useState('');
  const [tracking, setTracking] = useState<Tracking | null>(null);

  const shipped = Boolean(order.awbNumber || order.shipmozoOrderId);

  const ship = async () => {
    setBusy('ship');
    try {
      const updated = await apiJson<Order>(`/api/orders/${order.id}/ship`, { method: 'POST' });
      onChange(updated);
      toast.success(
        updated.awbNumber
          ? `Sent to courier — AWB ${updated.awbNumber}`
          : 'Sent to courier; awaiting an AWB'
      );
    } catch (err: any) {
      toast.error(err?.message || 'The courier refused this order');
    } finally {
      setBusy(null);
    }
  };

  const saveAwb = async () => {
    if (!awb.trim()) return;
    setBusy('awb');
    try {
      const updated = await apiJson<Order>(`/api/orders/${order.id}/awb`, {
        method: 'PUT',
        body: JSON.stringify({ awbNumber: awb.trim(), courierName: courier.trim() || undefined }),
      });
      onChange(updated);
      setAwb('');
      setCourier('');
      toast.success('Tracking number saved');
    } catch (err: any) {
      toast.error(err?.message || 'Could not save that AWB');
    } finally {
      setBusy(null);
    }
  };

  const track = async () => {
    setBusy('track');
    try {
      const data = await apiJson<Tracking>(`/api/orders/${order.orderNumber}/tracking`);
      setTracking(data);
      if (data.stale) toast.error('The courier did not answer; showing the last known status');
      else if (data.status) onChange({ ...order, trackingStatus: data.status });
    } catch (err: any) {
      toast.error(err?.message || 'Could not reach the courier');
    } finally {
      setBusy(null);
    }
  };

  const pickup = async () => {
    setBusy('pickup');
    try {
      await apiJson(`/api/orders/${order.id}/pickup`, { method: 'POST' });
      toast.success('Pickup requested');
    } catch (err: any) {
      toast.error(err?.message || 'Could not schedule the pickup');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="border-t border-[#2A2A2a] pt-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#A7A7A7] flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
          Shipping
        </span>

        {shipped ? (
          <div className="flex flex-wrap items-center gap-2">
            {order.courierName && (
              <span className="text-[10px] text-[#A7A7A7]">{order.courierName}</span>
            )}
            {order.awbNumber && (
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(order.awbNumber!);
                  toast.success('AWB copied');
                }}
                title="Copy AWB"
                className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#FFD700] border border-[#C5A059]/40 px-2 py-1 rounded-xs hover:border-[#C5A059]"
              >
                {order.awbNumber}
                <Copy className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={track}
              disabled={busy !== null || !order.awbNumber}
              className="inline-flex items-center gap-1.5 border border-[#2A2A2a] hover:border-[#C5A059] text-[#DFC27C] px-2.5 py-1 text-[10px] uppercase tracking-wider rounded-xs disabled:opacity-40"
            >
              {busy === 'track' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              Track
            </button>
            {order.shipmozoOrderId && (
              <button
                onClick={pickup}
                disabled={busy !== null}
                className="inline-flex items-center gap-1.5 border border-[#2A2A2a] hover:border-[#C5A059] text-[#A7A7A7] px-2.5 py-1 text-[10px] uppercase tracking-wider rounded-xs disabled:opacity-40"
              >
                {busy === 'pickup' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Package className="w-3 h-3" />
                )}
                Pickup
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={ship}
              disabled={busy !== null}
              className="inline-flex items-center gap-2 bg-[#C5A059] hover:bg-[#FFD700] text-black px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider rounded-xs disabled:opacity-40"
            >
              {busy === 'ship' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Truck className="w-3 h-3" />
              )}
              Ship with Shipmozo
            </button>

            <span className="text-[10px] text-[#A7A7A7]">or</span>

            <input
              value={awb}
              onChange={e => setAwb(e.target.value)}
              placeholder="Paste AWB"
              className="w-32 bg-[#000e07] border border-[#2A2A2a] rounded-xs px-2 py-1.5 text-[11px] font-mono text-[#F5F2EE] placeholder:text-[#A7A7A7]/50 focus:border-[#C5A059] outline-none"
            />
            <input
              value={courier}
              onChange={e => setCourier(e.target.value)}
              placeholder="Courier"
              className="w-24 bg-[#000e07] border border-[#2A2A2a] rounded-xs px-2 py-1.5 text-[11px] text-[#F5F2EE] placeholder:text-[#A7A7A7]/50 focus:border-[#C5A059] outline-none"
            />
            <button
              onClick={saveAwb}
              disabled={busy !== null || !awb.trim()}
              className="border border-[#2A2A2a] hover:border-[#C5A059] text-[#DFC27C] px-2.5 py-1.5 text-[10px] uppercase tracking-wider rounded-xs disabled:opacity-40"
            >
              {busy === 'awb' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
            </button>
          </div>
        )}
      </div>

      {(order.trackingStatus || tracking?.status) && (
        <p className="text-[11px] text-[#F5F2EE]">
          <span className="text-[#A7A7A7]">Status: </span>
          {tracking?.status ?? order.trackingStatus}
          {tracking?.stale && <span className="text-[#A7A7A7]"> (last known)</span>}
        </p>
      )}

      {tracking?.history && tracking.history.length > 0 && (
        <ol className="space-y-1.5 border-l border-[#2A2A2a] pl-3">
          {tracking.history.map((scan, i) => (
            <li key={i} className="text-[10px] text-[#A7A7A7]">
              <span className="text-[#F5F2EE]">{scan.status}</span>
              {scan.location && (
                <span className="inline-flex items-center gap-1 ml-2">
                  <MapPin className="w-2.5 h-2.5" />
                  {scan.location}
                </span>
              )}
              {scan.at && <span className="ml-2">{scan.at}</span>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
