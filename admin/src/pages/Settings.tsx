import React, { useEffect, useState } from 'react';
import { Layers, Loader2, Save, Truck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiJson } from '../api';
import { PriceTierSettings, ShippingSettings } from '../types';

const DEFAULTS: ShippingSettings = {
  liveRates: true,
  flatINR: 79,
  codFeeINR: 0,
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
  const [tiers, setTiers] = useState<PriceTierSettings>({ classicUnder: 299, premiumAbove: 1299 });
  const [savingTiers, setSavingTiers] = useState(false);

  useEffect(() => {
    apiJson<ShippingSettings>('/api/settings/shipping')
      .then(setForm)
      .catch((err: any) => toast.error(err?.message || 'Could not load the shipping settings'))
      .finally(() => setLoading(false));
    apiJson<PriceTierSettings>('/api/settings/tiers').then(setTiers).catch(() => {});
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

  const saveTiers = async () => {
    setSavingTiers(true);
    try {
      const saved = await apiJson<PriceTierSettings>('/api/settings/tiers', {
        method: 'PUT',
        body: JSON.stringify(tiers),
      });
      setTiers(saved);
      toast.success('Sections updated');
    } catch (err: any) {
      toast.error(err?.message || 'Could not save');
    } finally {
      setSavingTiers(false);
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
          <Layers className="w-3.5 h-3.5 text-[#C5A059]" />
          Jewellery sections
        </div>

        <p className="text-[11px] text-[#A7A7A7] leading-relaxed">
          Every piece falls into a section by its price alone. There is nothing to pick when
          adding a product, and nothing that can be set to disagree with the price beside it —
          change a price and the piece moves section on save.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          <Field
            label="Classic is under"
            hint="Anything cheaper than this is Classic."
            value={tiers.classicUnder}
            onChange={classicUnder => setTiers({ ...tiers, classicUnder })}
          />
          <Field
            label="Premium is above"
            hint="Anything dearer than this is Premium. Everything in between is Standard."
            value={tiers.premiumAbove}
            onChange={premiumAbove => setTiers({ ...tiers, premiumAbove })}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="px-2 py-1 border border-[#8AB4F8]/40 text-[#8AB4F8] rounded-xs">
            Classic — under ₹{tiers.classicUnder.toLocaleString('en-IN')}
          </span>
          <span className="px-2 py-1 border border-[#C5A059]/50 text-[#DFC27C] rounded-xs">
            Standard — ₹{tiers.classicUnder.toLocaleString('en-IN')} to ₹
            {tiers.premiumAbove.toLocaleString('en-IN')}
          </span>
          <span className="px-2 py-1 border border-[#FFD700]/60 text-[#FFD700] rounded-xs">
            Premium — above ₹{tiers.premiumAbove.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="border-t border-[#2A2A2a] pt-5">
          <button
            onClick={saveTiers}
            disabled={savingTiers}
            className="inline-flex items-center gap-2 bg-[#C5A059] hover:bg-[#FFD700] text-black px-4 py-2 text-[11px] font-semibold uppercase tracking-wider rounded-xs disabled:opacity-40"
          >
            {savingTiers ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save sections
          </button>
        </div>
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
            label="Fallback rate"
            hint="Only used if the courier does not answer within four seconds, or if live rates are switched off above. Customers are normally charged the real rate to their own pin code."
            value={form.flatINR}
            onChange={flatINR => setForm({ ...form, flatINR })}
          />
          <Field
            label="Cash on delivery charge"
            hint="Added to COD orders on top of the courier's rate. Leave at 0: the live COD rate already contains the courier's own collection charge, so anything here is charged for the second time."
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
              ? `Live rates on. Each customer is charged the real cost to their pin code; ₹${form.flatINR} only if the courier does not answer.`
              : `Live rates off — every order is charged ₹${form.flatINR}.`}
            {form.freeAboveINR > 0 && ` Free over ₹${form.freeAboveINR.toLocaleString('en-IN')}.`}
          </p>
        </div>
      </div>
    </div>
  );
};
