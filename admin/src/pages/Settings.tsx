import React, { useEffect, useState } from 'react';
import { Loader2, Save, Truck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiJson } from '../api';
import { ShippingSettings } from '../types';

const DEFAULTS: ShippingSettings = {
  liveRates: true,
  flatINR: 79,
  codFeeINR: 49,
  freeAboveINR: 0,
  markupINR: 0,
};

const Field: React.FC<{
  label: string;
  hint: string;
  value: number;
  onChange: (value: number) => void;
}> = ({ label, hint, value, onChange }) => (
  <div>
    <label className="text-[#DFC27C] block mb-1 text-xs uppercase tracking-wider">{label}</label>
    <div className="flex items-center gap-2">
      <span className="text-[#A7A7A7]">₹</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={e => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="w-32 bg-black/60 border border-[#2A2A2a] p-2.5 rounded-xs text-[#F5F2EE] focus:border-[#C5A059] focus:outline-none"
      />
    </div>
    <p className="mt-1.5 text-[11px] text-[#A7A7A7] leading-relaxed">{hint}</p>
  </div>
);

/**
 * What the shop charges to deliver.
 *
 * Kept here rather than in the code because a courier's rates, and a shop's
 * appetite for absorbing them, both change more often than a deployment.
 */
export const SettingsPage: React.FC = () => {
  const [form, setForm] = useState<ShippingSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiJson<ShippingSettings>('/api/settings/shipping')
      .then(setForm)
      .catch((err: any) => toast.error(err?.message || 'Could not load the shipping settings'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const saved = await apiJson<ShippingSettings>('/api/settings/shipping', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setForm(saved);
      toast.success('Shipping charges updated');
    } catch (err: any) {
      toast.error(err?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-[#A7A7A7] text-sm">
        <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-serif text-2xl text-gold-gradient uppercase">Settings</h1>
        <p className="text-[11px] text-[#A7A7A7] mt-1">
          Changes here take effect on the next checkout. Orders already placed keep what they were
          charged.
        </p>
      </div>

      <div className="p-6 bg-[#00140a] border border-[#2A2A2a] rounded-xs space-y-6">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#A7A7A7]">
          <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
          Delivery charges
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.liveRates}
            onChange={e => setForm({ ...form, liveRates: e.target.checked })}
            className="mt-1 accent-[#C5A059]"
          />
          <span>
            <span className="text-[#F5F2EE] text-sm">Ask the courier for a live rate</span>
            <p className="text-[11px] text-[#A7A7A7] mt-0.5 leading-relaxed">
              The customer is charged what the parcel actually costs to their pin code. Turn this
              off to charge the flat rate below on every order.
            </p>
          </span>
        </label>

        <div className="grid sm:grid-cols-2 gap-6">
          <Field
            label="Flat rate"
            hint="Charged when live rates are off, when the courier does not answer in four seconds, or before a pin code has been entered."
            value={form.flatINR}
            onChange={flatINR => setForm({ ...form, flatINR })}
          />
          <Field
            label="Cash on delivery charge"
            hint="Added to COD orders only. Covers the courier's collection fee and discourages casual fake orders."
            value={form.codFeeINR}
            onChange={codFeeINR => setForm({ ...form, codFeeINR })}
          />
          <Field
            label="Free delivery above"
            hint="Carts at or over this value ship free, and the checkout tells the customer how much more to add. Set to 0 to switch this off."
            value={form.freeAboveINR}
            onChange={freeAboveINR => setForm({ ...form, freeAboveINR })}
          />
          <Field
            label="Handling added to each quote"
            hint="Added on top of the courier's own rate, for packaging and the time spent boxing a piece. 0 charges the courier's rate exactly."
            value={form.markupINR}
            onChange={markupINR => setForm({ ...form, markupINR })}
          />
        </div>

        <div className="border-t border-[#2A2A2a] pt-5 flex flex-wrap items-center gap-4">
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#C5A059] hover:bg-[#FFD700] text-black px-4 py-2 text-[11px] font-semibold uppercase tracking-wider rounded-xs disabled:opacity-40"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save
          </button>
          <p className="text-[11px] text-[#A7A7A7]">
            {form.liveRates
              ? `Live rates on. A customer with no pin code yet sees ₹${form.flatINR}.`
              : `Every order is charged ₹${form.flatINR}.`}
            {form.freeAboveINR > 0 && ` Free over ₹${form.freeAboveINR.toLocaleString('en-IN')}.`}
          </p>
        </div>
      </div>
    </div>
  );
};
