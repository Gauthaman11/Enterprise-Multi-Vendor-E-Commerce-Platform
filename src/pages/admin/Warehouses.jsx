import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadWarehouses(); }, []);

  async function loadWarehouses() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/admin/warehouses");
      setWarehouses(res.data || []);
    } catch (e) {
      console.error("Failed to load warehouses:", e);
      setError(e.response?.data?.message || e.message || "Failed to load warehouses");
    } finally {
      setLoading(false);
    }
  }

  async function viewInventory(warehouse) {
    setSelectedWarehouse(warehouse);
    try {
      const res = await api.get(`/admin/warehouses/${warehouse.id}/inventory`);
      setInventory(res.data || []);
    } catch (e) {
      console.error("Failed to load inventory:", e);
      setInventory([]);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-stone-500">Loading warehouses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
        <p className="text-rose-700 font-semibold">Error loading warehouses</p>
        <p className="text-rose-600 text-sm mt-2">{error}</p>
        <button 
          onClick={loadWarehouses}
          className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-white hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Operations</p>
        <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900">Warehouse Management</h1>
        <p className="mt-1.5 text-[14px] text-stone-500">Monitor warehouse allocation, operations, and inventory levels.</p>
      </div>

      {/* Warehouse List */}
      {warehouses.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-12 text-center">
          <p className="text-stone-500 font-medium">No warehouses found</p>
          <p className="text-stone-400 text-sm mt-2">Add warehouses to your database to manage inventory</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {warehouses.map((w) => (
            <div 
              key={w.id} 
              onClick={() => viewInventory(w)}
              className={`cursor-pointer rounded-2xl border p-6 transition hover:shadow-lg ${
                selectedWarehouse?.id === w.id ? "border-emerald-600 bg-emerald-50/50" : "border-stone-200 bg-white hover:border-emerald-300"
              }`}
            >
              <h3 className="font-['Fraunces',serif] text-xl font-semibold text-stone-900">{w.name}</h3>
              <p className="mt-1 text-[13px] text-stone-500">{w.city}{w.state ? `, ${w.state}` : ''}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${w.active ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                <span className="text-[12px] font-semibold uppercase tracking-wider text-stone-600">
                  {w.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inventory Details */}
      {selectedWarehouse && (
        <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]">
          <div className="border-b border-stone-100 bg-stone-50/50 p-5">
            <h2 className="font-['Fraunces',serif] text-xl font-semibold text-stone-900">
              Inventory at {selectedWarehouse.name}
            </h2>
          </div>
          <table className="w-full text-[14px] text-left">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Total Stock</th>
                <th className="px-5 py-3">Allocated (Reserved)</th>
                <th className="px-5 py-3">Available to Sell</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-5 py-10 text-center text-stone-500">
                    No inventory in this warehouse.
                  </td>
                </tr>
              ) : (
                inventory.map((inv) => {
                  const totalStock = inv.totalStock ?? inv.total_stock ?? 0;
                  const allocatedStock = inv.allocatedStock ?? inv.allocated_stock ?? 0;
                  const availableStock = totalStock - allocatedStock;
                  const productId = inv.product?.id ?? inv.product_id ?? inv.productId ?? 'N/A';
                  const productName = inv.product?.name ?? inv.product_name ?? `Product #${productId}`;

                  return (
                    <tr key={inv.id} className="hover:bg-stone-50/40">
                      <td className="px-5 py-4 font-semibold text-stone-900">
                        {productName} <span className="text-stone-400 text-[11px]">(ID: {productId})</span>
                      </td>
                      <td className="px-5 py-4 text-stone-600 font-medium">{totalStock}</td>
                      <td className="px-5 py-4 text-amber-700 font-semibold">{allocatedStock}</td>
                      <td className="px-5 py-4 text-emerald-700 font-bold">
                        {isNaN(availableStock) ? 0 : availableStock}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}