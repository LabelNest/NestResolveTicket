import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { User as SupabaseUser } from '@supabase/supabase-js';
import { 
  Ticket, TicketStatus, Priority, TicketTypeConfig, 
  TicketMetadata, Attachment, FormField 
} from './types';   
import { TICKET_TYPES, STATUS_LABELS, PRIORITY_COLORS } from './constants';
import { 
  Plus, Search, Layout, ClipboardList, Settings, User, 
  Filter, ChevronRight, X, Paperclip, CheckCircle2, 
  MoreHorizontal, Kanban, List, Inbox 
} from 'lucide-react';
import TicketList from './ticketlist';

type ModalState = 'closed' | 'selector' | 'form';

const App: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [modalState, setModalState] = useState<ModalState>('closed');
  const [selectedType, setSelectedType] = useState<TicketTypeConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [activeView, setActiveView] = useState<'board' | 'settings'>('board');
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);

  // --- Logic: Fetch Tickets ---
  useEffect(() => {
    const fetchTickets = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setAuthUser(user); // Set the user state here

      const tenantId = user.user_metadata?.tenant_id;
      if (!tenantId) {
        console.error("tenant_id missing in user metadata");
        return;
      }

      const { data, error } = await supabase
        .from("nr_resolve_tickets")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading tickets:", error);
        return;
      }
      setTickets(data ?? []);
    };
    fetchTickets();
  }, []);

  const handleOpenRaiseTicket = () => setModalState('selector');
  const handleSelectType = (type: TicketTypeConfig) => {
    setSelectedType(type);
    setModalState('form');
  };

  // --- Logic: Create Ticket ---
  const handleCreateTicket = async (formData: Record<string, any>) => {
    if (!authUser) {
      alert("User not authenticated");
      return;
    }

    const tenantId = authUser.user_metadata?.tenant_id;
    if (!tenantId) {
      alert("tenant_id missing in user metadata");
      return;
    }

    const newTicketData = {
      title: `${selectedType!.label}: ${formData.description?.substring(0, 30) || 'New Request'}`,
      description: formData.description || '',
      type: selectedType!.ticket_type,
      priority: formData.urgency || formData.severity || 'MEDIUM',
      status: 'TO DO',
      department: selectedType!.default_team,
      dataset: formData,
      issue_origin: 'internal',
      source_module: 'ticketing',
      tenant_id: tenantId, 
      created_by: authUser.id,
    };

    const { data, error } = await supabase
      .from('nr_resolve_tickets')
      .insert([newTicketData])
      .select();

    if (error) {
      alert(`Failed to save: ${error.message}`);
      return;
    }

    if (data?.length) {
      setTickets(prev => [data[0], ...prev]);
      setModalState('closed');
      setSelectedType(null);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tickets, searchQuery]);

  return (
    <div className="flex h-screen overflow-hidden text-slate-900 bg-[#F4F5F7]">
      <aside className="w-64 bg-[#0747A6] text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
            <Inbox className="text-[#0747A6] w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">NestResolve</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          <NavItem icon={<Kanban size={20} />} label="Board" active={activeView === 'board' && viewMode === 'kanban'} onClick={() => { setActiveView('board'); setViewMode('kanban'); }} />
          <NavItem icon={<List size={20} />} label="All Issues" active={activeView === 'board' && viewMode === 'list'} onClick={() => { setActiveView('board'); setViewMode('list'); }} />
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search issues..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-md outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleOpenRaiseTicket} className="bg-[#0052CC] text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2">
              <Plus size={18} /> Raise a Ticket
            </button>
            <User size={20} className="text-slate-500" />
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {activeView === 'board' ? (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Resolve Inbox</h1>
                <div className="flex bg-slate-200 p-1 rounded-md">
                  <button onClick={() => setViewMode('kanban')} className={`px-3 py-1 text-sm rounded ${viewMode === 'kanban' ? 'bg-white shadow-sm' : ''}`}>Kanban</button>
                  <button onClick={() => setViewMode('list')} className={`px-3 py-1 text-sm rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}>List</button>
                </div>
              </div>
              {viewMode === 'kanban' ? (
                <div className="flex gap-4 h-full pb-8">
                  {(Object.values(TicketStatus) as TicketStatus[]).map(status => (
                    <KanbanColumn key={status} status={status} tickets={filteredTickets.filter(t => t.status === status)} />
                  ))}
                </div>
              ) : (
                <TicketList tickets={filteredTickets} />
              )}
            </>
          ) : (
            <ProjectSettings />
          )}
        </div>
      </main>

      {modalState !== 'closed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">{modalState === 'selector' ? 'Category' : `Raise ${selectedType?.label}`}</h2>
              <button onClick={() => setModalState('closed')}><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {modalState === 'selector' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TICKET_TYPES.map(type => (
                    <button key={type.ticket_type} onClick={() => handleSelectType(type)} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-blue-50 text-left">
                      <span className="text-3xl">{type.icon}</span>
                      <div><h4 className="font-semibold">{type.label}</h4></div>
                    </button>
                  ))}
                </div>
              ) : (
                <DynamicForm schema={selectedType!.form_schema_json.fields} onSubmit={handleCreateTicket} onBack={() => setModalState('selector')} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Subcomponents ---

const NavItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${active ? 'bg-white/10 text-white' : 'text-blue-100 hover:bg-white/5'}`}>
    {icon} <span>{label}</span>
  </button>
);

const KanbanColumn: React.FC<{ status: TicketStatus, tickets: Ticket[] }> = ({ status, tickets }) => (
  <div className="w-80 flex flex-col shrink-0 h-full">
    <div className="mb-3 flex items-center justify-between px-2">
      <span className="text-xs font-bold uppercase text-slate-500">{STATUS_LABELS[status]} ({tickets.length})</span>
    </div>
    <div className="flex-1 bg-slate-100/50 rounded-lg p-2 flex flex-col gap-3 overflow-y-auto">
      {tickets.map(ticket => (
        <div key={ticket.id} className="bg-white p-3 rounded shadow-sm border border-slate-200">
          <div className="text-sm font-medium text-slate-700">{ticket.title}</div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-[10px] font-bold uppercase text-slate-500">{ticket.priority}</span>
            <User size={12} className="text-slate-500" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DynamicForm = ({ schema, onSubmit, onBack }: any) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(formData); };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {schema.map((field: any) => (
        <div key={field.key} className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea className="w-full border rounded-md p-2" onChange={(e) => setFormData({...formData, [field.key]: e.target.value})} />
          ) : (
            <input className="w-full border rounded-md p-2" type={field.type} onChange={(e) => setFormData({...formData, [field.key]: e.target.value})} />
          )}
        </div>
      ))}
      <div className="flex justify-between pt-4">
        <button type="button" onClick={onBack}>Back</button>
        <button type="submit" className="bg-[#0052CC] text-white px-6 py-2 rounded-md">Create Ticket</button>
      </div>
    </form>
  );
};

const ProjectSettings: React.FC = () => (
  <div className="max-w-4xl mx-auto">
    <h1 className="text-3xl font-bold">Project Settings</h1>
    <p>Workspace and configuration options.</p>
  </div>
);

export default App;
