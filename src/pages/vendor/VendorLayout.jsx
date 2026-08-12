import { Outlet } from "react-router-dom";
import VendorSidebar from "./VendorSidebar";

export default function VendorLayout() {
  return (
    <div className="min-h-screen bg-[#f7f5f1] font-['Manrope',sans-serif]">
      <VendorSidebar />
      <main className="ml-64 min-h-screen p-6 sm:p-8 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
}