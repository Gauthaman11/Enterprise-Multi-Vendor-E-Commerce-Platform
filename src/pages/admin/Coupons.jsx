import { useEffect, useState } from "react";
import { getCoupons, createCoupon, toggleCoupon, deleteCoupon } from "../../api/adminApi";

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // 🆕 Added startDate and maxDiscount to form state
  const [form, setForm] = useState({
    code: "", 
    discountType: "PERCENTAGE", 
    discountValue: "",
    minOrderAmount: "", 
    startDate: "", 
    expiryDate: "", 
    maxDiscount: "", 
    usageLimit: "", 
    description: "",
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try { 
      const res = await getCoupons(); 
      setCoupons(res.data || []); 
    } catch (e) { 
      console.error(e); 
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await createCoupon({
        ...form,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
        startDate: form.startDate || null, // 🆕
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null, // 🆕
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiryDate: form.expiryDate || null,
      });
      setForm({ 
        code: "", discountType: "PERCENTAGE", discountValue: "", 
        minOrderAmount: "", startDate: "", expiryDate: "", 
        maxDiscount: "", usageLimit: "", description: "" 
      });
      setShowForm(false);
      load();
    } catch (e) { 
      alert(e.response?.data?.message || "Failed to create coupon"); 
    }
  }

  async function handleToggle(id) { 
    await toggleCoupon(id); 
    load(); 
  }
  
  async function handleDelete(id) {
    if (!window.confirm("Delete this coupon?")) return;
    await deleteCoupon(id); 
    load();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700">Promotions</p>
          <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            Coupon Engine
          </h1>
          <p className="mt-1.5 text-[14px] text-stone-500">Create and manage discount codes for customers.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
                className="rounded-lg bg-sky-700 px-4 py-2 text-[14px] font-semibold text-white hover:bg-sky-800">
          {showForm ? "Cancel" : "+ New Coupon"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 rounded-2xl border border-stone-200 bg-white p-6 sm:grid-cols-2 lg:grid-cols-4">
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                 placeholder="Code (e.g. SAVE20)" required className="rounded-lg border border-stone-300 px-3 py-2" />
          
          <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                  className="rounded-lg border border-stone-300 px-3 py-2">
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FLAT">Flat (₹)</option>
          </select>
          
          <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                 placeholder="Value (20 = 20% or ₹20)" required className="rounded-lg border border-stone-300 px-3 py-2" />
          
          <input type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                 placeholder="Min order ₹ (optional)" className="rounded-lg border border-stone-300 px-3 py-2" />
          
          {/* 🆕 Start Date & Expiry Date */}
          <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                 title="Start Date" className="rounded-lg border border-stone-300 px-3 py-2 text-stone-600" />
          <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                 title="Expiry Date" className="rounded-lg border border-stone-300 px-3 py-2 text-stone-600" />
          
          {/* 🆕 Maximum Discount */}
          <input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                 placeholder="Max Discount ₹ (Optional)" className="rounded-lg border border-stone-300 px-3 py-2" />
          
          <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                 placeholder="Usage limit (blank = ∞)" className="rounded-lg border border-stone-300 px-3 py-2" />
          
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                 placeholder="Description" className="rounded-lg border border-stone-300 px-3 py-2 lg:col-span-2" />
          
          <button type="submit" className="rounded-lg bg-emerald-700 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-800 lg:col-span-4">
            Create Coupon
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px] text-left">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Discount</th>
                <th className="px-5 py-3">Min Order</th>
                <th className="px-5 py-3">Validity</th>
                <th className="px-5 py-3">Analytics & Usage</th> {/* 🆕 Updated Header */}
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50/40">
                  <td className="px-5 py-4 font-['Fraunces',serif] text-[15px] font-bold text-stone-900">🎟️ {c.code}</td>
                  <td className="px-5 py-4 font-semibold text-emerald-700">
                    {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                    {c.maxDiscount && c.discountType === "PERCENTAGE" && (
                      <span className="block text-[11px] font-normal text-stone-500">Max: ₹{c.maxDiscount}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-stone-600">₹{c.minOrderAmount || 0}</td>
                  <td className="px-5 py-4 text-stone-600 text-[13px]">
                    {c.startDate ? `${c.startDate} to` : "Always"}<br />
                    {c.expiryDate || "Never"}
                  </td>
                  
                  {/* 🆕 Analytics & Usage Column */}
                  <td className="px-5 py-4 tabular-nums">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-semibold text-stone-900">
                        {c.usedCount} / {c.usageLimit ?? "∞"} uses
                      </span>
                      <span className="text-[11px] text-emerald-700 font-medium">
                        💰 ₹{c.totalDiscountProvided || 0} saved by customers
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ring-1 ${
                      c.active ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15" : "bg-rose-50 text-rose-700 ring-rose-600/15"
                    }`}>{c.active ? "Active" : "Disabled"}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleToggle(c.id)}
                              className="rounded-lg border border-stone-300 px-3 py-1.5 text-[12px] font-semibold text-stone-700 hover:bg-stone-50">
                        {c.active ? "Disable" : "Enable"}
                      </button>
                      <button onClick={() => handleDelete(c.id)}
                              className="rounded-lg border border-rose-200 px-3 py-1.5 text-[12px] font-semibold text-rose-700 hover:bg-rose-50">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr><td colSpan="7" className="px-5 py-16 text-center text-stone-500">No coupons yet. Create your first one!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}