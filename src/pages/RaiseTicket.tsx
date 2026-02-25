import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";



const TICKET_TYPES = [
  {
    ticket_type: "data_issue",
    label: "Data / Dataset Issue",
    default_team: "Data Engineering",
    form_schema_json: {
      fields: [
        {
          key: "dataset_name",
          label: "Dataset Name",
          type: "select",
          required: true,
          options: [
            { label: "GP Dataset", value: "gp_dataset" },
            { label: "Fund Master", value: "fund_master" },
            { label: "Portfolio Co", value: "portfolio_co" }
          ]
        },
        {
          key: "entity_type",
          label: "Entity Type",
          type: "select",
          required: true,
          options: [
            { label: "GP", value: "gp" },
            { label: "Fund", value: "fund" },
            { label: "Company", value: "company" },
            { label: "SP", value: "sp" }
          ]
        },
        { key: "record_link", label: "Record Link (Optional)", type: "url" },
        {
          key: "issue_category",
          label: "Issue Type",
          type: "select",
          required: true,
          options: [
            { label: "Missing Data", value: "missing" },
            { label: "Incorrect Data", value: "incorrect" },
            { label: "Duplicate", value: "duplicate" },
            { label: "Outdated", value: "outdated" }
          ]
        },
        { key: "description", label: "Describe the data issue", type: "textarea", required: true }
      ]
    }
  },
  {
    ticket_type: "qa_issue",
    label: "QA Issue",
    default_team: "QA/QC",
    form_schema_json: {
      fields: [
        {
          key: "qa_type",
          label: "QA Category",
          type: "select",
          required: true,
          options: [
            { label: "Annotation Error", value: "annotation" },
            { label: "Validation Failure", value: "validation" },
            { label: "Sampling Issue", value: "sampling" }
          ]
        },
        { key: "linked_task", label: "Linked Task/Batch ID", type: "text", required: true },
        {
          key: "severity",
          label: "Severity",
          type: "select",
          required: true,
          options: [
            { label: "Blocker", value: "blocker" },
            { label: "Critical", value: "critical" },
            { label: "Major", value: "major" },
            { label: "Minor", value: "minor" }
          ]
        },
        { key: "description", label: "Full Observation", type: "textarea", required: true }
      ]
    }
  },
  {
    ticket_type: "hr_issue",
    label: "HR Issue",
    default_team: "HR Ops",
    form_schema_json: {
      fields: [
        {
          key: "hr_category",
          label: "HR Category",
          type: "select",
          required: true,
          options: [
            { label: "Leave Request", value: "leave" },
            { label: "Payroll Discrepancy", value: "payroll" },
            { label: "Attendance", value: "attendance" },
            { label: "Personal Detail Correction", value: "profile" }
          ]
        },
        { key: "description", label: "Details", type: "textarea", required: true }
      ]
    }
  },
  {
    ticket_type: "admin_issue",
    label: "Admin / Ops Issue",
    default_team: "Operations",
    form_schema_json: {
      fields: [
        {
          key: "category",
          label: "Category",
          type: "select",
          required: true,
          options: [
            { label: "Travel", value: "travel" },
            { label: "Vendor Management", value: "vendor" },
            { label: "Payment Query", value: "payment" },
            { label: "Access Control", value: "access" }
          ]
        },
        {
          key: "urgency",
          label: "Urgency",
          type: "select",
          required: true,
          options: [
            { label: "P1 - Immediate", value: "p1" },
            { label: "P2 - 24 Hours", value: "p2" },
            { label: "P3 - Weekly", value: "p3" }
          ]
        },
        { key: "description", label: "Request details", type: "textarea", required: true }
      ]
    }
  },
  {
    ticket_type: "asset_issue",
    label: "Asset / Infra Issue",
    default_team: "IT / Infra",
    form_schema_json: {
      fields: [
        {
          key: "asset_type",
          label: "Asset Type",
          type: "select",
          required: true,
          options: [
            { label: "Laptop / PC", value: "laptop" },
            { label: "Monitors/Peripherals", value: "peripheral" },
            { label: "Software License", value: "software" },
            { label: "Cloud Resources", value: "cloud" }
          ]
        },
        { key: "asset_id", label: "Asset ID (If applicable)", type: "text" },
        { key: "description", label: "Describe the issue/need", type: "textarea", required: true }
      ]
    }
  },
  {
    ticket_type: "platform_issue",
    label: "Platform / Login Issue",
    default_team: "Product Support",
    form_schema_json: {
      fields: [
        {
          key: "platform",
          label: "Platform",
          type: "select",
          required: true,
          options: [
            { label: "AnnoNest", value: "annonest" },
            { label: "NestLens", value: "nestlens" },
            { label: "NestHR", value: "nesthr" }
          ]
        },
        {
          key: "issue_type",
          label: "Problem",
          type: "select",
          required: true,
          options: [
            { label: "Login Failed", value: "login" },
            { label: "Signup Issue", value: "signup" },
            { label: "Access Denied", value: "denied" },
            { label: "System Bug", value: "bug" }
          ]
        },
        { key: "error_message", label: "Error Message (Optional)", type: "text" },
        { key: "description", label: "Additional context", type: "textarea", required: true }
      ]
    }
  },
  {
    ticket_type: "feature_request",
    label: "Feature Request",
    default_team: "Product Roadmap",
    form_schema_json: {
      fields: [
        { key: "product", label: "Product / Service", type: "text", required: true },
        { key: "feature_name", label: "Short Name", type: "text", required: true },
        { key: "business_case", label: "Business Use Case", type: "textarea", required: true }
      ]
    }
  },
  {
    ticket_type: "feedback",
    label: "General Feedback",
    default_team: "Growth/Product",
    form_schema_json: {
      fields: [
        { key: "message", label: "Your message", type: "textarea", required: true }
      ]
    }
  }
];



const RaiseTicket = () => {
  const navigate = useNavigate();

  const [category, setCategory] = useState<any>(null);
  const [dynamicData, setDynamicData] = useState<any>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const isInternal = email.toLowerCase().endsWith("@labelnest.in");
      const tenantCode = isInternal ? "LNI" : "GUEST";

      const { data: tenant, error: tenantError } = await supabase
        .from("lni_tenants")
        .select("id")
        .eq("code", tenantCode)
        .single();

      if (tenantError || !tenant) {
        throw new Error("Tenant not configured");
      }

      const { error } = await supabase
        .from("nr_resolve_tickets")
        .insert({
          tenant_id: tenant.id,
          issue_origin: isInternal ? "internal" : "external",
          title: category.label,
           department: category.default_team,
          description: dynamicData.description || dynamicData.message || "",
          type: category.ticket_type,
          priority: "CRITICAL",
          created_by: user?.id ?? null,
          created_by_name: name,
          created_by_email: email,
          source_module: "raise_ticket_form"
        });

      if (error) throw error;

      toast.success("Ticket submitted successfully", {
        description:
          "Our team will contact you if needed. For better tracking, please login.",
        duration: 9000
      });

      setCategory(null);
      setDynamicData({});
      setName("");
      setEmail("");

      setTimeout(() => navigate("/"), 1500);

    } catch (err: any) {
      toast.error("Failed to submit ticket", {
        description: err.message || "Please try again"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card p-8 w-full max-w-md animate-slide-up transition-all">

        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center justify-center transition"
        >
          <ArrowLeft size={18} />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center">
          Raise a Ticket
        </h2>

        <form onSubmit={handleFinalSubmit} className="space-y-4">

          <select
            value={category?.ticket_type || ""}
            onChange={(e) =>
              setCategory(
                TICKET_TYPES.find(
                  (t) => t.ticket_type === e.target.value
                )
              )
            }
            required
            className="w-full input-dark h-12 rounded-xl px-3"
          >
            <option value="">Select category</option>
            {TICKET_TYPES.map((c) => (
              <option key={c.ticket_type} value={c.ticket_type}>
                {c.label}
              </option>
            ))}
          </select>

          {category &&
            category.form_schema_json.fields.map((field: any) =>
              field.type === "textarea" ? (
                <textarea
                  key={field.key}
                  required={field.required}
                  placeholder={field.label}
                  className="w-full input-dark rounded-xl px-3 py-2"
                  onChange={(e) =>
                    setDynamicData({
                      ...dynamicData,
                      [field.key]: e.target.value
                    })
                  }
                />
              ) : field.type === "select" ? (
                <select
                  key={field.key}
                  required={field.required}
                  className="w-full input-dark h-12 rounded-xl px-3"
                  onChange={(e) =>
                    setDynamicData({
                      ...dynamicData,
                      [field.key]: e.target.value
                    })
                  }
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  key={field.key}
                  placeholder={field.label}
                  required={field.required}
                  onChange={(e) =>
                    setDynamicData({
                      ...dynamicData,
                      [field.key]: e.target.value
                    })
                  }
                />
              )
            )}

          <Input
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-medium transition-all hover:scale-[1.03] disabled:opacity-60"
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


