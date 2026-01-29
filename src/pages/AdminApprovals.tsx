import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


type SignupRequest = {
  nr_id: string;
  nr_name: string;
  nr_email: string;
  nr_role: string;
  nr_status: string;
};


const APPROVE_FUNCTION_URL =
  "https://evugaodpzepyjonlrptn.supabase.co/functions/v1/approve-user";

const COLORS = ["#2563eb", "#16a34a", "#dc2626"];


const AdminApprovals = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<SignupRequest[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user",
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
      // alert("Access denied");
      toast.error("Access denied");
      navigate("/");
      return;
    }

    loadRequests();
  };

  
  const loadRequests = async () => {
    const { data } = await supabase
      .from("nr_signup_requests")
      .select("*")
      .order("nr_created_at", { ascending: false });

    setRequests(data || []);
  };

 
  const approve = async (req: SignupRequest) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;

    const res = await fetch(APPROVE_FUNCTION_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: req.nr_email,
        signupRequestId: req.nr_id,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      // alert(result.error || "Approval failed");
      toast.error(result.error || "Approval failed");
      return;
    }

    // alert("Approved & email sent");
    toast.success("Approved & email sent");
    loadRequests();
  };

  
  const reject = async (id: string) => {
    await supabase
      .from("nr_signup_requests")
      .update({ nr_status: "REJECTED" })
      .eq("nr_id", id);

    loadRequests();
  };

  
  const createUser = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;

    
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

    if (error) {
      // alert("Failed to create signup request");
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
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      // alert(result.error || "User approval failed");
      toast.error(result.error || "User approval failed");
      return;
    }

    // alert("User created & approved");
    toast.success("User created & approved");
    setShowAdd(false);
    setNewUser({ name: "", email: "", role: "user" });
    loadRequests();
  };

  
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.nr_status === "PENDING").length,
    approved: requests.filter(r => r.nr_status === "APPROVED").length,
    rejected: requests.filter(r => r.nr_status === "REJECTED").length,
  };

  const chartData = [
    { name: "Pending", value: stats.pending },
    { name: "Approved", value: stats.approved },
    { name: "Rejected", value: stats.rejected },
  ];

  const pendingRequests = requests.filter(
    r => r.nr_status === "PENDING"
  );

  
  return (
    <div className="p-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          Signup Approvals
        </h1>
        <Button onClick={() => setShowAdd(true)}>
          Add New User
        </Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4">
        <Stat label="Total" value={stats.total} />
        <Stat label="Pending" value={stats.pending} />
        <Stat label="Approved" value={stats.approved} />
        <Stat label="Rejected" value={stats.rejected} />
      </div>

      
      {/* <div className="border rounded p-4">
        <p className="mb-2 font-medium">Signup Status</p>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={chartData} dataKey="value" outerRadius={90}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div> */}

      
      {pendingRequests.map(r => (
        <div
          key={r.nr_id}
          className="border rounded p-4 flex justify-between"
        >
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
              onChange={e =>
                setNewUser({ ...newUser, email: e.target.value })
              }
            />

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
              <Button variant="outline" onClick={() => setShowAdd(false)}
                className="bg-gray-200 text-black hover:bg-gray-300">
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


