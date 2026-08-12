import { useEffect, useState } from "react";
import { getVendorOrders } from "../../api/vendorApi";

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await getVendorOrders();
      setOrders(res.data || []);
    } catch (e) {
      console.error("Failed to load vendor orders:", e);
    } finally {
      setLoading(false);
    }
  }

  const statuses = ["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  const filtered =
    filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  const revenue = orders.reduce(
    (sum, o) => sum + Number(o.subtotal || 0),
    0
  );

  if (loading)
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent" style={{ animation: "vo-spin 0.9s linear infinite" }} />
          </div>
          <p className="text-[14px] font-medium text-stone-500">Loading orders...</p>
        </div>
      </div>
    );

  return (
    <div className="space-y-8">
      <style>{`
        @keyframes vo-spin { to { transform: rotate(360deg); } }
        @keyframes vo-fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .vo-fade-up { animation: vo-fade-up .5s cubic-bezier(.22, 1, .36, 1) both; }
      `}</style>

      {/* ===== HEADER ===== */}
      <div className="vo-fade-up flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            Operations
          </p>
          <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            Incoming Orders
          </h1>
          <p className="mt-1.5 text-[14px] text-stone-500">
            Track every order that includes your products.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white px-5 py-3 shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]">
          <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-emerald-200/40 blur-xl" />
          <p className="relative text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">
            Total Sales
          </p>
          <p className="relative mt-0.5 font-['Fraunces',serif] text-2xl font-semibold tracking-tight text-emerald-700 tabular-nums">
            ₹{revenue.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* ===== STATUS FILTER ===== */}
      <div className="vo-fade-up flex flex-wrap gap-2" style={{ animationDelay: "60ms" }}>
        {statuses.map((s) => {
          const count =
            s === "ALL" ? orders.length : orders.filter((o) => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all duration-200 ${
                filter === s
                  ? "bg-emerald-800 text-white shadow-md shadow-emerald-800/25"
                  : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300 hover:text-stone-900"
              }`}
            >
              {s}
              <span
                className={`grid h-5 min-w-[20px] place-items-center rounded-full px-1.5 text-[10px] font-bold ${
                  filter === s
                    ? "bg-white/20 text-white"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ===== ORDERS TABLE ===== */}
      <div
        className="vo-fade-up overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]"
        style={{ animationDelay: "120ms" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[14px] text-left">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Qty</th>
                <th className="px-5 py-3">Your Earning</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((o, i) => (
                <tr
                  key={`${o.orderId}-${i}`}
                  className="transition hover:bg-stone-50/40"
                >
                  <td className="px-5 py-4 font-['Fraunces',serif] text-[15px] font-semibold text-stone-900">
                    #{o.orderId}
                  </td>
                  <td className="px-5 py-4 text-stone-600">
                    {o.orderDate
                      ? new Date(o.orderDate).toLocaleDateString("en-IN")
                      : "-"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800">
                        {(o.customerName || "?").charAt(0).toUpperCase()}
                      </span>
                      <span className="text-stone-800">{o.customerName || "-"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-stone-700">{o.productName}</td>
                  <td className="px-5 py-4 text-stone-600 tabular-nums">{o.quantity}</td>
                  <td className="px-5 py-4 font-semibold text-emerald-700 tabular-nums">
                    ₹{o.subtotal}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-stone-100 text-stone-400">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                    </span>
                    <p className="font-['Fraunces',serif] text-[15px] font-semibold text-stone-900">
                      No orders found.
                    </p>
                    <p className="mt-0.5 text-[12px] text-stone-500">
                      {filter !== "ALL"
                        ? `No orders with status "${filter}".`
                        : "Orders will appear here as they come in."}
                    </p>
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

function StatusBadge({ status }) {
  const colors = {
    PENDING: "bg-amber-50 text-amber-700 ring-amber-600/15",
    CONFIRMED: "bg-sky-50 text-sky-700 ring-sky-600/15",
    PROCESSING: "bg-sky-50 text-sky-700 ring-sky-600/15",
    SHIPPED: "bg-violet-50 text-violet-700 ring-violet-600/15",
    DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    CANCELLED: "bg-rose-50 text-rose-700 ring-rose-600/15",
  };
  const dotColor = {
    PENDING: "bg-amber-500",
    CONFIRMED: "bg-sky-500",
    PROCESSING: "bg-sky-500",
    SHIPPED: "bg-violet-500",
    DELIVERED: "bg-emerald-500",
    CANCELLED: "bg-rose-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ring-1 ${
        colors[status] || "bg-stone-50 text-stone-700 ring-stone-600/10"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor[status] || "bg-stone-500"}`} />
      {status}
    </span>
  );
}