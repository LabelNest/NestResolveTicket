import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = [
  "Feature Request",
  "Data Request",
  "Data Feedback",
  "Product Demo",
  "Platform Access",
  "Others",
];

// 🔴 TEMP: replace with real tenant_id if you have tenants
const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000000";

const RaiseTicket = () => {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      /* ---------------- AUTH USER ---------------- */
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Please login to raise a ticket");
        return;
      }

      /* ---------------- INSERT TICKET ---------------- */
      const { error } = await supabase
        .from("nr_resolve_tickets")
        .insert({
          tenant_id: DEFAULT_TENANT_ID, // ✅ REQUIRED
          issue_origin: "external",     // ✅ REQUIRED
          title: category,              // ✅ REQUIRED
          description: description,     // ✅ correct column
          type: category,               // ✅ maps category
          priority: "HIGH",             // ✅ REQUIRED
          status: "OPEN",               // ✅ REQUIRED
          created_by: user.id,          // ✅ REQUIRED
        });

      if (error) throw error;

      alert("Ticket raised successfully. Our team will contact you.");

      setCategory("");
      setDescription("");
    } catch (err: any) {
      alert(err.message || "Failed to raise ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card p-8 w-full max-w-md animate-slide-up">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Raise a Ticket
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
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

          {/* Description */}
          <Input
            placeholder="Describe your request"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          {/* Submit Button */}
          <Button
            disabled={loading}
            className="
              relative overflow-hidden
              w-full mt-2 rounded-xl
              bg-gradient-to-r from-blue-600 to-indigo-600
              text-white font-medium
              transition-all duration-300 ease-out
              hover:scale-[1.03]
              hover:shadow-[0_0_35px_rgba(79,70,229,0.45)]
              active:scale-[0.97]
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RaiseTicket;
