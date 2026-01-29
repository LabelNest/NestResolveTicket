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
      
      <aside className="w-64 bg-[#1e3a8a] text-white flex flex-col">

        
        <div className="px-6 py-6 border-b border-white/10">
          <p className="text-xs tracking-widest text-white/60 mb-2">
            <b>ADMIN PANEL</b>
          </p>

          
          <div className="flex items-center gap-3">
            <img
              src="/labelnest-logo.jpg"
              alt="LabelNest"
              className="w-10 h-10 rounded-lg bg-white p-1"
            />
            <div>
              <p className="text-lg font-semibold leading-tight">
                NestResolve
              </p>
              <p className="text-xs text-white/60">
                By <b>LabelNest</b>
              </p>
            </div>
          </div>
        </div>

       
        <nav className="flex-1 px-3 py-4 space-y-1">
          <SideItem
            to="/admin/approvals"
            icon={<LayoutDashboard size={18} />}
            label="Signup Approvals"
          />
          <SideItem
            to="/admin/signup-analytics"
            icon={<BarChart3 size={18} />}
            label="Signup Analytics"
          />
          <SideItem
            to="/admin/tickets"
            icon={<Ticket size={18} />}
            label="Ticket Analytics"
          />
          <SideItem
            to="/admin/audit"
            icon={<ClipboardList size={18} />}
            label="System Overview"
          />
        </nav>

       
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="
              group w-full flex items-center justify-between
              px-4 py-2 rounded-lg
              text-white/80
              hover:text-white
              bg-gradient-to-r from-transparent to-transparent
              hover:from-white/15 hover:to-white/5
              transition-all duration-300 ease-out
            "
          >
            <div className="flex items-center gap-2">
              <LogOut
                size={18}
                className="
                  transition-transform duration-300
                  group-hover:-translate-x-1
                  group-hover:scale-110
                "
              />
              <span className="font-medium tracking-wide">
                Logout
              </span>
            </div>

            <span
              className="
                text-xs opacity-0
                group-hover:opacity-100
                transition-opacity duration-300
              "
            >
              secure exit
            </span>
          </button>
        </div>
      </aside>

     
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
      `
      flex items-center gap-3 px-3 py-2 rounded-lg
      transition-all duration-200
      ${
        isActive
          ? "bg-white/20 font-medium shadow-inner"
          : "hover:bg-white/10 hover:translate-x-1"
      }
      `
    }
  >
    {icon}
    {label}
  </NavLink>
);

export default AdminLayout;
