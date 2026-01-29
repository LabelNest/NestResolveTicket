import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";


type Ticket = {
  id: string;
  issue_origin: string;
  priority: string;
  status: string;
};


const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626"];


const AdminTicketAnalytics = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);


  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return navigate("/");

    // ✅ Admin check
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

    loadTickets();
  };


  const loadTickets = async () => {
    const { data, error } = await supabase
      .from("nr_resolve_tickets")
      .select("id, issue_origin, priority, status");

    if (error) {
      console.error(error);
      // alert("Failed to load tickets");
      toast.error("Failed to load tickets");
      return;
    }

    setTickets(data || []);
    toast.success("Ticket analytics loaded");
  };

  const countBy = (key: keyof Ticket) => {
    const map: Record<string, number> = {};
    tickets.forEach(t => {
      map[t[key]] = (map[t[key]] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  };

  const total = tickets.length;
  const internal = tickets.filter(t => t.issue_origin === "internal").length;
  const external = tickets.filter(t => t.issue_origin === "external").length;
  
  const critical = tickets.filter(t => t.priority === "CRITICAL").length;
  const high = tickets.filter(t => t.priority === "HIGH").length;
  const medium = tickets.filter(t => t.priority === "MEDIUM").length;
  const low = tickets.filter(t => t.priority === "LOW").length;


  return (
    <div className="p-10 space-y-8">
      <h1 className="text-2xl font-semibold">Ticket Analytics</h1>


      <div className="grid grid-cols-6 gap-4">
        <Stat label="Total Tickets" value={total} />
        <Stat label="Internal" value={internal} />
        <Stat label="External" value={external} />
        <Stat label="Critical" value={critical} />
        <Stat label="High" value={high} />
        <Stat label="Medium" value={medium} />
        <Stat label="Low" value={low} />
      </div>

   
      <div className="grid grid-cols-3 gap-6">
      
        <Chart title="By Status">
          <PieChart>
            <Pie
              data={countBy("status")}
              dataKey="value"
              nameKey="name"
              outerRadius={90}
            >
              {countBy("status").map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </Chart>

       
        <Chart title="By Priority">
          <BarChart data={countBy("priority")}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" />
          </BarChart>
        </Chart>

        
        <Chart title="Internal vs External">
          <BarChart data={countBy("issue_origin")}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#16a34a" />
          </BarChart>
        </Chart>
      </div>
    </div>
  );
};


const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="border rounded p-4">
    <p className="text-sm">{label}</p>
    <p className="text-xl font-semibold">{value}</p>
  </div>
);

const Chart = ({ title, children }: any) => (
  <div className="border rounded p-4">
    <p className="mb-2 font-medium">{title}</p>
    <ResponsiveContainer width="100%" height={250}>
      {children}
    </ResponsiveContainer>
  </div>
);

export default AdminTicketAnalytics;

