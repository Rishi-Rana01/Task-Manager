import { Trash2, CheckCheck, Flag, X } from 'lucide-react';

export default function BulkActionsBar({ selectedCount, onClearSelect, onBulkDelete, onBulkComplete, onBulkPriority }) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div
        className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-2xl w-[92vw] sm:w-auto"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-strong)',
          boxShadow: '0 8px 40px rgba(99,102,241,0.2), 0 0 0 1px var(--border-strong)',
        }}
      >
        <div className="flex items-center gap-2 pr-3" style={{ borderRight: '1px solid var(--border)' }}>
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {selectedCount}
          </div>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>selected</span>
        </div>

        <button
          onClick={onBulkComplete}
          title="Mark all complete"
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all text-emerald-500 dark:text-emerald-400 hover:bg-emerald-500/10"
        >
          <CheckCheck size={14} />
          <span className="hidden sm:inline">Complete</span>
        </button>

        <div className="relative group">
          <button
            title="Change priority"
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all text-amber-500 dark:text-amber-400 hover:bg-amber-500/10"
          >
            <Flag size={14} />
            <span className="hidden sm:inline">Priority</span>
          </button>
          <div
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col rounded-xl overflow-hidden shadow-2xl min-w-[110px]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-strong)' }}
          >
            {['high', 'medium', 'low'].map(p => (
              <button
                key={p}
                onClick={() => onBulkPriority(p)}
                className="px-4 py-2 text-xs font-semibold capitalize text-left cursor-pointer transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {p === 'high' ? '🔴' : p === 'medium' ? '🟡' : '🟢'} {p}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onBulkDelete}
          title="Delete selected"
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all text-red-500 dark:text-red-400 hover:bg-red-500/10"
        >
          <Trash2 size={14} />
          <span className="hidden sm:inline">Delete</span>
        </button>

        <button
          onClick={onClearSelect}
          title="Clear selection"
          className="ml-1 p-1.5 rounded-lg cursor-pointer transition-all"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
