import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";


type SignupRequest = {
  nr_id: string;
  nr_name: string;
  nr_email: string;
  nr_role: string;
  nr_status: string;
};

type Tenant = {
  id: string;
  name: string;
  code: string;
};


const APPROVE_FUNCTION_URL =
  "https://evugaodpzepyjonlrptn.supabase.co/functions/v1/approve-user";


const AdminApprovals = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<SignupRequest[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user",
    tenant_id: "",
  });


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

    loadRequests();
    loadTenants();
  };


  const loadRequests = async () => {
    const { data } = await supabase
      .from("nr_signup_requests")
      .select("*")
      .order("nr_created_at", { ascending: false });

    setRequests(data || []);
  };

  const loadTenants = async () => {
    const { data, error } = await supabase
      .from("lni_tenants")
      .select("id, name, code")
      .eq("status", "active");

    if (error) {
      toast.error("Failed to load tenants");
      return;
    }

    setTenants(data || []);
  };

 
  const handleEmailChange = (email: string) => {
    const isInternal = email.endsWith("@labelnest.in");
    const tenant = tenants.find(t =>
      isInternal ? t.code === "LNI" : t.code === "GUEST"
    );

    setNewUser(prev => ({
      ...prev,
      email,
      tenant_id: tenant?.id || "",
    }));
  };


  const approve = async (req: SignupRequest) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;

    const adminEmail = data.session.user.email;

    const isInternal = req.nr_email.endsWith("@labelnest.in");
    const tenant = tenants.find(t =>
      isInternal ? t.code === "LNI" : t.code === "GUEST"
    );

    const res = await fetch(APPROVE_FUNCTION_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: req.nr_email,
        signupRequestId: req.nr_id,
        tenant_id: tenant?.id,
        processed_by_email: adminEmail,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      toast.error(result.error || "Approval failed");
      return;
    }


    const { error } = await supabase
      .from("nr_signup_requests")
      .update({
        nr_status: "APPROVED",
        processed_by_email: adminEmail,
      })
      .eq("nr_id", req.nr_id);

    if (error) {
      toast.error("Status update failed");
      return;
    }

    toast.success("Approved & email sent");
    loadRequests();
  };


  const reject = async (id: string) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;

    const adminEmail = data.session.user.email;

    const { error } = await supabase
      .from("nr_signup_requests")
      .update({
        nr_status: "REJECTED",
        processed_by_email: adminEmail,
      })
      .eq("nr_id", id);

    if (error) {
      toast.error("Failed to reject request");
      return;
    }

    toast.info("Request rejected");
    loadRequests();
  };


  const createUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.tenant_id) {
      toast.warning("Please fill all fields");
      return;
    }

    const { data } = await supabase.auth.getSession();
    if (!data.session) return;

    const { data: existing } = await supabase
      .from("nr_signup_requests")
      .select("nr_id")
      .eq("nr_email", newUser.email)
      .maybeSingle();

    if (existing) {
      toast.warning("User with this email already exists");
      return;
    }

    const { data: request, error } = await supabase
      .from("nr_signup_requests")
      .insert({
        nr_name: newUser.name,
        nr_email: newUser.email,
        nr_role: newUser.role,
        nr_status: "PENDING",
      })
      .select()
      .single();

    if (error || !request) {
      toast.error("Failed to create signup request");
      return;
    }

    const res = await fetch(APPROVE_FUNCTION_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: request.nr_email,
        signupRequestId: request.nr_id,
        tenant_id: newUser.tenant_id,
        processed_by_email: data.session.user.email,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      toast.error(result.error || "User approval failed");
      return;
    }


    await supabase
      .from("nr_signup_requests")
      .update({
        nr_status: "APPROVED",
        processed_by_email: data.session.user.email,
      })
      .eq("nr_id", request.nr_id);

    toast.success("User created & approved");
    setShowAdd(false);
    setNewUser({ name: "", email: "", role: "user", tenant_id: "" });
    loadRequests();
  };


  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.nr_status === "PENDING").length,
    approved: requests.filter(r => r.nr_status === "APPROVED").length,
    rejected: requests.filter(r => r.nr_status === "REJECTED").length,
  };

  const pendingRequests = requests.filter(r => r.nr_status === "PENDING");


  return (
    <div className="p-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Signup Approvals</h1>
        <Button onClick={() => setShowAdd(true)}>Add New User</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Stat label="Total" value={stats.total} />
        <Stat label="Pending" value={stats.pending} />
        <Stat label="Approved" value={stats.approved} />
        <Stat label="Rejected" value={stats.rejected} />
      </div>

      {pendingRequests.map(r => (
        <div key={r.nr_id} className="border rounded p-4 flex justify-between">
          <div>
            <p className="font-medium">{r.nr_name}</p>
            <p className="text-sm">{r.nr_email}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => approve(r)}>Approve</Button>
            <Button variant="destructive" onClick={() => reject(r.nr_id)}>
              Reject
            </Button>
          </div>
        </div>
      ))}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white text-black p-6 w-96 space-y-3 rounded">
            <h2 className="text-lg font-semibold">Add New User</h2>

            <input
              className="border p-2 w-full"
              placeholder="Name"
              value={newUser.name}
              onChange={e =>
                setNewUser({ ...newUser, name: e.target.value })
              }
            />

            <input
              className="border p-2 w-full"
              placeholder="Email"
              value={newUser.email}
              onChange={e => handleEmailChange(e.target.value)}
            />

            <select
              className="border p-2 w-full"
              value={newUser.tenant_id}
              onChange={e =>
                setNewUser({ ...newUser, tenant_id: e.target.value })
              }
            >
              <option value="">Select Tenant</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <select
              className="border p-2 w-full"
              value={newUser.role}
              onChange={e =>
                setNewUser({ ...newUser, role: e.target.value })
              }
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowAdd(false)}
                className="bg-gray-200 text-black hover:bg-gray-300"
              >
                Cancel
              </Button>
              <Button onClick={createUser}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="border rounded p-4">
    <p className="text-sm">{label}</p>
    <p className="text-xl font-semibold">{value}</p>
  </div>
);

export default AdminApprovals;
