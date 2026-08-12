import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      {/* ml-64 pushes content to the right of the fixed sidebar */}
      <main className="ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}