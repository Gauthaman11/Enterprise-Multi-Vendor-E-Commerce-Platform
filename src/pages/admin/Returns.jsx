import { useEffect, useState } from "react";
import { getAllReturns, updateReturnStatus, processRefund } from "../../api/returnApi";

export default function Returns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await getAllReturns();
      setReturns(res.data || []);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  }

  async function handleAction(id, action) {
    try {
      if (action === "approve") {
        await updateReturnStatus(id, "APPROVED");
      } else if (action === "reject") {
        await updateReturnStatus(id, "REJECTED");
      } else if (action === "receive") {
        const restock = window.confirm("Is the returned item in good condition to be restocked?");
        await updateReturnStatus(id, "RECEIVED", restock);
      } else if (action === "refund") {
        if (window.confirm("Process the refund to the customer?")) {
          await processRefund(id);
        }
      }
      load();
    } catch (e) { 
      alert(e.response?.data?.message || "Action failed"); 
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "REQUESTED": return "bg-amber-50 text-amber-700 ring-amber-600/15";
      case "APPROVED": return "bg-sky-50 text-sky-700 ring-sky-600/15";
      case "RECEIVED": return "bg-purple-50 text-purple-700 ring-purple-600/15";
      case "REFUNDED": return "bg-emerald-50 text-emerald-700 ring-emerald-600/15";
      case "REJECTED": return "bg-rose-50 text-rose-700 ring-rose-600/15";
      default: return "bg-stone-100 text-stone-700";
    }
  };

  if (loading) return <div className="p-10 text-center text-stone-500">Loading returns...</div>;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-700">Support</p>
        <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900">Return Requests</h1>
        <p className="mt-1.5 text-[14px] text-stone-500">Manage customer returns, inspect items, and process refunds.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]">
        <table className="w-full text-[14px] text-left">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
              <th className="px-5 py-3">Return ID</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Order ID</th>
              <th className="px-5 py-3">Reason</th>
              <th className="px-5 py-3">Refund</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {returns.map((r) => (
              <tr key={r.id} className="hover:bg-stone-50/40">
                <td className="px-5 py-4 font-semibold text-stone-900">#{r.id}</td>
                <td className="px-5 py-4 text-stone-600 font-medium">{r.customerName || "Unknown"}</td>
                <td className="px-5 py-4 text-stone-600">{r.productName || "Unknown Product"}</td>
                <td className="px-5 py-4 text-stone-600">#{r.orderId}</td>
                <td className="px-5 py-4 text-stone-600 max-w-xs truncate" title={r.reason}>{r.reason}</td>
                <td className="px-5 py-4 font-semibold text-stone-900">₹{r.refundAmount}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ring-1 ${getStatusColor(r.status)}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {r.status === "REQUESTED" && (
                      <>
                        <button onClick={() => handleAction(r.id, "approve")} className="rounded-lg bg-sky-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-sky-700">Approve</button>
                        <button onClick={() => handleAction(r.id, "reject")} className="rounded-lg bg-rose-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-rose-700">Reject</button>
                      </>
                    )}
                    {r.status === "APPROVED" && (
                      <button onClick={() => handleAction(r.id, "receive")} className="rounded-lg bg-purple-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-purple-700">Mark Received</button>
                    )}
                    {r.status === "RECEIVED" && (
                      <button onClick={() => handleAction(r.id, "refund")} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-emerald-700">Process Refund</button>
                    )}
                    {r.status === "REFUNDED" && <span className="text-[12px] font-semibold text-emerald-700">✅ Completed</span>}
                    {r.status === "REJECTED" && <span className="text-[12px] font-semibold text-rose-700">❌ Rejected</span>}
                  </div>
                </td>
              </tr>
            ))}
            {returns.length === 0 && (
              <tr>
                <td colSpan="8" className="px-5 py-16 text-center text-stone-500">No return requests yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}