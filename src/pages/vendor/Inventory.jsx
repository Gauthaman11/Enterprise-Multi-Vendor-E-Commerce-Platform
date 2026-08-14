import { useEffect, useState } from "react";
import {
  getVendorProducts,
  updateStock,
  updatePrice,
  updateDiscount, // ✅ ADDED IMPORT
} from "../../api/vendorApi";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState({});
  const [savingId, setSavingId] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const res = await getVendorProducts();
      setProducts(res.data || []);
    } catch (e) {
      console.error("Failed to load inventory:", e);
    } finally {
      setLoading(false);
    }
  }

  // ✅ CLEANED UP: No duplicate functions
  function getEdit(p) {
    return edits[p.id] || { 
      stock: p.stock, 
      price: p.price, 
      discountPercentage: p.discountPercentage || 0 
    };
  }

  function setEdit(p, field, value) {
    setEdits({
      ...edits,
      [p.id]: { ...getEdit(p), [field]: value },
    });
  }

  function isDirty(p) {
    const e = getEdit(p);
    return (
      Number(e.stock) !== Number(p.stock) ||
      Number(e.price) !== Number(p.price) ||
      Number(e.discountPercentage) !== Number(p.discountPercentage || 0)
    );
  }

    async function handleSave(p) {
    const e = getEdit(p);
    setSavingId(p.id);
    
    // 🛡️ Prevent "NaN" errors if the user clears the input box to type a new number
    const newStock = Number(e.stock) || 0;
    const newPrice = Number(e.price) || 0;
    const newDiscount = Number(e.discountPercentage) || 0;

    try {
      if (newStock !== Number(p.stock)) {
        console.log("🔄 Updating stock...");
        await updateStock(p.id, newStock);
      }
      if (newPrice !== Number(p.price)) {
        console.log("🔄 Updating price...");
        await updatePrice(p.id, newPrice);
      }
      if (newDiscount !== Number(p.discountPercentage || 0)) {
        console.log("🔄 Updating discount...");
        await updateDiscount(p.id, newDiscount);
      }
      
      const next = { ...edits };
      delete next[p.id];
      setEdits(next);
      await load();
    } catch (err) {
      console.error("❌ Inventory Update Error:", err);
      
      // 🆕 DIAGNOSTIC ALERT: Shows the exact backend error
      const status = err.response?.status || "Network";
      const msg = err.response?.data?.message || err.response?.data || err.message;
      alert(`Failed to update!\nStatus: ${status}\nBackend says: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
    } finally {
      setSavingId(null);
    }
  }

  const lowStock = products.filter((p) => p.stock > 0 && p.stock < 5);
  const outOfStock = products.filter((p) => p.stock <= 0);
  const stockValue = products.reduce(
    (sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0), 0
  );

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent" style={{ animation: "iv-spin 0.9s linear infinite" }} />
          </div>
          <p className="text-[14px] font-medium text-stone-500">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <style>{`
        @keyframes iv-spin { to { transform: rotate(360deg); } }
        @keyframes iv-fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .iv-fade-up { animation: iv-fade-up .5s cubic-bezier(.22, 1, .36, 1) both; }
      `}</style>

      <div className="iv-fade-up">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Stockroom</p>
        <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">Inventory & Pricing</h1>
        <p className="mt-1.5 text-[14px] text-stone-500">Track stock levels, update prices, and apply discounts in real time.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Total Products" value={products.length} color="text-stone-900" iconColor="bg-stone-100 text-stone-700" icon="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        <SummaryCard title="Stock Value" value={`₹${stockValue.toLocaleString("en-IN")}`} color="text-emerald-700" iconColor="bg-emerald-50 text-emerald-700" icon="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <SummaryCard title="Low Stock" value={lowStock.length} color="text-amber-700" iconColor="bg-amber-50 text-amber-700" icon="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        <SummaryCard title="Out of Stock" value={outOfStock.length} color="text-rose-700" iconColor="bg-rose-50 text-rose-700" icon="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </div>

      <div className="iv-fade-up overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]" style={{ animationDelay: "120ms" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[14px] text-left">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Price (₹)</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Discount %</th> {/* ✅ Reordered */}
                <th className="px-5 py-3">Health</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {products.map((p) => {
                const edit = getEdit(p);
                const dirty = isDirty(p);
                const isSaving = savingId === p.id;

                return (
                  <tr key={p.id} className={`transition ${dirty ? "bg-amber-50/30" : "hover:bg-stone-50/40"}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl} alt={p.name} className="h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-stone-200" />
                        <span className="font-['Fraunces',serif] text-[15px] font-semibold text-stone-900 leading-snug">{p.name}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4"><ApprovalBadge status={p.status} /></td>

                    <td className="px-5 py-4">
                      <input type="number" min="1" value={edit.price} onChange={(e) => setEdit(p, "price", e.target.value)}
                        className={`w-24 rounded-lg border px-3 py-1.5 text-[14px] text-stone-900 tabular-nums outline-none transition ${dirty ? "border-amber-300 bg-amber-50" : "border-stone-200 bg-stone-50/60"}`} />
                    </td>

                    <td className="px-5 py-4">
                      <input type="number" min="0" value={edit.stock} onChange={(e) => setEdit(p, "stock", e.target.value)}
                        className={`w-20 rounded-lg border px-3 py-1.5 text-[14px] text-stone-900 tabular-nums outline-none transition ${dirty ? "border-amber-300 bg-amber-50" : "border-stone-200 bg-stone-50/60"}`} />
                    </td>

                    {/* ✅ Discount Input */}
                    <td className="px-5 py-4">
                      <input type="number" min="0" max="90" value={edit.discountPercentage} onChange={(e) => setEdit(p, "discountPercentage", e.target.value)}
                        className={`w-20 rounded-lg border px-3 py-1.5 text-[14px] text-stone-900 tabular-nums outline-none transition ${dirty ? "border-amber-300 bg-amber-50" : "border-stone-200 bg-stone-50/60"}`} />
                    </td>

                    <td className="px-5 py-4"><StockBadge stock={p.stock} /></td>

                    <td className="px-5 py-4 text-right">
                      {dirty ? (
                        <button onClick={() => handleSave(p)} disabled={isSaving}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-1.5 text-[13px] font-semibold text-white shadow-sm shadow-emerald-800/20 transition-all hover:bg-emerald-800 disabled:bg-stone-300 disabled:shadow-none">
                          {isSaving ? (
                            <><svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "iv-spin 0.9s linear infinite" }}><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" /></svg>Saving...</>
                          ) : (
                            <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Save</>
                          )}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[12px] text-stone-400">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-emerald-500"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                          Saved
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {products.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <p className="font-['Fraunces',serif] text-[15px] font-semibold text-stone-900">No products found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------- Helper components ----------
function SummaryCard({ title, value, color, iconColor, icon }) {
  return (
    <div className="iv-fade-up relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-20px_rgba(6,35,31,0.22)]">
      <div className="flex items-center gap-3.5">
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${iconColor} ring-1 ring-stone-900/5`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">{title}</p>
          <p className={`mt-0.5 truncate font-['Fraunces',serif] text-2xl font-semibold tracking-tight tabular-nums ${color}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function StockBadge({ stock }) {
  if (stock <= 0) return <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-rose-700 ring-1 ring-rose-600/15"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" />Out of Stock</span>;
  if (stock < 5) return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-amber-700 ring-1 ring-amber-600/15"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Low Stock</span>;
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-700 ring-1 ring-emerald-600/15"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />In Stock</span>;
}

function ApprovalBadge({ status }) {
  const s = (status || "").toUpperCase();
  if (s === "APPROVED") return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-700 ring-1 ring-emerald-600/15"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Approved</span>;
  if (s === "REJECTED") return <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-rose-700 ring-1 ring-rose-600/15"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" />Rejected</span>;
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-amber-700 ring-1 ring-amber-600/15"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Pending</span>;
}