import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import {
  LayoutDashboard,
  BarChart3,
  Ticket,
  ClipboardList,
  LogOut,
} from "lucide-react";

const AdminLayout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-[#0b1220]">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1e3a8a] text-white flex flex-col">
        <div className="px-6 py-6 text-xl font-semibold tracking-wide">
          ADMIN
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <SideItem to="/admin/approvals" icon={<LayoutDashboard size={18} />} label="Signup Approvals" />
          <SideItem to="/admin/signup-analytics" icon={<BarChart3 size={18} />} label="Signup Analytics" />
          <SideItem to="/admin/tickets" icon={<Ticket size={18} />} label="Ticket Analytics" />
          <SideItem to="/admin/audit" icon={<ClipboardList size={18} />} label="System Overview" />
        </nav>

        <div className="p-4 border-t border-white/20">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded
                       hover:bg-red-500/20 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

const SideItem = ({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded
       transition-all duration-200
       ${isActive
         ? "bg-white/20 font-medium"
         : "hover:bg-white/10"}`
    }
  >
    {icon}
    {label}
  </NavLink>
);

export default AdminLayout;
