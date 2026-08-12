import { useEffect, useState } from "react";
import { getMyOrders, cancelOrder } from "../../api/customerApi";

export default function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    try {
      const res = await getMyOrders();
      setOrders(res.data || []);
    } catch (error) {
      console.error("Failed to load orders", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(orderId) {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await cancelOrder(orderId);
      alert("Order cancelled successfully");
      loadOrders();
    } catch (error) {
      alert("Failed to cancel order.");
    }
  }

  const statusStyles = {
    DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    CANCELLED: "bg-rose-50 text-rose-700 ring-rose-600/15",
    PENDING: "bg-amber-50 text-amber-700 ring-amber-600/15",
    CONFIRMED: "bg-sky-50 text-sky-700 ring-sky-600/15",
  };

  if (loading)
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f7f5f1]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent" style={{ animation: "spin 0.9s linear infinite" }} />
          </div>
          <p className="text-[14px] font-medium text-stone-500">Loading orders...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f7f5f1] font-['Manrope',sans-serif]">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Account</p>
          <h1 className="mt-2 font-['Fraunces',serif] text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            My Orders
          </h1>
          <p className="mt-2 text-[15px] text-stone-500">
            Track, review, and reorder everything you've purchased.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-16 text-center">
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-stone-100 text-stone-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 0v11.25m3-11.25v11.25m3-11.25v11.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </span>
            <h2 className="font-['Fraunces',serif] text-2xl font-semibold text-stone-900">No orders yet</h2>
            <p className="mt-1.5 text-[14px] text-stone-500">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <article
                key={order.orderId}
                className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.15)]"
              >
                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 bg-stone-50/70 p-5">
                  <div>
                    <p className="font-['Fraunces',serif] text-lg font-semibold text-stone-900">
                      Order #{order.orderId}
                    </p>
                    <p className="mt-0.5 text-[13px] text-stone-500">
                      Placed on {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] ring-1 ${
                        statusStyles[order.status] || "bg-stone-100 text-stone-700 ring-stone-600/10"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        order.status === 'DELIVERED' ? 'bg-emerald-500' :
                        order.status === 'CANCELLED' ? 'bg-rose-500' :
                        order.status === 'CONFIRMED' ? 'bg-sky-500' : 'bg-amber-500'
                      }`} />
                      {order.status}
                    </span>
                    <span className="font-['Fraunces',serif] text-xl font-semibold tracking-tight text-stone-900 tabular-nums">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>

                {/* Items table */}
                <div className="p-5">
                  <table className="w-full text-[14px]">
                    <thead>
                      <tr className="border-b border-stone-200 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                        <th className="pb-2 text-left">Product</th>
                        <th className="pb-2 text-left">Price</th>
                        <th className="pb-2 text-left">Quantity</th>
                        <th className="pb-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map((item, index) => (
                        <tr key={index} className="border-b border-stone-100 last:border-0">
                          <td className="py-3 text-stone-800">{item.productName}</td>
                          <td className="py-3 text-stone-600 tabular-nums">₹{item.price}</td>
                          <td className="py-3 text-stone-600 tabular-nums">× {item.quantity}</td>
                          <td className="py-3 text-right font-semibold text-stone-900 tabular-nums">₹{item.subtotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                    <div className="mt-5 flex justify-end border-t border-stone-100 pt-4">
                      <button
                        onClick={() => handleCancel(order.orderId)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-4 py-2 text-[13px] font-semibold text-rose-700 transition hover:bg-rose-50"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}