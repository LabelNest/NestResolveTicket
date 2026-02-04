import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ================= TYPES ================= */
type Tenant = {
  id: string;
  name: string;
  code: string;
  status: string;
  created_at: string;
  users_count: number;
};

/* ================= COMPONENT ================= */
const AdminTenants = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= INIT ================= */
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    /* AUTH CHECK */
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      navigate("/");
      return;
    }

    /* ADMIN CHECK */
    const { data: admin } = await supabase
      .from("nr_admins")
      .select("nr_email")
      .eq("nr_email", data.session.user.email)
      .maybeSingle();

    if (!admin) {
      toast.error("Access denied");
      navigate("/");
      return;
    }

    loadTenants();
  };

  /* ================= LOAD TENANTS ================= */
  const loadTenants = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("tenants")
      .select(
        `
        id,
        name,
        code,
        status,
        created_at,
        nr_users ( count )
      `
      );

    if (error) {
      console.error(error);
      toast.error("Failed to load tenants");
      setLoading(false);
      return;
    }

    const mapped: Tenant[] =
      data?.map((t: any) => ({
        id: t.id,
        name: t.name,
        code: t.code,
        status: t.status,
        created_at: t.created_at,
        users_count: t.nr_users?.[0]?.count ?? 0,
      })) || [];

    setTenants(mapped);
    setLoading(false);
  };

  /* ================= STATS ================= */
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.status === "active").length;
  const guestUsers =
    tenants.find(t => t.code === "GUEST")?.users_count ?? 0;
  const internalUsers =
    tenants.find(t => t.code === "LNI")?.users_count ?? 0;

  /* ================= UI ================= */
  return (
    <div className="p-10 space-y-8">
      <h1 className="text-2xl font-semibold">Tenants Overview</h1>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-4 gap-4">
        <Stat label="Total Tenants" value={totalTenants} />
        <Stat label="Active Tenants" value={activeTenants} />
        <Stat label="Internal Users" value={internalUsers} />
        <Stat label="Guest Users" value={guestUsers} />
      </div>

      {/* ================= CHART ================= */}
      <div className="border rounded p-4">
        <p className="mb-2 font-medium">Users per Tenant</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={tenants}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="users_count" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ================= TABLE ================= */}
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left p-3">Tenant</th>
              <th className="text-left p-3">Code</th>
              <th className="text-left p-3">Users</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map(t => (
              <tr key={t.id} className="border-t">
                <td className="p-3 font-medium">{t.name}</td>
                <td className="p-3">{t.code}</td>
                <td className="p-3">{t.users_count}</td>
                <td className="p-3 capitalize">{t.status}</td>
                <td className="p-3">
                  {new Date(t.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}

            {!loading && tenants.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No tenants found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ================= STAT CARD ================= */
const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="border rounded p-4">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-2xl font-semibold">{value}</p>
  </div>
);

export default AdminTenants;
