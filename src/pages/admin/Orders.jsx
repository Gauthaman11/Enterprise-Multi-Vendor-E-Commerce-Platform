import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    loadOrders();
    loadWarehouses();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const res = await api.get("/admin/orders");
      setOrders(res.data || []);
    } catch (e) {
      console.error("Failed to load orders:", e);
    } finally {
      setLoading(false);
    }
  }

  async function loadWarehouses() {
    try {
      const res = await api.get("/admin/warehouses");
      setWarehouses(res.data || []);
    } catch (e) {
      console.error("Failed to load warehouses:", e);
    }
  }

  async function handleAllocate(orderId, warehouseId) {
    if (!warehouseId) {
      alert("Please select a warehouse first");
      return;
    }
    
    try {
      await api.put(`/admin/orders/${orderId}/allocate?warehouseId=${warehouseId}`);
      alert("Order allocated to warehouse successfully!");
      loadOrders(); // Refresh the list
    } catch (e) {
      alert("Allocation failed: " + (e.response?.data?.message || e.message));
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "bg-amber-50 text-amber-700 ring-amber-600/15";
      case "CONFIRMED": return "bg-blue-50 text-blue-700 ring-blue-600/15";
      case "SHIPPED": return "bg-indigo-50 text-indigo-700 ring-indigo-600/15";
      case "DELIVERED": return "bg-emerald-50 text-emerald-700 ring-emerald-600/15";
      case "CANCELLED": return "bg-rose-50 text-rose-700 ring-rose-600/15";
      case "REFUNDED": return "bg-emerald-50 text-emerald-700 ring-emerald-600/15";
      default: return "bg-stone-100 text-stone-700";
    }
  };

  if (loading) return <div className="p-10 text-center text-stone-500">Loading orders...</div>;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Operations</p>
        <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900">Order Management</h1>
        <p className="mt-1.5 text-[14px] text-stone-500">Allocate orders to warehouses and monitor fulfillment.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]">
        <table className="w-full text-[14px] text-left">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Warehouse</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-stone-50/40">
                <td className="px-5 py-4 font-semibold text-stone-900">#{order.id}</td>
                <td className="px-5 py-4 text-stone-600">{order.customerName}</td>
                <td className="px-5 py-4 font-semibold text-stone-900">₹{order.totalAmount}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ring-1 ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-stone-600">
                  {order.warehouse ? (
                    <span className="font-medium text-emerald-700">{order.warehouse.name}</span>
                  ) : (
                    <span className="text-amber-600 italic">Not Allocated</span>
                  )}
                </td>
                <td className="px-5 py-4 text-right">
                  {order.status === "PENDING" && !order.warehouse ? (
                    <div className="flex justify-end gap-2">
                      <select 
                        id={`warehouse-${order.id}`}
                        className="rounded-lg border border-stone-300 px-2 py-1 text-[12px] bg-white"
                        defaultValue=""
                      >
                        <option value="" disabled>Select Warehouse</option>
                        {warehouses.map(w => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => {
                          const select = document.getElementById(`warehouse-${order.id}`);
                          handleAllocate(order.id, select.value);
                        }}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-indigo-700"
                      >
                        Allocate
                      </button>
                    </div>
                  ) : (
                    <span className="text-[12px] text-stone-400">Allocated</span>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" className="px-5 py-16 text-center text-stone-500">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}