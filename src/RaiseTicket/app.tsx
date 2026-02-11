import React, { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
  Ticket,
  TicketStatus,
  Priority,
  TicketTypeConfig,
  TicketMetadata,
  Attachment,
  FormField
} from "./types";
import { TICKET_TYPES, STATUS_LABELS } from "./constants";
import {
  Plus, Search, Layout, ClipboardList, Settings, User, Filter,
  ChevronRight, X, Paperclip, CheckCircle2, MoreHorizontal,
  Kanban, List, Inbox
} from "lucide-react";
import TicketList from "./ticketlist";

type ModalState = "closed" | "selector" | "form";

const App: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [metadata, setMetadata] = useState<TicketMetadata[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [modalState, setModalState] = useState<ModalState>("closed");
  const [selectedType, setSelectedType] = useState<TicketTypeConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [activeView, setActiveView] = useState<"board" | "settings">("board");
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthUser(user);
      if (!user) return;
      const tenantId = user.user_metadata?.tenant_id;
      if (!tenantId) return;
      const { data, error } = await supabase
        .from("nr_resolve_tickets")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });
      if (!error) setTickets(data ?? []);
    };
    init();
  }, []);

  const handleOpenRaiseTicket = () => setModalState("selector");

  const handleSelectType = (type: TicketTypeConfig) => {
    setSelectedType(type);
    setModalState("form");
  };

  const handleCreateTicket = async (formData: Record<string, any>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const tenantId = user.user_metadata?.tenant_id;
    if (!tenantId) return;
    const newTicketData = {
      title: `${selectedType!.label}: ${formData.description?.substring(0, 30) || "New Request"}`,
      description: formData.description || "",
      type: selectedType!.ticket_type,
      priority: formData.urgency || formData.severity || "MEDIUM",
      status: "TO DO",
      department: selectedType!.default_team,
      dataset: formData,
      issue_origin: "internal",
      source_module: "ticketing",
      tenant_id: tenantId,
      created_by: user.id
    };
    const { data, error } = await supabase
      .from("nr_resolve_tickets")
      .insert([newTicketData])
      .select();
    if (!error && data?.length) {
      setTickets(prev => [data[0], ...prev]);
      setModalState("closed");
      setSelectedType(null);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tickets, searchQuery]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F5F7]">
      <aside className="w-64 bg-[#0747A6] text-white flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
            <Inbox className="text-[#0747A6]" size={18} />
          </div>
          <span className="font-bold text-xl">NestResolve</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          <NavItem icon={<Kanban size={20} />} label="Board" onClick={() => { setActiveView("board"); setViewMode("kanban"); }} />
          <NavItem icon={<List size={20} />} label="All Issues" onClick={() => { setActiveView("board"); setViewMode("list"); }} />
        </nav>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <input
            placeholder="Search issues..."
            className="bg-slate-100 px-4 py-2 rounded-md"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button onClick={handleOpenRaiseTicket} className="bg-[#0052CC] text-white px-4 py-2 rounded-md flex items-center gap-2">
            <Plus size={16} /> Raise Ticket
          </button>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          {viewMode === "kanban" && (
            <div className="flex gap-4">
              {(Object.values(TicketStatus) as TicketStatus[]).map(status => (
                <KanbanColumn
                  key={status}
                  status={status}
                  tickets={filteredTickets.filter(t => t.status === status)}
                />
              ))}
            </div>
          )}
          {viewMode === "list" && <TicketList tickets={filteredTickets} />}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/10 rounded-md">
    {icon}<span>{label}</span>
  </button>
);

const KanbanColumn: React.FC<{ status: TicketStatus; tickets: Ticket[] }> = ({ status, tickets }) => (
  <div className="w-80">
    <div className="font-bold text-xs mb-2">{STATUS_LABELS[status]}</div>
    <div className="space-y-2">
      {tickets.map(t => (
        <div key={t.id} className="bg-white p-3 rounded border">{t.title}</div>
      ))}
    </div>
  </div>
);

export default App;
