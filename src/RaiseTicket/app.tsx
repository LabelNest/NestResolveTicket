import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClient";

import {
  Ticket,
  TicketStatus,
  Priority,
  TicketTypeConfig,
  TicketMetadata,
  Attachment,
  FormField
} from '../types';
import { TICKET_TYPES, STATUS_LABELS, PRIORITY_COLORS } from './constants';
import {
  Plus,
  Search,
  Layout,
  ClipboardList,
  Settings,
  User,
  Filter,
  ChevronRight,
  X,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Kanban,
  List,
  Inbox
} from 'lucide-react';
import TicketList from './ticketlist';


// --- Types for internal state ---
type ModalState = 'closed' | 'selector' | 'form';

const App: React.FC = () => {
  // --- State ---
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [metadata, setMetadata] = useState<TicketMetadata[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [modalState, setModalState] = useState<ModalState>('closed');
  const [selectedType, setSelectedType] = useState<TicketTypeConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [activeView, setActiveView] = useState<'board' | 'settings'>('board');

  // Fetch tickets from Supabase on component mount
  useEffect(() => {
    const fetchTickets = async () => {
      const { data, error } = await supabase
        .from('nr_resolve_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setTickets(data);
      if (error) console.error('Error loading tickets:', error);
    };
    fetchTickets();
  }, []);

  // --- Logic ---
  const handleOpenRaiseTicket = () => {
    setModalState('selector');
  };

  const handleSelectType = (type: TicketTypeConfig) => {
    setSelectedType(type);
    setModalState('form');
  };

  const handleCreateTicket = async (formData: Record<string, any>) => {
    // Mapping form data to your Supabase columns
    const newTicketData = {
      title: `${selectedType!.label}: ${formData.description?.substring(0, 30) || 'New Request'}`,
      description: formData.description || '',
      type: selectedType!.ticket_type,
      priority: formData.urgency || formData.severity || 'MEDIUM',
      // 'status' MUST be 'TODO' to appear in the first column of the board
      status: 'TO DO',
      department: selectedType!.default_team,
      dataset: formData,
      issue_origin: 'internal',
      source_module: 'ticketing',
      tenant_id: "00000000-0000-0000-0000-000000000000",
      created_by: "00000000-0000-0000-0000-000000000000"
    };

    const { data, error } = await supabase
      .from('nr_resolve_tickets')
      .insert([newTicketData])
      .select(); // This retrieves the created row back from Supabase

    if (error) {
      console.error("Supabase Error:", error);
      alert(`Failed to save: ${error.message}`);
      return;
    }

    // --- Update UI State ---
    if (data && data.length > 0) {
      // Adding the new ticket to state triggers a re-render of the Kanban columns
      setTickets(prevTickets => [data[0], ...prevTickets]);

      // Close the modal to show the board
      setModalState('closed');
      setSelectedType(null);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.key.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tickets, searchQuery]);

  return (
    <div className="flex h-screen overflow-hidden text-slate-900 bg-[#F4F5F7]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0747A6] text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
            <Inbox className="text-[#0747A6] w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">NestResolve</span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <NavItem icon={<Kanban size={20} />} label="Board" active={activeView === 'board' && viewMode === 'kanban'} onClick={() => { setActiveView('board'); setViewMode('kanban'); }} />
          <NavItem icon={<List size={20} />} label="All Issues" active={activeView === 'board' && viewMode === 'list'} onClick={() => {
            setActiveView('board'); setViewMode('list');
          }} />
          <div className="pt-4 pb-2 px-3 text-xs font-semibold uppercase tracking-wider text-blue-200/60">Teams</div>
          <NavItem icon={<ClipboardList size={20} />} label="Data Team" />
          <NavItem icon={<ClipboardList size={20} />} label="HR Ops" />
          <NavItem icon={<ClipboardList size={20} />} label="IT/Infra" />
        </nav>

        <div className="p-4 border-t border-blue-800">
          <NavItem
            icon={<Settings size={20} />}
            label="Project Settings"
            active={activeView === 'settings'}
            onClick={() => setActiveView('settings')}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search issues..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md transition-all outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenRaiseTicket}
              className="bg-[#0052CC] hover:bg-[#0747A6] text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus size={18} />
              Raise a Ticket
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-300">
              <User size={20} className="text-slate-500" />
            </div>
          </div>
        </header>

        {/* Board/Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {activeView === 'board' ? (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Resolve Inbox</h1>
                  <p className="text-slate-500 text-sm">Manage and track company issues in real-time.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="p-2 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all text-slate-600" title="Filter tickets">
                    <Filter size={20} />
                  </button>
                  <div className="h-6 w-px bg-slate-300 mx-2"></div>
                  <div className="flex bg-slate-200 p-1 rounded-md">
                    <button
                      onClick={() => setViewMode('kanban')}
                      title="Switch to Kanban view"
                      className={`px-3 py-1 text-sm font-medium rounded ${viewMode === 'kanban' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600'}`}
                    >
                      Kanban
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      title="Switch to List view"
                      className={`px-3 py-1 text-sm font-medium rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600'}`}
                    >
                      List
                    </button>
                  </div>
                </div>
              </div>

              {viewMode === 'kanban' && (
                <div className="flex gap-4 h-full pb-8">
                  {(Object.values(TicketStatus) as TicketStatus[]).map(status => (
                    <KanbanColumn
                      key={status}
                      status={status}
                      tickets={filteredTickets.filter(t => t.status === status)}
                    />
                  ))}
                </div>
              )}

              {viewMode === 'list' && (
                <TicketList tickets={filteredTickets} />
              )}
            </>
          ) : (
            <ProjectSettings />
          )}
        </div>
      </main>

      {/* --- Modals --- */}
      {modalState !== 'closed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {modalState === 'selector' ? 'What kind of issue is this?' : `Raise ${selectedType?.label}`}
                </h2>
                <p className="text-slate-500 text-sm">
                  {modalState === 'selector' ? 'Choose a category to get started' : selectedType?.description}
                </p>
              </div>
              <button
                onClick={() => setModalState('closed')}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {modalState === 'selector' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TICKET_TYPES.map(type => (
                    <button
                      key={type.ticket_type}
                      onClick={() => handleSelectType(type)}
                      className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                    >
                      <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{type.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 group-hover:text-blue-700">{type.label}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{type.description}</p>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-400 shrink-0 self-center" />
                    </button>
                  ))}
                </div>
              ) : (
                <DynamicForm
                  schema={selectedType!.form_schema_json.fields}
                  onSubmit={handleCreateTicket}
                  onBack={() => setModalState('selector')}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Subcomponents ---

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? 'bg-white/10 text-white' : 'text-blue-100 hover:bg-white/5'
      }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// Fix: Explicitly type KanbanColumn as React.FC to allow 'key' prop in JSX mapping and ensure correct props interface
const KanbanColumn: React.FC<{ status: TicketStatus, tickets: Ticket[] }> = ({ status, tickets }) => (
  <div className="w-80 flex flex-col shrink-0 h-full max-h-full">
    {/* Column Header */}
    <div className="mb-3 px-2 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {STATUS_LABELS[status]}
        </span>
        <span className="w-5 h-5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-full flex items-center justify-center">
          {tickets.length}
        </span>
      </div>
      <button className="text-slate-400 hover:text-slate-600" title="More options"><MoreHorizontal size={16} /></button>
    </div>

    {/* The Ticket Box - Cards stay inside here now */}
    <div className="flex-1 bg-slate-100/50 rounded-lg p-2 flex flex-col gap-3 min-h-0 border border-slate-200 overflow-y-auto">
      {tickets.map(ticket => (
        <div
          key={ticket.id}
          className="bg-white p-3 rounded shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group shrink-0"
        >
          <div className="text-sm font-medium text-slate-700 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
            {ticket.title}
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              {/* Priority Dot */}
              <span className={`w-2 h-2 rounded-full ${ticket.priority === Priority.CRITICAL ? 'bg-red-500' :
                ticket.priority === Priority.HIGH ? 'bg-orange-400' :
                  ticket.priority === Priority.MEDIUM ? 'bg-blue-500' : 'bg-slate-400'
                }`}></span>

              {/* Priority Label - Replaces the blue 'NEW' text */}
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {ticket.priority}
              </span>
            </div>

            <div className="w-6 h-6 rounded-full bg-slate-200 border border-white flex items-center justify-center">
              <User size={12} className="text-slate-500" />
            </div>
          </div>
        </div>
      ))}

      {tickets.length === 0 && (
        <div className="flex-1 border-2 border-dashed border-slate-200 rounded flex items-center justify-center text-slate-300 text-sm italic py-8">
          No items here
        </div>
      )}
    </div>
  </div>
);

const DynamicForm = ({ schema, onSubmit, onBack }: { schema: FormField[], onSubmit: (data: any) => void, onBack: () => void }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {schema.map(field => (
        <div key={field.key} className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 block">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>

          {field.type === 'select' ? (
            <select
              required={field.required}
              aria-label={field.label}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              value={formData[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
            >
              <option value="">Select an option...</option>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : field.type === 'textarea' ? (
            <textarea
              required={field.required}
              placeholder={field.placeholder}
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none"
              value={formData[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
            />
          ) : field.type === 'file' ? (
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Paperclip className="w-8 h-8 mb-3 text-slate-400" />
                  <p className="mb-2 text-sm text-slate-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-slate-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleChange(field.key, e.target.files?.[0])}
                />
              </label>
            </div>
          ) : (
            <input
              type={field.type}
              required={field.required}
              placeholder={field.placeholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              value={formData[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
            />
          )}
        </div>
      ))}

      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          ← Back
        </button>
        <button
          type="submit"
          className="bg-[#0052CC] hover:bg-[#0747A6] text-white px-6 py-2 rounded-md font-bold text-sm shadow-md transition-all active:scale-95"
        >
          Create Ticket
        </button>
      </div>
    </form>
  );
};

const ProjectSettings: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Project Settings</h1>
        <p className="text-slate-500">Configure your workspace, members, and issue types.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section: Project Details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Settings size={20} /></div>
            <h3 className="font-bold text-slate-700">General Configuration</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">Change project name, icon, and visibility settings.</p>
          <button className="text-blue-600 text-sm font-semibold hover:underline">Edit Details →</button>
        </div>

        {/* Section: Access & People */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><User size={20} /></div>
            <h3 className="font-bold text-slate-700">People & Access</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">Manage team members and their permission levels.</p>
          <button className="text-blue-600 text-sm font-semibold hover:underline">Manage Team →</button>
        </div>

        {/* Section: Issue Types (Schema) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Layout size={20} /></div>
            <h3 className="font-bold text-slate-700">Issue Types</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">Configure forms for Bug Reports, Feature Requests, and Task items.</p>
          <button className="text-blue-600 text-sm font-semibold hover:underline">Configure Forms →</button>
        </div>

        {/* Section: Workflow Automation */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg text-green-600"><CheckCircle2 size={20} /></div>
            <h3 className="font-bold text-slate-700">Automation</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">Create rules to automatically move or assign tickets based on priority.</p>
          <button className="text-blue-600 text-sm font-semibold hover:underline">Setup Rules →</button>
        </div>
      </div>
    </div>
  );
};

export default App;
