import React, { useState, useEffect } from 'react';
import {
  X,
  MoreHorizontal,
  UserPlus,
  Calendar,
  RefreshCw,
  Plus,
  Check,
  Trash2,
  Circle,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Ticket, TicketStatus, Priority } from './types';
import { STATUS_LABELS } from './constants';
import { toast } from 'sonner';

// --- Types ---

interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

interface TicketDetailModalProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticketId: string, updated: Partial<Ticket>) => void;
  isExternal?: boolean;
}

// --- Priority config with colors ---
const PRIORITY_OPTIONS: { value: Priority; label: string; color: string; dot: string }[] = [
  { value: Priority.CRITICAL, label: 'Urgent', color: '#dc2626', dot: 'bg-red-500' },
  { value: Priority.HIGH, label: 'Important', color: '#f97316', dot: 'bg-orange-400' },
  { value: Priority.MEDIUM, label: 'Medium', color: '#22c55e', dot: 'bg-green-500' },
  { value: Priority.LOW, label: 'Low', color: '#64748b', dot: 'bg-slate-400' },
];

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: TicketStatus.TODO, label: 'Not started' },
  { value: TicketStatus.ACKNOWLEDGED, label: 'Acknowledged' },
  { value: TicketStatus.IN_REVIEW, label: 'In progress' },
  { value: TicketStatus.DONE, label: 'Completed' },
  { value: TicketStatus.REJECTED, label: 'Rejected' },
];

type NrUser = {
  nr_auth_user_id: string;
  nr_name: string;
};

// --- Component ---

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onSave,
  isExternal = false,
}) => {
  // Editable state
  const [title, setTitle] = useState(ticket.title);
  const [description, setDescription] = useState(ticket.description ?? '');
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [priority, setPriority] = useState<Priority>(ticket.priority);
  const [assignedTo, setAssignedTo] = useState<string | null>(ticket.assigned_to);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [repeatOption, setRepeatOption] = useState('none');
  const [showOnCard, setShowOnCard] = useState(false);
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [users, setUsers] = useState<NrUser[]>([]);
  const [saving, setSaving] = useState(false);

  // Labels derived from ticket
  const labels: { text: string; color: string }[] = [];
  if (ticket.department) labels.push({ text: ticket.department, color: '#0ea5e9' });
  if (ticket.types) labels.push({ text: ticket.types, color: '#8b5cf6' });
  if (ticket.type) labels.push({ text: ticket.type, color: '#f59e0b' });

  // Load users for assignment
  useEffect(() => {
    const loadUsers = async () => {
      const { data } = await supabase
        .from('nr_users')
        .select('nr_auth_user_id, nr_name')
        .eq('nr_status', 'active');
      setUsers(data || []);
    };
    loadUsers();
  }, []);

  // Reset state when ticket changes
  useEffect(() => {
    setTitle(ticket.title);
    setDescription(ticket.description ?? '');
    setStatus(ticket.status);
    setPriority(ticket.priority);
    setAssignedTo(ticket.assigned_to);
    setNotes('');
    setChecklist([]);
    setStartDate('');
    setDueDate('');
  }, [ticket.id]);

  // --- Handlers ---

  const handleSave = async () => {
    setSaving(true);
    const table = isExternal ? 'nr_resolve_tickets' : 'nr_tickets_internal';

    const updates: Partial<Ticket> = {
      title,
      description,
      status,
      priority,
      assigned_to: assignedTo,
    };

    const { error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', ticket.id);

    if (error) {
      toast.error('Failed to update ticket');
      console.error(error);
    } else {
      toast.success('Ticket updated');
      onSave(ticket.id, updates);
    }
    setSaving(false);
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    setChecklist(prev => [
      ...prev,
      { id: crypto.randomUUID(), text: newChecklistItem.trim(), done: false },
    ]);
    setNewChecklistItem('');
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const removeChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const assignedUser = users.find(u => u.nr_auth_user_id === assignedTo);
  const currentPriority = PRIORITY_OPTIONS.find(p => p.value === priority);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel - slides in from right */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[540px] bg-[#1e1e1e] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">

        {/* ─── HEADER ─── */}
        <div className="px-6 pt-5 pb-4 border-b border-[#333] flex items-start gap-3">
          {/* Title area */}
          <div className="flex-1 min-w-0">
            {/* Category label */}
            <p className="text-xs font-semibold text-blue-400 mb-1 tracking-wide uppercase">
              {ticket.department || 'Ticket'}
            </p>

            {/* Editable title */}
            <div className="flex items-start gap-2">
              <Circle size={20} className="text-[#555] mt-1 shrink-0" />
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="flex-1 bg-transparent text-white text-lg font-semibold outline-none border-b border-transparent focus:border-blue-500 transition-colors pb-0.5"
                placeholder="Task name"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button className="p-1.5 rounded hover:bg-[#333] text-[#999] transition-colors" title="More options">
              <MoreHorizontal size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-[#333] text-[#999] transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── SCROLLABLE BODY ─── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ASSIGN */}
          <div className="flex items-center gap-3">
            <UserPlus size={18} className="text-[#888]" />
            <select
              value={assignedTo ?? ''}
              onChange={e => setAssignedTo(e.target.value || null)}
              className="bg-[#2d2d2d] text-white text-sm rounded-md px-3 py-2 border border-[#444] focus:border-blue-500 outline-none flex-1 transition-colors"
            >
              <option value="">Assign</option>
              {users.map(u => (
                <option key={u.nr_auth_user_id} value={u.nr_auth_user_id}>
                  {u.nr_name}
                </option>
              ))}
            </select>
          </div>

          {/* LABELS / TAGS */}
          {labels.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#888] text-xs mr-1">🏷️</span>
              {labels.map((label, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: label.color }}
                >
                  {label.text}
                  <X size={12} className="opacity-70 cursor-pointer hover:opacity-100" />
                </span>
              ))}
            </div>
          )}

          {/* ─── FIELDS GRID ─── */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">

            {/* Bucket / Status */}
            <div>
              <label className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1.5 block">
                Bucket
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TicketStatus)}
                className="w-full bg-[#2d2d2d] text-white text-sm rounded-md px-3 py-2 border border-[#444] focus:border-blue-500 outline-none transition-colors"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Progress */}
            <div>
              <label className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1.5 block">
                Progress
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TicketStatus)}
                className="w-full bg-[#2d2d2d] text-white text-sm rounded-md px-3 py-2 border border-[#444] focus:border-blue-500 outline-none transition-colors"
              >
                <option value={TicketStatus.TODO}>Not started</option>
                <option value={TicketStatus.ACKNOWLEDGED}>Acknowledged</option>
                <option value={TicketStatus.IN_REVIEW}>In progress</option>
                <option value={TicketStatus.DONE}>Completed</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1.5 block">
                Priority
              </label>
              <div className="relative">
                <span
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${currentPriority?.dot}`}
                />
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                  className="w-full bg-[#2d2d2d] text-white text-sm rounded-md pl-7 pr-3 py-2 border border-[#444] focus:border-blue-500 outline-none transition-colors"
                >
                  {PRIORITY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Empty cell for alignment */}
            <div />
          </div>

          {/* ─── DATES ROW ─── */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* Start date */}
            <div>
              <label className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1.5 block">
                Start date
              </label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-[#2d2d2d] text-white text-sm rounded-md pl-8 pr-3 py-2 border border-[#444] focus:border-blue-500 outline-none transition-colors"
                  placeholder="Start anytime"
                />
              </div>
            </div>

            {/* Due date */}
            <div>
              <label className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1.5 block">
                Due date
              </label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full bg-[#2d2d2d] text-white text-sm rounded-md pl-8 pr-3 py-2 border border-[#444] focus:border-blue-500 outline-none transition-colors"
                  placeholder="Due anytime"
                />
              </div>
            </div>
          </div>

          {/* Repeat */}
          <div className="grid grid-cols-2 gap-x-6">
            <div>
              <label className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1.5 block">
                Repeat
              </label>
              <div className="relative">
                <RefreshCw size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
                <select
                  value={repeatOption}
                  onChange={e => setRepeatOption(e.target.value)}
                  className="w-full bg-[#2d2d2d] text-white text-sm rounded-md pl-8 pr-3 py-2 border border-[#444] focus:border-blue-500 outline-none transition-colors"
                >
                  <option value="none">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            {/* Show on card */}
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showOnCard}
                  onChange={e => setShowOnCard(e.target.checked)}
                  className="w-4 h-4 rounded border-[#444] bg-[#2d2d2d] text-blue-500 focus:ring-blue-500 focus:ring-offset-0 accent-blue-500"
                />
                <span className="text-sm text-[#ccc]">Show on card</span>
              </label>
            </div>
          </div>

          {/* ─── NOTES / DESCRIPTION ─── */}
          <div>
            <label className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1.5 block">
              Notes
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={5}
              placeholder="Type a description or add notes here"
              className="w-full bg-[#2d2d2d] text-white text-sm rounded-md px-3 py-2.5 border border-[#444] focus:border-blue-500 outline-none resize-none transition-colors placeholder:text-[#666]"
            />
          </div>

          {/* ─── CHECKLIST ─── */}
          <div>
            <label className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-2 block">
              Checklist
            </label>

            {/* Existing items */}
            <div className="space-y-1.5 mb-3">
              {checklist.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 group"
                >
                  <button
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      item.done
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-[#555] hover:border-[#888]'
                    }`}
                  >
                    {item.done && <Check size={12} className="text-white" />}
                  </button>
                  <span
                    className={`text-sm flex-1 ${
                      item.done ? 'line-through text-[#666]' : 'text-[#ddd]'
                    }`}
                  >
                    {item.text}
                  </span>
                  <button
                    onClick={() => removeChecklistItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-[#666] hover:text-red-400 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new item */}
            <div className="flex items-center gap-2">
              <Circle size={16} className="text-[#555] shrink-0" />
              <input
                value={newChecklistItem}
                onChange={e => setNewChecklistItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addChecklistItem()}
                placeholder="Add an item"
                className="flex-1 bg-transparent text-sm text-[#ccc] outline-none border-b border-transparent focus:border-[#555] pb-0.5 transition-colors placeholder:text-[#555]"
              />
              {newChecklistItem && (
                <button
                  onClick={addChecklistItem}
                  className="p-1 rounded hover:bg-[#333] text-blue-400"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>
          </div>

          {/* ─── METADATA (read-only) ─── */}
          <div className="border-t border-[#333] pt-4 space-y-2">
            <p className="text-xs text-[#666]">
              <span className="text-[#888]">Created by:</span>{' '}
              {ticket.created_by_name ?? 'Unknown'}{' '}
              <span className="text-[#555]">({ticket.created_by_email})</span>
            </p>
            <p className="text-xs text-[#666]">
              <span className="text-[#888]">Created:</span>{' '}
              {ticket.created_at
                ? new Date(ticket.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : '—'}
            </p>
            <p className="text-xs text-[#666]">
              <span className="text-[#888]">Ticket ID:</span>{' '}
              #{ticket.id.slice(0, 8)}
            </p>
          </div>
        </div>

        {/* ─── FOOTER ─── */}
        <div className="px-6 py-4 border-t border-[#333] flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md text-[#ccc] hover:bg-[#333] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/20"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  );
};

export default TicketDetailModal;
