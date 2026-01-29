// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "@/lib/supabaseClient";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";

// const categories = [
//   "Feature Request",
//   "Data Request",
//   "Data Feedback",
//   "Product Demo",
//   "Platform Access",
//   "Others",
// ];

// // TEMP tenant id (replace later)
// const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000000";

// const RaiseTicket = () => {
//   const navigate = useNavigate();

//   const [category, setCategory] = useState("");
//   const [description, setDescription] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();

//       const { error } = await supabase
//         .from("nr_resolve_tickets")
//         .insert({
//           tenant_id: DEFAULT_TENANT_ID,
//           issue_origin: "external",
//           title: category,
//           description,
//           type: category,
//           created_by: user?.id ?? null,
//         });

//       if (error) throw error;

//       alert("Ticket raised successfully. Priority set to CRITICAL.");

//       setCategory("");
//       setDescription("");
//     } catch (err: any) {
//       alert(err.message || "Failed to raise ticket");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-6 relative">
//       {/* 🔙 Back Button */}
//       <button
//         onClick={() => navigate("/login")}
//         className="
//           absolute top-6 left-6
//           text-sm font-medium
//           text-gray-300 hover:text-white
//           transition
//         "
//       >
//         ← Back to Login
//       </button>

//       <div className="glass-card p-8 w-full max-w-md animate-slide-up">
//         <h2 className="text-2xl font-semibold mb-6 text-center">
//           Raise a Ticket
//         </h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Category */}
//           <select
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//             required
//             className="w-full input-dark h-12 rounded-xl px-3"
//           >
//             <option value="">Select category</option>
//             {categories.map((c) => (
//               <option key={c} value={c}>
//                 {c}
//               </option>
//             ))}
//           </select>

//           {/* Description */}
//           <Input
//             placeholder="Describe your request"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             required
//           />

//           {/* Submit */}
//           <Button
//             disabled={loading}
//             className="
//               w-full rounded-xl
//               bg-gradient-to-r from-red-600 to-orange-600
//               text-white font-medium
//               hover:scale-[1.03]
//               transition
//             "
//           >
//             {loading ? "Submitting..." : "Submit Ticket"}
//           </Button>

//           <p className="text-xs text-gray-400 text-center">
//             <b>Login</b> to track your tickets and get faster updates.
//             <br />
//             All external tickets are treated as <b>CRITICAL</b>.
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default RaiseTicket;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ================= CATEGORIES ================= */
const categories = [
  "Feature Request",
  "Data Request",
  "Data Feedback",
  "Product Demo",
  "Platform Access",
  "Others",
];

const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000000";

const RaiseTicket = () => {
  const navigate = useNavigate();

  const [category, setCategory] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("nr_resolve_tickets").insert({
        tenant_id: DEFAULT_TENANT_ID,
        issue_origin: "external",
        title: category,
        description,
        type: category,
        created_by: user?.id ?? null,
        source_module: email,
      });

      if (error) throw error;

      // ✅ CLEAN SUCCESS TOAST
      toast.success("Ticket submitted successfully", {
        description: "Our team will contact you if needed.For better tracking, please login.",
        duration: 9000,
      });

      setCategory("");
      setEmail("");
      setDescription("");

      // ✅ Optional smooth redirect
      setTimeout(() => navigate("/"), 1500);
    } catch (err: any) {
      toast.error("Failed to submit ticket", {
        description: err.message || "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div
        className="
          glass-card p-8 w-full max-w-md
          animate-slide-up
          transition-all
        "
      >
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/")}
          className="
            absolute top-4 left-4
            w-9 h-9
            rounded-full
            bg-white/5 hover:bg-white/10
            text-gray-300 hover:text-white
            flex items-center justify-center
            transition
          "
        >
          <ArrowLeft size={18} />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center">
          Raise a Ticket
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full input-dark h-12 rounded-xl px-3"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            placeholder="Describe your request"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <Button
            disabled={loading}
            className="
              w-full rounded-xl
              bg-gradient-to-r from-red-600 to-orange-600
              text-white font-medium
              transition-all
              hover:scale-[1.03]
              disabled:opacity-60
            "
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </Button>

          <p className="text-xs text-gray-400 text-center">
            We’ll contact you via email if needed.
            For better tracking, please login.
          </p>
        </form>
      </div>
    </div>
  );
};

export default RaiseTicket;



 