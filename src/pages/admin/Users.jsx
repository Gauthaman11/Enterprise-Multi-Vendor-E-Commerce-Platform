import { useEffect, useState } from "react";
import {
  getUsers,
  enableUser,
  disableUser,
} from "../../api/adminApi";
import AdminSidebar from "../../components/admin/AdminSidebar";

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleEnable(id) {
    try {
      await enableUser(id);
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDisable(id) {
    try {
      await disableUser(id);
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  }

  const roleMeta = {
    ADMIN: {
      badge: "bg-violet-50 text-violet-700 ring-violet-600/15",
      dot: "bg-violet-500",
      avatar: "bg-violet-100 text-violet-800",
    },
    VENDOR: {
      badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
      dot: "bg-emerald-500",
      avatar: "bg-emerald-100 text-emerald-800",
    },
    CUSTOMER: {
      badge: "bg-sky-50 text-sky-700 ring-sky-600/15",
      dot: "bg-sky-500",
      avatar: "bg-sky-100 text-sky-800",
    },
  };

  const enabledCount = users.filter((u) => u.enabled).length;

  return (
    <div className="min-h-screen bg-[#f7f5f1] font-['Manrope',sans-serif]">
      <style>{`
        @keyframes us-fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .us-fade-up { animation: us-fade-up .5s cubic-bezier(.22, 1, .36, 1) both; }
      `}</style>

      <AdminSidebar />

      <main className="ml-64 min-h-screen p-6 sm:p-8 lg:p-10">
        {/* ===== HEADER ===== */}
        <div className="us-fade-up mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700">
              Platform
            </p>
            <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              User Management
            </h1>
            <p className="mt-1.5 text-[14px] text-stone-500">
              Control access across customers, vendors, and admins.
            </p>
          </div>

          {users.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-stone-200/80 bg-white px-4 py-2.5 shadow-sm">
              <span className="text-[12px] font-semibold text-stone-500">
                {enabledCount} / {users.length} active
              </span>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            </div>
          )}
        </div>

        {/* ===== USERS TABLE ===== */}
        <div
          className="us-fade-up overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]"
          style={{ animationDelay: "100ms" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-[14px] text-left">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="w-[180px] px-5 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {users.map((user) => {
                  const role = roleMeta[user.role] || {
                    badge: "bg-stone-100 text-stone-700 ring-stone-600/10",
                    dot: "bg-stone-500",
                    avatar: "bg-stone-100 text-stone-700",
                  };

                  return (
                    <tr key={user.id} className="transition hover:bg-stone-50/40">
                      {/* Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[13px] font-bold ${role.avatar}`}
                          >
                            {(user.name || "?").charAt(0).toUpperCase()}
                          </span>
                          <span className="font-['Fraunces',serif] text-[15px] font-semibold text-stone-900">
                            {user.name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4 text-stone-600">
                        {user.email}
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-4 text-stone-600 tabular-nums">
                        {user.phone || "-"}
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ring-1 ${role.badge}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${role.dot}`} />
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {user.enabled ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-700 ring-1 ring-emerald-600/15">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Enabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-rose-700 ring-1 ring-rose-600/15">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Disabled
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          {user.enabled ? (
                            <button
                              onClick={() => handleDisable(user.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-rose-700 transition-all hover:bg-rose-50 active:scale-[0.98]"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                              Disable
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEnable(user.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm shadow-emerald-800/20 transition-all hover:bg-emerald-800 active:scale-[0.98]"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              Enable
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {users.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-5 py-16 text-center">
                      <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-stone-100 text-stone-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                      </span>
                      <p className="font-['Fraunces',serif] text-[15px] font-semibold text-stone-900">
                        No users found.
                      </p>
                      <p className="mt-0.5 text-[12px] text-stone-500">
                        Registered users will appear here.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}