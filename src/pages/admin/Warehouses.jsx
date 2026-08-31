import { useEffect, useState } from "react";
import { getWarehouses, createWarehouse } from "../../api/adminApi";

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({ name: "", city: "", state: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await getWarehouses();
      setWarehouses(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await createWarehouse(form);
      setForm({ name: "", city: "", state: "" });
      load();
    } catch (e) {
      alert("Failed to create warehouse: " + (e.response?.data?.message || e.message));
    }
  }

  if (loading) return <div className="p-10 text-center text-stone-500">Loading warehouses...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700">Logistics</p>
        <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Warehouse Management
        </h1>
        <p className="mt-1.5 text-[14px] text-stone-500">
          Create physical locations and manage inventory distribution.
        </p>
      </div>

      {/* Create Form */}
      <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:grid-cols-4">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Warehouse Name (e.g. Mumbai Hub)"
          required
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
        />
        <input
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          placeholder="City"
          required
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
        />
        <input
          value={form.state}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
          placeholder="State (e.g. Maharashtra)"
          required
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-sky-700 px-6 py-2 text-sm font-semibold text-white transition hover:bg-sky-800"
        >
          + Add Warehouse
        </button>
      </form>

      {/* Warehouse Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {warehouses.map((w) => (
          <div key={w.id} className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)] transition hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <h3 className="font-['Fraunces',serif] text-lg font-semibold text-stone-900">
                📦 {w.name}
              </h3>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ring-1 ${
                w.active ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15" : "bg-rose-50 text-rose-700 ring-rose-600/15"
              }`}>
                {w.active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="mt-2 text-[13px] text-stone-500">
               {w.city}, {w.state}
            </p>
            <p className="mt-1 text-[12px] text-stone-400">
              ID: {w.id}
            </p>
          </div>
        ))}

        {warehouses.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-12 text-center">
            <p className="text-stone-500">No warehouses created yet. Add your first one above!</p>
          </div>
        )}
      </div>
    </div>
  );
}