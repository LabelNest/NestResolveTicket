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


type Tenant = {
  id: string;
  name: string;
  code: string;
  status: string;
  created_at: string;
  users_count: number;
};


const AdminTenants = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);


  const init = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return navigate("/");

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

  const loadTenants = async () => {
    setLoading(true);

  
    const { data: tenantsData, error: tenantError } = await supabase
      .from("lni_tenants")
      .select("id, name, code, status, created_at");

    if (tenantError) {
      console.error(tenantError);
      toast.error("Failed to load tenants");
      setLoading(false);
      return;
    }


    const { data: usersData, error: userError } = await supabase
      .from("nr_users")
      .select("tenant_id");

    if (userError) {
      console.error(userError);
      toast.error("Failed to load tenant users");
      setLoading(false);
      return;
    }

    
    const userCountMap: Record<string, number> = {};
    usersData?.forEach((u) => {
      if (!u.tenant_id) return;
      userCountMap[u.tenant_id] =
        (userCountMap[u.tenant_id] || 0) + 1;
    });

    
    const mapped: Tenant[] =
      tenantsData?.map((t) => ({
        ...t,
        users_count: userCountMap[t.id] || 0,
      })) || [];

    setTenants(mapped);
    setLoading(false);
  };

  
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.status === "active").length;
  const guestUsers =
    tenants.find(t => t.code === "GUEST")?.users_count ?? 0;
  const internalUsers =
    tenants.find(t => t.code === "LNI")?.users_count ?? 0;

 
  return (
    <div className="p-10 space-y-8">
      <h1 className="text-2xl font-semibold">Tenants Overview</h1>

      <div className="grid grid-cols-4 gap-4">
        <Stat label="Total Tenants" value={totalTenants} />
        <Stat label="Active Tenants" value={activeTenants} />
        <Stat label="Internal Users" value={internalUsers} />
        <Stat label="Guest Users" value={guestUsers} />
      </div>

      <div className="border rounded p-4">
        <p className="mb-2 font-medium">Users per Tenant</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={tenants}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="users_count" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="p-3 text-left">Tenant</th>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Users</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
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


const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="border rounded p-4">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-2xl font-semibold">{value}</p>
  </div>
);

export default AdminTenants;
