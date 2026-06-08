import { memo } from 'react';
import { CheckCircle2, Circle, Edit2, Trash2, Calendar, Flag, AlertTriangle } from 'lucide-react';

const PRIORITY = {
  high:   { label: 'High',   cardClass: 'task-card-high',   badge: 'bg-red-500/10 dark:bg-red-400/10 text-red-600 dark:text-red-400',   dot: 'bg-red-500'   },
  medium: { label: 'Medium', cardClass: 'task-card-medium', badge: 'bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  low:    { label: 'Low',    cardClass: 'task-card-low',    badge: 'bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
};

function getDueDateInfo(dueDate) {
  if (!dueDate) return null;
  const diffMs = new Date(dueDate).getTime() - Date.now();
  const diffH  = diffMs / 3600000;
  if (diffMs < 0)   return { label: 'Overdue',                             urgency: 'overdue'  };
  if (diffH <= 24)  return { label: `${Math.ceil(diffH)}h left`,           urgency: 'critical' };
  if (diffH <= 72)  return { label: `${Math.ceil(diffH / 24)}d left`,      urgency: 'warning'  };
  return               { label: new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), urgency: 'normal' };
}

const DUE_CLASSES = {
  overdue:  'text-red-500 dark:text-red-400 font-bold',
  critical: 'text-orange-500 dark:text-orange-400 font-semibold',
  warning:  'text-amber-500 dark:text-amber-400',
  normal:   'text-slate-400 dark:text-slate-500',
};

const TaskCard = memo(function TaskCard({ task, onToggle, onEdit, onDelete, isSelected, onSelect, selectionMode }) {
  const isCompleted = task.status === 'completed';
  const p           = PRIORITY[task.priority] || PRIORITY.medium;
  const dueInfo     = getDueDateInfo(task.dueDate);

  return (
    <div
      className={`group task-card ${p.cardClass} animate-card-in rounded-2xl p-5 overflow-hidden
        ${isCompleted ? 'opacity-70' : ''}
        ${isSelected ? 'ring-2 ring-offset-1 dark:ring-offset-slate-900' : ''}
      `}
      style={isSelected ? { '--tw-ring-color': 'var(--accent)' } : {}}
    >
      {/* Selection checkbox */}
      {(selectionMode || isSelected) && (
        <button
          onClick={() => onSelect?.(task._id)}
          aria-label="Select task"
          className="absolute top-3.5 right-3.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer z-10"
          style={{
            borderColor: isSelected ? 'var(--accent)' : 'var(--border-strong)',
            background:  isSelected ? 'var(--accent)' : 'transparent',
          }}
        >
          {isSelected && <span className="text-white text-[10px] font-bold">✓</span>}
        </button>
      )}

      <div className="flex items-start gap-3.5">
        {/* Complete toggle */}
        <button
          onClick={() => onToggle(task)}
          aria-label={isCompleted ? 'Mark pending' : 'Mark complete'}
          className="mt-0.5 shrink-0 cursor-pointer transition-all duration-200"
          style={{ color: isCompleted ? 'var(--accent)' : 'var(--border-strong)' }}
        >
          {isCompleted
            ? <CheckCircle2 size={19} />
            : <Circle size={19} className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors" />}
        </button>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className={`text-sm font-semibold tracking-tight leading-snug transition-all duration-300 ${
            isCompleted
              ? 'task-complete-title text-slate-400 dark:text-slate-500'
              : 'text-slate-800 dark:text-slate-100'
          }`}>
            {task.title}
          </h3>

          {task.description && (
            <p className="text-xs mt-1 leading-relaxed line-clamp-2 text-slate-500 dark:text-slate-400">
              {task.description}
            </p>
          )}

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${p.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
              {p.label}
            </span>

            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
              isCompleted
                ? 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500'
                : 'text-indigo-600 dark:text-indigo-400'
            }`}
            style={!isCompleted ? { background: 'rgba(99,102,241,0.08)' } : {}}>
              {task.status}
            </span>

            {dueInfo && (
              <span className={`flex items-center gap-1 text-[10px] font-mono ${DUE_CLASSES[dueInfo.urgency]} ${dueInfo.urgency === 'overdue' ? 'neon-pulse px-1.5 py-0.5 rounded-full bg-red-500/10' : ''}`}>
                {dueInfo.urgency === 'overdue' ? <AlertTriangle size={9} /> : <Calendar size={9} />}
                {dueInfo.label}
              </span>
            )}

            {!dueInfo && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 dark:text-slate-600">
                <Calendar size={9} />
                {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* Hover actions */}
        <div className="flex flex-col gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 shrink-0">
          <button
            onClick={() => onEdit(task)}
            title="Edit"
            className="p-1.5 rounded-lg transition-all cursor-pointer text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/8"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            title="Delete"
            className="p-1.5 rounded-lg transition-all cursor-pointer text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/8"
          >
            <Trash2 size={13} />
          </button>
          {!selectionMode && (
            <button
              onClick={() => onSelect?.(task._id)}
              title="Select"
              className="p-1.5 rounded-lg transition-all cursor-pointer text-slate-400 dark:text-slate-500 hover:text-indigo-500 hover:bg-indigo-500/8"
            >
              <Flag size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default TaskCard;