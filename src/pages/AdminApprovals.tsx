// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabase";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";

// type SignupRequest = {
//   nr_id: string;
//   nr_name: string;
//   nr_email: string;
//   nr_status: string;
// };

// const AdminApprovals = () => {
//   const [requests, setRequests] = useState<SignupRequest[]>([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     init();
//   }, []);

//   const init = async () => {
//     const {
//       data: { session },
//     } = await supabase.auth.getSession();

//     // 🔐 Must be logged in
//     if (!session) {
//       navigate("/");
//       return;
//     }

//     // 🔐 Admin check (CORRECT WAY)
//     const role = session.user.user_metadata?.role;

//     if (role !== "admin") {
//       alert("Access denied");
//       navigate("/");
//       return;
//     }

//     await loadRequests();
//     setLoading(false);
//   };

//   const loadRequests = async () => {
//     const { data, error } = await supabase
//       .from("nr_signup_requests")
//       .select("nr_id, nr_name, nr_email, nr_status")
//       .eq("nr_status", "PENDING");

//     if (!error && data) {
//       setRequests(data);
//     }
//   };

//   const approveUser = async (req: SignupRequest) => {
//     // 1️⃣ Update DB
//     const { error } = await supabase
//       .from("nr_signup_requests")
//       .update({ nr_status: "APPROVED" })
//       .eq("nr_id", req.nr_id);

//     if (error) {
//       alert(error.message);
//       return;
//     }

//     // 2️⃣ Send approval email
//     await fetch("/functions/v1/send-approval-email", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         email: req.nr_email,
//         name: req.nr_name,
//       }),
//     });

//     // 3️⃣ Update UI
//     setRequests((prev) => prev.filter((r) => r.nr_id !== req.nr_id));
//   };

//   if (loading) {
//     return <div className="p-10">Loading...</div>;
//   }

//   return (
//     <div className="min-h-screen p-10">
//       <h1 className="text-2xl font-semibold mb-6">
//         Admin – Signup Approvals
//       </h1>

//       {requests.length === 0 ? (
//         <p className="text-muted-foreground">
//           No pending signup requests.
//         </p>
//       ) : (
//         <div className="space-y-4">
//           {requests.map((req) => (
//             <div
//               key={req.nr_id}
//               className="border rounded-lg p-4 flex justify-between items-center"
//             >
//               <div>
//                 <p className="font-medium">{req.nr_name}</p>
//                 <p className="text-sm text-muted-foreground">
//                   {req.nr_email}
//                 </p>
//               </div>

//               <Button
//                 className="btn-gradient"
//                 onClick={() => approveUser(req)}
//               >
//                 Approve
//               </Button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminApprovals;
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "@/lib/supabaseClient";
// import { Button } from "@/components/ui/button";

// type SignupRequest = {
//   nr_id: string;
//   nr_name: string;
//   nr_email: string;
//   nr_role: string;
//   nr_created_at: string;
// };

// const SUPABASE_FUNCTION_URL =
//   "https://evugaodpzepyjonlrptn.supabase.co/functions/v1";

// const AdminApprovals = () => {
//   const [requests, setRequests] = useState<SignupRequest[]>([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     init();
//   }, []);

//   // 🔐 Admin validation
//   const init = async () => {
//     const {
//       data: { session },
//     } = await supabase.auth.getSession();

//     if (!session?.user?.email) {
//       navigate("/");
//       return;
//     }

//     // ✅ Admin check via table (safe, no auth hacks)
//     const { data: admin, error } = await supabase
//       .from("nr_admins")
//       .select("nr_email")
//       .eq("nr_email", session.user.email)
//       .single();

//     if (error || !admin) {
//       alert("Access denied");
//       navigate("/");
//       return;
//     }

//     await loadRequests();
//     setLoading(false);
//   };

//   // 📥 Load pending users
//   const loadRequests = async () => {
//     const { data, error } = await supabase
//       .from("nr_signup_requests")
//       .select("nr_id, nr_name, nr_email, nr_role, nr_created_at")
//       .eq("nr_status", "PENDING")
//       .order("nr_created_at", { ascending: false });

//     if (!error && data) {
//       setRequests(data);
//     }
//   };

//   // ✅ APPROVE USER
//   const approveRequest = async (req: SignupRequest) => {
//     try {
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();

//       if (!session) {
//         alert("Session expired");
//         return;
//       }

//       const res = await fetch(`${SUPABASE_FUNCTION_URL}/approve-user`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${session.access_token}`,
//         },
//         body: JSON.stringify({
//           email: req.nr_email,
//           signupRequestId: req.nr_id,
//         }),
//       });

//       const result = await res.json();

//       if (!res.ok) {
//         console.error("Approve error:", result);
//         alert(result.error || "Approval failed");
//         return;
//       }

//       // 🧾 Audit log
//       await supabase.from("nr_signup_audit").insert({
//         signup_request_id: req.nr_id,
//         action: "APPROVED",
//         acted_by: session.user.email,
//       });

//       setRequests((prev) => prev.filter((r) => r.nr_id !== req.nr_id));
//       alert("User approved. Password setup email sent.");
//     } catch (err) {
//       console.error("Approval failed:", err);
//       alert("Something went wrong during approval");
//     }
//   };

//   // ❌ REJECT USER
//   const rejectRequest = async (req: SignupRequest) => {
//     try {
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();

//       if (!session) return;

//       await supabase
//         .from("nr_signup_requests")
//         .update({ nr_status: "REJECTED" })
//         .eq("nr_id", req.nr_id);

//       await supabase.from("nr_signup_audit").insert({
//         signup_request_id: req.nr_id,
//         action: "REJECTED",
//         acted_by: session.user.email,
//       });

//       setRequests((prev) => prev.filter((r) => r.nr_id !== req.nr_id));
//       alert("User rejected");
//     } catch (err) {
//       console.error("Reject failed:", err);
//       alert("Rejection failed");
//     }
//   };

//   if (loading) return <div className="p-10">Loading...</div>;

//   return (
//     <div className="min-h-screen p-10">
//       <h1 className="text-2xl font-semibold mb-6">
//         Admin – Signup Approvals
//       </h1>

//       {requests.length === 0 ? (
//         <p className="text-muted-foreground">
//           No pending signup requests.
//         </p>
//       ) : (
//         <div className="space-y-4">
//           {requests.map((req) => (
//             <div
//               key={req.nr_id}
//               className="border rounded-lg p-4 flex justify-between items-center"
//             >
//               <div>
//                 <p className="font-medium">{req.nr_name}</p>
//                 <p className="text-sm text-muted-foreground">
//                   {req.nr_email}
//                 </p>
//                 <p className="text-xs text-muted-foreground">
//                   Role: {req.nr_role}
//                 </p>
//               </div>

//               <div className="flex gap-3">
//                 <Button
//                   className="btn-gradient"
//                   onClick={() => approveRequest(req)}
//                 >
//                   Approve
//                 </Button>
//                 <Button
//                   variant="destructive"
//                   onClick={() => rejectRequest(req)}
//                 >
//                   Reject
//                 </Button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminApprovals;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

type SignupRequest = {
  nr_id: string;
  nr_name: string;
  nr_email: string;
  nr_role: string;
};

const FUNCTION_URL =
  "https://evugaodpzepyjonlrptn.supabase.co/functions/v1/approve-user";

const AdminApprovals = () => {
  const [requests, setRequests] = useState<SignupRequest[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      navigate("/");
      return;
    }

    const { data: admin } = await supabase
      .from("nr_admins")
      .select("nr_email")
      .eq("nr_email", session.session.user.email)
      .maybeSingle();

    if (!admin) {
      alert("Access denied");
      navigate("/");
      return;
    }

    loadRequests();
  };

  const loadRequests = async () => {
    const { data } = await supabase
      .from("nr_signup_requests")
      .select("nr_id, nr_name, nr_email, nr_role")
      .eq("nr_status", "PENDING");

    setRequests(data || []);
  };

  const approve = async (req: SignupRequest) => {
    const { data } = await supabase.auth.getSession();

    const res = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session?.access_token}`,
      },
      body: JSON.stringify({
        email: req.nr_email,
        signupRequestId: req.nr_id,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      alert(result.error);
      return;
    }

    alert("Approved & email sent");
    loadRequests();
  };

  const reject = async (id: string) => {
    await supabase
      .from("nr_signup_requests")
      .update({ nr_status: "REJECTED" })
      .eq("nr_id", id);

    loadRequests();
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-6">Admin – Signup Approvals</h1>

      {requests.map((r) => (
        <div key={r.nr_id} className="border p-4 mb-3 flex justify-between">
          <div>
            <p>{r.nr_name}</p>
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
    </div>
  );
};

export default AdminApprovals;
