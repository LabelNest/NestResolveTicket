import React, { useState, useEffect } from 'react';
import {
  X,
  MoreHorizontal,
  UserPlus,
  Calendar,
  Plus,
  Check,
  Trash2,
  Circle,
  MessageSquare,
  AlertCircle,
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
  isAdmin?: boolean;
}

interface TicketComment {
  id: number;
  ticket_id: string;
  comment: string;
  created_by: string;
  created_at: string;
  user?: {
    nr_name: string;
  };
}

// --- Priority config with colors ---
const PRIORITY_OPTIONS: { value: Priority; label: string; color: string; dot: string }[] = [
  { value: Priority.CRITICAL, label: 'Urgent', color: '#dc2626', dot: 'bg-red-500' },
  { value: Priority.HIGH, label: 'Important', color: '#f97316', dot: 'bg-orange-400' },
  { value: Priority.MEDIUM, label: 'Medium', color: '#22c55e', dot: 'bg-green-500' },
  { value: Priority.LOW, label: 'Low', color: '#64748b', dot: 'bg-slate-400' },
];

// Ticket type options for admin editing
const TICKET_TYPE_OPTIONS = [
  { value: 'data_issue', label: 'Data / Dataset Issue' },
  { value: 'qa_issue', label: 'QA Issue' },
  { value: 'hr_issue', label: 'HR Issue' },
  { value: 'admin_issue', label: 'Admin / Ops Issue' },
  { value: 'asset_issue', label: 'Asset / Infra Issue' },
  { value: 'platform_issue', label: 'Platform / Login Issue' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'feedback', label: 'General Feedback' },
];

const DEPARTMENT_OPTIONS = [
  'Data Engineering', 'QA/QC', 'HR Ops', 'Operations',
  'IT / Infra', 'Product Support', 'Product Roadmap', 'Growth/Product'
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
  nr_email: string;
};

// --- Component ---

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onSave,
  isExternal = false,
  isAdmin = false,
}) => {

  // Editable state
  const [title, setTitle] = useState(ticket.title);
  const [description, setDescription] = useState(ticket.description ?? '');
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [assignedTo, setAssignedTo] = useState<string | null>(ticket.assigned_to);
  const [department, setDepartment] = useState(ticket.department ?? '');
  const [ticketType, setTicketType] = useState(ticket.type ?? '');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [users, setUsers] = useState<NrUser[]>([]);
  const [saving, setSaving] = useState(false);
  const [priority, setPriority] = useState<Priority>(ticket.priority || Priority.MEDIUM);

  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const isReadOnly = !isAdmin;
  const isCreator = currentUserId === ticket.created_by;
  const canComment = isAdmin || isCreator;

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
        .select('nr_auth_user_id, nr_name, nr_email')
        .eq('nr_status', 'active');
      setUsers(data || []);
    };
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    loadUsers();
    fetchUser();
  }, []);

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      setLoadingComments(true);
      const { data, error } = await supabase
        .from('nr_ticket_comments')
        .select(`
          id,
          ticket_id,
          comment,
          created_by,
          created_at,
          user:nr_users!created_by ( nr_name )
        `)
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true });
      if (!error && data) {
        setComments(data as unknown as TicketComment[]);
      }
      setLoadingComments(false);
    };
    if (isOpen && ticket?.id) {
      loadComments();
    }
  }, [ticket.id, isOpen]);

  // Reset state when ticket changes
  useEffect(() => {
    setTitle(ticket.title);
    setDescription(ticket.description ?? '');
    setStatus(ticket.status);
    setPriority(ticket.priority || Priority.MEDIUM);
    setAssignedTo(ticket.assigned_to);
    setDepartment(ticket.department ?? '');
    setTicketType(ticket.type ?? '');
    setChecklist([]);
    setStartDate('');
    setDueDate('');
  }, [ticket.id]);

  // --- Handlers ---

  const handleSave = async () => {
    setSaving(true);
    const table = isExternal ? 'nr_resolve_tickets' : 'nr_tickets_internal';

    // Non-admin users can only update priority
    let updates: Partial<Ticket> = { priority };

    if (isAdmin) {
      updates = {
        ...updates,
        title,
        description,
        status,
        assigned_to: assignedTo,
        department: department || null,
        type: ticketType || null,
      };
    }

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

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be logged in to comment');
      console.error('handlePostComment: No authenticated user found');
      return;
    }

    const commentData = {
      ticket_id: ticket.id,
      comment: newComment.trim(),
      created_by: user.id,
    };

    console.log('Posting comment with data:', commentData);

    // Step 1: Insert the comment (without join in select)
    const { data, error } = await supabase
      .from('nr_ticket_comments')
      .insert([commentData])
      .select('id, ticket_id, comment, created_by, created_at')
      .single();

    if (error) {
      toast.error('Failed to post comment');
      console.error('Insert comment error:', error.message, error.details, error.hint, error.code);
      return;
    }

    if (data) {
      // Step 2: Fetch the user's name for display
      const { data: userData } = await supabase
        .from('nr_users')
        .select('nr_name')
        .eq('nr_auth_user_id', user.id)
        .single();

      const newCommentObj: TicketComment = {
        id: data.id,
        ticket_id: data.ticket_id,
        comment: data.comment,
        created_by: data.created_by,
        created_at: data.created_at,
        user: userData ? { nr_name: userData.nr_name } : undefined,
      };

      setComments(prev => [...prev, newCommentObj]);
      setNewComment('');
      toast.success('Comment posted');
    }
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
            {/* Category label + badge */}
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-semibold text-blue-400 tracking-wide uppercase">
                {ticket.department || 'Ticket'}
              </p>
              {isAdmin ? (
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Admin Editing
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  View Ticket
                </span>
              )}
            </div>

            {/* Editable title */}
            <div className="flex items-start gap-2">
              <Circle size={20} className="text-[#555] mt-1 shrink-0" />
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={isReadOnly}
                className="flex-1 bg-transparent text-white text-lg font-semibold outline-none border-b border-transparent focus:border-blue-500 transition-colors pb-0.5 disabled:opacity-80 disabled:cursor-not-allowed"
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
              disabled={isReadOnly}
              className="bg-[#2d2d2d] text-white text-sm rounded-md px-3 py-2 border border-[#444] focus:border-blue-500 outline-none flex-1 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <option value="">Assign</option>
              {users.map(u => (
                <option key={u.nr_auth_user_id} value={u.nr_auth_user_id}>
                  {u.nr_name} {u.nr_email ? `(${u.nr_email})` : ''}
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
                </span>
              ))}
            </div>
          )}

          {/* ─── FIELDS GRID ─── */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* Status — admin only */}
            {isAdmin && (
              <div>
                <label className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1.5 block">
                  Status
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
            )}

            {/* Status — read-only for users */}
            {!isAdmin && (
              <div>
                <label className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1.5 block">
                  Status
                </label>
                <div className="w-full bg-[#2d2d2d] text-white text-sm rounded-md px-3 py-2 border border-[#444] opacity-80">
                  {STATUS_OPTIONS.find(s => s.value === status)?.label || status}
                </div>
              </div>
            )}

            {/* Priority — editable by everyone */}
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
          </div>

          {/* ─── ADMIN EXTRA FIELDS ─── */}
          {isAdmin && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 border border-amber-500/20 rounded-lg p-4 bg-amber-500/5">
              <p className="col-span-2 text-[10px] font-bold uppercase tracking-widest text-amber-500/70 mb-1">Admin-only Fields</p>

              {/* Department */}
              <div>
                <label className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1.5 block">
                  Department
                </label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full bg-[#2d2d2d] text-white text-sm rounded-md px-3 py-2 border border-[#444] focus:border-amber-400 outline-none transition-colors"
                >
                  <option value="">— None —</option>
                  {DEPARTMENT_OPTIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Ticket Type */}
              <div>
                <label className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1.5 block">
                  Ticket Type
                </label>
                <select
                  value={ticketType}
                  onChange={e => setTicketType(e.target.value)}
                  className="w-full bg-[#2d2d2d] text-white text-sm rounded-md px-3 py-2 border border-[#444] focus:border-amber-400 outline-none transition-colors"
                >
                  <option value="">— None —</option>
                  {TICKET_TYPE_OPTIONS.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ─── DATES ROW — admin only ─── */}
          {isAdmin && (
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
          )}

          {/* ─── NOTES / DESCRIPTION ─── */}
            <div>
              <label className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1.5 block">
                Description
              </label>
            
              <p className="text-sm text-[#bbb] bg-[#252525] rounded-md px-3 py-2.5 border border-[#333] min-h-[80px] whitespace-pre-wrap">
                {description || (
                  <span className="italic text-[#555]">
                    No description provided.
                  </span>
                )}
              </p>
            </div>

          {/* ─── CHECKLIST — admin only ─── */}
          {isAdmin && (
            <div>
              <label className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-2 block">
                Checklist
              </label>

              {/* Existing items */}
              <div className="space-y-1.5 mb-3">
                {checklist.map(item => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <button
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        item.done ? 'bg-blue-500 border-blue-500' : 'border-[#555] hover:border-[#888]'
                      }`}
                    >
                      {item.done && <Check size={12} className="text-white" />}
                    </button>
                    <span className={`text-sm flex-1 ${item.done ? 'line-through text-[#666]' : 'text-[#ddd]'}`}>
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
                  <button onClick={addChecklistItem} className="p-1 rounded hover:bg-[#333] text-blue-400">
                    <Plus size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ─── COMMENTS SECTION ─── */}
          <div className="border-t border-[#333] pt-5 mt-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare size={16} className="text-[#888]" />
              Comments
            </h3>

            {/* Comment List */}
            <div className="space-y-4 mb-4">
              {loadingComments ? (
                <p className="text-xs text-[#666]">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-xs text-[#666] italic">No comments yet. Be the first to start the conversation.</p>
              ) : (
                comments.map((cm) => {
                  const commenterName = cm.user?.nr_name || 'Unknown';
                  return (
                  <div key={cm.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                      <span className="text-xs font-bold text-blue-400">
                        {commenterName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 bg-[#252525] rounded-lg p-3 border border-[#333]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-[#ddd]">{commenterName}</span>
                        <span className="text-[10px] text-[#666]">
                          {new Date(cm.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-[#bbb] whitespace-pre-wrap">{cm.comment}</p>
                    </div>
                  </div>
                  );
                })
              )}
            </div>

            {/* Post Comment Input */}
            {canComment ? (
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center shrink-0">
                  <UserPlus size={14} className="text-[#888]" />
                </div>
                <div className="flex-1 relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full bg-[#252525] text-white text-sm rounded-lg px-3 py-2.5 border border-[#444] focus:border-blue-500 outline-none resize-none transition-colors min-h-[80px]"
                  />
                  <button
                    onClick={handlePostComment}
                    disabled={!newComment.trim()}
                    className="mt-2 px-4 py-1.5 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed float-right"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#2a2a2a] border border-[#333] rounded-lg p-4 flex items-center gap-3">
                <AlertCircle size={18} className="text-orange-500 shrink-0" />
                <p className="text-xs text-[#999]">
                  Only the creator of this ticket or admins can post comments.
                </p>
              </div>
            )}
          </div>

          {/* ─── METADATA (read-only) ─── */}
          <div className="border-t border-[#333] pt-6 mt-6 space-y-2">
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
          {(isAdmin || priority !== ticket.priority) && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/20"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </>
  );
};


export default TicketDetailModal;
