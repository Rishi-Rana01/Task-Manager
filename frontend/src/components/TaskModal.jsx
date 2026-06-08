import { useState, useEffect } from 'react';
import { X, Flag, Calendar, Zap } from 'lucide-react';

const PRIORITY_OPTS = [
  { value: 'low',    label: '🟢 Low',    desc: 'Nice to have'    },
  { value: 'medium', label: '🟡 Medium', desc: 'Should be done'  },
  { value: 'high',   label: '🔴 High',   desc: 'Urgent / blocker' },
];

const PRIORITY_STYLE = {
  low:    { text: 'text-emerald-600 dark:text-emerald-400', bg: 'rgba(16,185,129,0.08)', ring: 'rgba(16,185,129,0.3)' },
  medium: { text: 'text-amber-600 dark:text-amber-400',     bg: 'rgba(245,158,11,0.08)', ring: 'rgba(245,158,11,0.3)' },
  high:   { text: 'text-red-600 dark:text-red-400',         bg: 'rgba(239,68,68,0.08)',  ring: 'rgba(239,68,68,0.3)' },
};

export default function TaskModal({ isOpen, onClose, onSubmit, editingTask }) {
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [priority,    setPriority]    = useState('medium');
  const [dueDate,     setDueDate]     = useState('');

  useEffect(() => {
    if (editingTask) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority || 'medium');
      setDueDate(editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    }
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description: description.trim(), priority, dueDate: dueDate || null });
    onClose();
  };

  const today = new Date().toISOString().split('T')[0];
  const ps    = PRIORITY_STYLE[priority];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ background: 'rgba(7,11,20,0.6)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl animate-fade-in overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-strong)' }}
      >
        {/* Gradient header strip */}
        <div className="px-6 pt-6 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl btn-primary flex items-center justify-center text-white">
                <Zap size={15} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">
                  {editingTask ? 'Edit Task' : 'New Task'}
                </h2>
                <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                  {editingTask ? `#${editingTask._id?.slice(-6)}` : 'Create a new entry'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl cursor-pointer text-slate-400 transition-all hover:text-slate-700 dark:hover:text-slate-200"
              style={{ background: 'var(--surface-2)' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium placeholder-slate-400 focus:outline-none transition-all"
              style={{
                background: 'var(--surface-2)',
                border: '1.5px solid var(--border)',
                color: 'var(--text)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Description
            </label>
            <textarea
              rows="3"
              placeholder="Optional context or notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm placeholder-slate-400 focus:outline-none transition-all resize-none"
              style={{
                background: 'var(--surface-2)',
                border: '1.5px solid var(--border)',
                color: 'var(--text)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Priority + Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
                <Flag size={10} /> Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm font-medium focus:outline-none cursor-pointer transition-all"
                style={{
                  background: 'var(--surface-2)',
                  border: '1.5px solid var(--border)',
                  color: 'var(--text)',
                }}
              >
                {PRIORITY_OPTS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
                <Calendar size={10} /> Due Date
              </label>
              <input
                type="date"
                min={today}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none cursor-pointer transition-all"
                style={{
                  background: 'var(--surface-2)',
                  border: '1.5px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>
          </div>

          {/* Live priority preview */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: ps.bg, border: `1px solid ${ps.ring}` }}
          >
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Priority preview:</span>
            <span className={`text-xs font-bold ${ps.text}`}>
              {PRIORITY_OPTS.find(o => o.value === priority)?.label}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">—</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {PRIORITY_OPTS.find(o => o.value === priority)?.desc}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-xl cursor-pointer transition-all"
              style={{
                color: 'var(--text-muted)',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 text-sm font-bold text-white rounded-xl shadow-lg shadow-indigo-500/25 cursor-pointer transition-all active:scale-[0.97]"
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}