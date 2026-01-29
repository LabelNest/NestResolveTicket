import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#f59e0b"];


const AdminSignupAnalytics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return navigate("/");

    const { data: rows, error } = await supabase
      .from("nr_signup_requests")
      .select("nr_status");

    if (error) {
      // alert("Failed to load analytics");
      toast.error("Failed to load signup analytics");
      return;
    }

    setStats({
      
      total: rows.length,
      pending: rows.filter(r => r.nr_status === "PENDING").length,
      approved: rows.filter(r => r.nr_status === "APPROVED").length,
      rejected: rows.filter(r => r.nr_status === "REJECTED").length,
      
    });
    toast.success("Signup analytics loaded");
  };

  const chartData = [
    { name: "Pending", value: stats.pending },
    { name: "Approved", value: stats.approved },
    { name: "Rejected", value: stats.rejected },
  ];

  return (
    <div className="p-10 space-y-6">
      <h1 className="text-2xl font-semibold">Signup Analytics</h1>

    
      <div className="grid grid-cols-4 gap-4">
        <Stat label="Total" value={stats.total} />
        <Stat label="Pending" value={stats.pending} />
        <Stat label="Approved" value={stats.approved} />
        <Stat label="Rejected" value={stats.rejected} />
      </div>

      
      <div className="border rounded p-4">
        <p className="mb-2 font-medium">Signup Status Distribution</p>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="border rounded p-4">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-2xl font-semibold">{value}</p>
  </div>
);

export default AdminSignupAnalytics;

