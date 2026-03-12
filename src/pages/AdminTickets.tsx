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
import { motion, AnimatePresence } from "framer-motion";



type Ticket = {
  id: string;
  priority: string | null;
  status: string | null;
  assigned_to: string | null;
  created_by_name: string | null;
  created_by_email: string | null;
  source: "external" | "internal";
};

type User = {
  nr_auth_user_id: string;
  nr_name: string;
  nr_email: string;
};

type FilterType = "ALL" | "ASSIGNED" | "UNASSIGNED";



const PRIORITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: "#dc2626",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#22c55e",
};

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626"];



const AdminTicketAnalytics = () => {

  const navigate = useNavigate();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<FilterType>("ALL");

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

    await loadUsers();
    await loadTickets();

  };



  const loadUsers = async () => {

    const { data } = await supabase
      .from("nr_users")
      .select("nr_auth_user_id, nr_name, nr_email")
      .eq("nr_status", "active");

    setUsers(data || []);

  };

  const normalize = (v: any) =>
    v ? String(v).trim().toUpperCase() : null;

 

  const loadTickets = async () => {

    const { data: external } = await supabase
      .from("nr_resolve_tickets")
      .select("id, priority, status, assigned_to, created_by_name, created_by_email")
      .order("created_at", { ascending: false });

    const { data: internal } = await supabase
      .from("nr_tickets_internal")
      .select("id, priority, status, assigned_to, created_by_name, created_by_email")
      .order("created_at", { ascending: false });

    const formattedExternal =
      external?.map((t) => ({
        ...t,
        priority: normalize(t.priority),
        status: normalize(t.status),
        source: "external" as const,
      })) || [];

    const formattedInternal =
      internal?.map((t) => ({
        ...t,
        priority: normalize(t.priority),
        status: normalize(t.status),
        source: "internal" as const,
      })) || [];

    setTickets([...formattedExternal, ...formattedInternal]);

  };



  const assignTicket = async (
    ticketId: string,
    userId: string,
    source: "external" | "internal"
  ) => {

    const table =
      source === "external"
        ? "nr_resolve_tickets"
        : "nr_tickets_internal";

    const { error } = await supabase
      .from(table)
      .update({ assigned_to: userId || null })
      .eq("id", ticketId);

    if (error) {
      toast.error("Failed to assign ticket");
      return;
    }



    const user = users.find((u) => u.nr_auth_user_id === userId);
    const ticket = tickets.find((t) => t.id === ticketId);

    if (user && ticket) {

      try {

        const { data: { session } } = await supabase.auth.getSession();

        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-ticket-assigned-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
              email: user.nr_email,
              name: user.nr_name,
              ticketId: ticketId,
              priority: ticket.priority,
            }),
          }
        );

      } catch (err) {
        console.error("Email sending failed:", err);
      }

    }

    toast.success("Ticket assigned");

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, assigned_to: userId || null }
          : t
      )
    );

  };



  const filteredTickets = tickets.filter((t) => {

    if (filter === "ALL") return true;

    if (filter === "ASSIGNED") return t.assigned_to !== null;

    if (filter === "UNASSIGNED") return t.assigned_to === null;

    return true;

  });



  const total = tickets.length;
  const internalCount = tickets.filter((t) => t.source === "internal").length;
  const externalCount = tickets.filter((t) => t.source === "external").length;
  const assignedCount = tickets.filter((t) => t.assigned_to !== null).length;
  const unassignedCount = tickets.filter((t) => t.assigned_to === null).length;

  const priorityCounts: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  tickets.forEach((t) => {
    if (t.priority && priorityCounts[t.priority] !== undefined) {
      priorityCounts[t.priority]++;
    }
  });

  const priorityData = PRIORITIES.map((p) => ({
    name: p,
    value: priorityCounts[p],
  }));

  const statusMap: Record<string, number> = {};

  tickets.forEach((t) => {
    if (!t.status) return;
    statusMap[t.status] = (statusMap[t.status] || 0) + 1;
  });

  const statusData = Object.entries(statusMap).map(([name, value]) => ({
    name,
    value,
  }));



  return (

    <motion.div
      className="p-10 space-y-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >

      <h1 className="text-3xl font-bold text-white">
        Ticket Management
      </h1>

      

      <div className="grid grid-cols-4 gap-6">

        <BigStat label="Total Tickets" value={total} />
        <BigStat label="Internal" value={internalCount} />
        <BigStat label="External" value={externalCount} />
        <BigStat label="Assigned" value={assignedCount} />
        <BigStat label="Unassigned" value={unassignedCount} />

        <BigStat label="Critical" value={priorityCounts.CRITICAL} />
        <BigStat label="High" value={priorityCounts.HIGH} />
        <BigStat label="Medium" value={priorityCounts.MEDIUM} />
        <BigStat label="Low" value={priorityCounts.LOW} />

      </div>

      

      <div className="grid grid-cols-3 gap-10">

        <Chart title="By Status">

          <PieChart>
            <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={95}>
              {statusData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
            contentStyle={{
            backgroundColor: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "8px",
            color: "#fff",
            }}
            labelStyle={{ color: "#38bdf8", fontWeight: "bold" }}
            itemStyle={{ color: "#fff" }}/>
          </PieChart>

        </Chart>

        <Chart title="By Priority">

          <BarChart data={priorityData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
            contentStyle={{
            backgroundColor: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "8px",
            color: "#fff",
            }}
            labelStyle={{ color: "#38bdf8", fontWeight: "bold" }}
            itemStyle={{ color: "#fff" }}/>
            <Bar dataKey="value">
              {priorityData.map((entry, index) => (
                <Cell key={index} fill={PRIORITY_COLORS[entry.name]} />
              ))}
            </Bar>
          </BarChart>

        </Chart>

        <Chart title="Internal vs External">

          <BarChart
            data={[
              { name: "Internal", value: internalCount },
              { name: "External", value: externalCount },
            ]}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
            contentStyle={{
            backgroundColor: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "8px",
            color: "#fff",
            }}
            labelStyle={{ color: "#38bdf8", fontWeight: "bold" }}
            itemStyle={{ color: "#fff" }}/>
            <Bar dataKey="value" fill="#16a34a" />
          </BarChart>

        </Chart>

      </div>

      

      <div className="flex gap-4">

        {["ALL", "ASSIGNED", "UNASSIGNED"].map((type) => (

          <motion.button
            key={type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(type as FilterType)}
            className={`px-6 py-3 rounded-xl font-medium ${
              filter === type
                ? "bg-blue-500 text-white"
                : "bg-[#0f172a] text-gray-300 hover:bg-[#1e293b]"
            }`}
          >
            {type}
          </motion.button>

        ))}

      </div>

     

      <div className="bg-[#0f172a] rounded-xl p-6 shadow-lg space-y-4">

        <h2 className="text-xl font-semibold text-white">
          Assign Tickets
        </h2>

        <AnimatePresence>

          {filteredTickets.map((ticket) => (

            <motion.div
              key={`${ticket.source}-${ticket.id}`}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-between items-center bg-[#111827] rounded-lg p-4"
            >

              <div>

                <p className="font-semibold text-white">
                  {ticket.created_by_name || "Unknown User"}
                </p>

                <p className="text-xs text-gray-400">
                  {ticket.created_by_email}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  #{ticket.id.slice(0,6)} • {ticket.priority} • {ticket.status} • {ticket.source}
                </p>

              </div>

              <select
                value={ticket.assigned_to || ""}
                onChange={(e) =>
                  assignTicket(ticket.id, e.target.value, ticket.source)
                }
                className="w-56 bg-[#1e293b] text-white border border-gray-600 rounded-lg px-3 py-2"
              >

                <option value="">Unassigned</option>

                {users.map((user) => (
                  <option
                    key={user.nr_auth_user_id}
                    value={user.nr_auth_user_id}
                  >
                    {user.nr_name} ({user.nr_email})
                  </option>
                ))}

              </select>

            </motion.div>

          ))}

        </AnimatePresence>

      </div>

    </motion.div>

  );

};



const BigStat = ({ label, value }: { label: string; value: number }) => (

  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-[#0f172a] rounded-2xl p-6 shadow-lg"
  >
    <p className="text-sm text-gray-400">{label}</p>
    <p className="text-3xl font-bold text-white mt-2">{value}</p>
  </motion.div>

);

const Chart = ({ title, children }: any) => (

  <motion.div
    className="bg-[#0f172a] rounded-xl p-6 shadow-lg"
    initial={{ opacity: 0, y: 25 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <p className="mb-4 font-semibold text-white">{title}</p>
    <ResponsiveContainer width="100%" height={260}>
      {children}
    </ResponsiveContainer>
  </motion.div>

);

export default AdminTicketAnalytics;
