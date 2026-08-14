import { useEffect, useState } from "react";
import { getVendorOrders, updateOrderStatus } from "../../api/vendorApi";

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const res = await getVendorOrders();
      setOrders(res.data || []);
    } catch (e) {
      console.error("Failed to load orders:", e);
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(orderId, status) {
    setSavingKey(orderId + status);
    try {
      await updateOrderStatus(orderId, status);
      await load();
    } catch (e) {
      alert("Failed to update order: " + (e.response?.data?.message || e.message));
    } finally {
      setSavingKey(null);
    }
  }

  function StatusBadge({ status }) {
    const colors = {
      PENDING: "bg-amber-50 text-amber-700 ring-amber-600/15",
      CONFIRMED: "bg-blue-50 text-blue-700 ring-blue-600/15",
      SHIPPED: "bg-indigo-50 text-indigo-700 ring-indigo-600/15",
      DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
      CANCELLED: "bg-rose-50 text-rose-700 ring-rose-600/15",
      REJECTED: "bg-rose-50 text-rose-700 ring-rose-600/15",
    };
    return (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ring-1 ${colors[status] || "bg-stone-100 text-stone-600"}`}>
        {status}
      </span>
    );
  }

  function Actions({ row }) {
    const busy = savingKey !== null;
    if (row.status === "PENDING")
      return (
        <div className="flex justify-end gap-2">
          <button
            disabled={busy}
            onClick={() => changeStatus(row.orderId, "CONFIRMED")}
            className="rounded-lg bg-emerald-700 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            Approve
          </button>
          <button
            disabled={busy}
            onClick={() => changeStatus(row.orderId, "REJECTED")}
            className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      );
    if (row.status === "CONFIRMED")
      return (
        <button
          disabled={busy}
          onClick={() => changeStatus(row.orderId, "SHIPPED")}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          Mark Shipped
        </button>
      );
    if (row.status === "SHIPPED")
      return (
        <button
          disabled={busy}
          onClick={() => changeStatus(row.orderId, "DELIVERED")}
          className="rounded-lg bg-emerald-700 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          Mark Delivered
        </button>
      );
    return <span className="text-[12px] text-stone-400">—</span>;
  }

  if (loading)
    return <div className="flex min-h-[60vh] items-center justify-center text-stone-500">Loading orders...</div>;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Sales</p>
        <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900">
          Incoming Orders
        </h1>
        <p className="mt-1.5 text-[14px] text-stone-500">Approve, ship and deliver customer orders.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px] text-left">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Qty</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((row, i) => (
                <tr key={i} className="hover:bg-stone-50/40">
                  <td className="px-5 py-4 font-semibold text-stone-900">#{row.orderId}</td>
                  <td className="px-5 py-4 text-stone-600">{row.customerName}</td>
                  <td className="px-5 py-4 text-stone-600">{row.productName}</td>
                  <td className="px-5 py-4 text-stone-600">{row.quantity}</td>
                  <td className="px-5 py-4 font-semibold text-stone-900">₹{row.subtotal}</td>
                  <td className="px-5 py-4"><StatusBadge status={row.status} /></td>
                  <td className="px-5 py-4 text-right"><Actions row={row} /></td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center text-stone-500">
                    No orders yet.
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