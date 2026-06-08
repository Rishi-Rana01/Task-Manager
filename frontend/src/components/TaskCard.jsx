import { memo } from 'react';
import { CheckCircle2, Circle, Edit2, Trash2, Calendar, Flag, AlertTriangle } from 'lucide-react';

const PRIORITY_CONFIG = {
  high:   { label: 'High',   bg: 'bg-red-50 dark:bg-red-900/20',    text: 'text-red-600 dark:text-red-400',    dot: 'bg-red-500'   },
  medium: { label: 'Medium', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  low:    { label: 'Low',    bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', dot: 'bg-green-500'  },
};

function getDueDateInfo(dueDate) {
  if (!dueDate) return null;
  const now    = Date.now();
  const due    = new Date(dueDate).getTime();
  const diffMs = due - now;
  const diffH  = diffMs / (1000 * 60 * 60);

  if (diffMs < 0)       return { label: 'Overdue',        urgent: 'overdue' };
  if (diffH <= 24)      return { label: `${Math.ceil(diffH)}h left`,    urgent: 'critical' };
  if (diffH <= 72)      return { label: `${Math.ceil(diffH / 24)}d left`, urgent: 'warning' };
  return { label: new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), urgent: 'normal' };
}

const DUE_COLOR = {
  overdue:  'text-red-500 dark:text-red-400',
  critical: 'text-orange-500 dark:text-orange-400',
  warning:  'text-amber-500 dark:text-amber-400',
  normal:   'text-slate-400 dark:text-slate-500',
};

/**
 * TaskCard — displays a single task with priority badge, due date countdown,
 * bulk selection checkbox, hover actions, and completion animation.
 *
 * Props:
 *   task        {object}
 *   onToggle    {(task) => void}
 *   onEdit      {(task) => void}
 *   onDelete    {(id) => void}
 *   isSelected  {boolean}
 *   onSelect    {(id) => void}
 *   selectionMode {boolean}
 */
const TaskCard = memo(function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  isSelected = false,
  onSelect,
  selectionMode = false,
}) {
  const isCompleted = task.status === 'completed';
  const priority    = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const dueDateInfo = getDueDateInfo(task.dueDate);

  return (
    <div
      className={`group relative bg-white dark:bg-slate-800 border rounded-2xl p-5 transition-all duration-200
        hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/40 hover:-translate-y-1
        animate-card-in
        ${isCompleted
          ? 'border-slate-100 dark:border-slate-700/50 bg-slate-50/60 dark:bg-slate-800/50'
          : 'border-slate-200/80 dark:border-slate-700'
        }
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900' : ''}
      `}
    >
      {/* Selection checkbox — visible in selection mode or on hover */}
      {(selectionMode || isSelected) && (
        <button
          onClick={() => onSelect?.(task._id)}
          className="absolute top-3 right-3 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer z-10
            ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400'}"
          aria-label="Select task"
        >
          {isSelected && <span className="text-white text-[10px] font-bold">✓</span>}
        </button>
      )}

      <div className="flex items-start gap-4">
        {/* Toggle Status Button */}
        <button
          onClick={() => onToggle(task)}
          className={`mt-0.5 shrink-0 transition-all duration-200 cursor-pointer ${
            isCompleted ? 'text-blue-500 hover:text-blue-600' : 'text-slate-300 dark:text-slate-600 hover:text-blue-500'
          }`}
          aria-label={isCompleted ? 'Mark as pending' : 'Mark as complete'}
        >
          {isCompleted
            ? <CheckCircle2 size={20} className="fill-blue-50 dark:fill-blue-900/30" />
            : <Circle size={20} />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold tracking-tight truncate transition-all duration-300 ${
            isCompleted
              ? 'text-slate-400 dark:text-slate-500 task-complete-title'
              : 'text-slate-800 dark:text-slate-100'
          }`}>
            {task.title}
          </h3>

          {task.description && (
            <p className={`text-xs mt-1.5 leading-relaxed line-clamp-2 ${
              isCompleted ? 'text-slate-400/80 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'
            }`}>
              {task.description}
            </p>
          )}

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 mt-3.5">
            {/* Priority badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${priority.bg} ${priority.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
              {priority.label}
            </span>

            {/* Status badge */}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
              isCompleted
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
            }`}>
              {task.status}
            </span>

            {/* Due date */}
            {dueDateInfo && (
              <span className={`flex items-center gap-1 text-[10px] font-medium ${DUE_COLOR[dueDateInfo.urgent]}`}>
                {dueDateInfo.urgent === 'overdue'
                  ? <AlertTriangle size={10} />
                  : <Calendar size={10} />
                }
                {dueDateInfo.label}
              </span>
            )}

            {/* Created date (no dueDate) */}
            {!dueDateInfo && (
              <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-600">
                <Calendar size={10} />
                {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* Hover action buttons */}
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Edit task"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
            title="Delete task"
          >
            <Trash2 size={14} />
          </button>
          {!selectionMode && (
            <button
              onClick={() => onSelect?.(task._id)}
              className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer"
              title="Select task"
            >
              <Flag size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default TaskCard;