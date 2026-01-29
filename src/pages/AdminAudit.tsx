import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";


type AdminStat = {
  admin_email: string;
  approved: number;
  rejected: number;
  total: number;
};

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#f59e0b"];


const AdminAudit = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [counts, setCounts] = useState({
    authUsers: 0,
    platformUsers: 0,
    admins: 0,
    tickets: 0,
  });

  const [adminStats, setAdminStats] = useState<AdminStat[]>([]);

  useEffect(() => {
    init();
  }, []);

  
  const init = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return navigate("/");

    
    const { data: admin } = await supabase
      .from("nr_admins_list")
      .select("nr_email")
      .eq("nr_email", data.session.user.email)
      .maybeSingle();

    if (!admin) return navigate("/");

    await loadAuditData();
    setLoading(false);
  };

 
  const loadAuditData = async () => {
    const [
      authUsers,
      platformUsers,
      admins,
      tickets,
      adminStats,
    ] = await Promise.all([
      supabase.from("nr_auth_users").select("id"),
      supabase.from("nr_users").select("nr_id"),
      supabase.from("nr_admins_list").select("nr_id"),
      supabase.from("nr_resolve_tickets").select("id"),
      supabase.from("nr_admin_approval_stats").select("*"),
    ]);

    setCounts({
      authUsers: authUsers.data?.length || 0,
      platformUsers: platformUsers.data?.length || 0,
      admins: admins.data?.length || 0,
      tickets: tickets.data?.length || 0,
    });

    setAdminStats(adminStats.data || []);
  };

  if (loading) {
    return (
      <div className="p-10 text-muted-foreground">
        Loading audit overview…
      </div>
    );
  }


  return (
    <div className="p-10 space-y-10">
      <h1 className="text-2xl font-semibold">
        System Overview
      </h1>

      
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Metric label="Auth Users" value={counts.authUsers} />
        <Metric label="Platform Users" value={counts.platformUsers} />
        <Metric label="Admins" value={counts.admins} />
        <Metric label="Total Tickets" value={counts.tickets} />
      </div>

     
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       
        <div className="glass-card p-6 rounded-xl">
          <h2 className="mb-4 font-medium">Approval Actions</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={[
                  {
                    name: "Approved",
                    value: adminStats.reduce(
                      (a, b) => a + b.approved,
                      0
                    ),
                  },
                  {
                    name: "Rejected",
                    value: adminStats.reduce(
                      (a, b) => a + b.rejected,
                      0
                    ),
                  },
                ]}
                dataKey="value"
                outerRadius={90}
              >
                <Cell fill="#16a34a" />
                <Cell fill="#dc2626" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

       
        <div className="glass-card p-6 rounded-xl">
          <h2 className="mb-4 font-medium">Admin Activity</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={adminStats}>
              <XAxis
                dataKey="admin_email"
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="approved" fill="#16a34a" />
              <Bar dataKey="rejected" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="p-4 text-left">Admin</th>
              <th className="p-4">Approved</th>
              <th className="p-4">Rejected</th>
              <th className="p-4">Total Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminStats.map((a) => (
              <tr
                key={a.admin_email}
                className="border-t border-white/10"
              >
                <td className="p-4">{a.admin_email}</td>
                <td className="p-4 text-green-400 text-center">
                  {a.approved}
                </td>
                <td className="p-4 text-red-400 text-center">
                  {a.rejected}
                </td>
                <td className="p-4 text-center">{a.total}</td>
              </tr>
            ))}

            {adminStats.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="p-6 text-center text-muted-foreground"
                >
                  No admin actions recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


const Metric = ({ label, value }: any) => (
  <div className="glass-card p-6 rounded-xl">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

export default AdminAudit;

