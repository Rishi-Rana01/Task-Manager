import { CheckCircle2, Circle, Edit2, Trash2, Calendar } from 'lucide-react';

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const isCompleted = task.status === 'completed';

  return (
    <div className={`group bg-white border rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-0.5 ${
      isCompleted ? 'border-slate-100 bg-slate-50/50' : 'border-slate-200/80'
    }`}>
      <div className="flex items-start gap-4">
        {/* Toggle Status Interactive Circle Checkbox */}
        <button 
          onClick={() => onToggle(task)}
          className={`mt-1 shrink-0 transition-colors duration-200 cursor-pointer ${
            isCompleted ? 'text-blue-500 hover:text-blue-600' : 'text-slate-300 hover:text-blue-500'
          }`}
        >
          {isCompleted ? <CheckCircle2 size={20} className="fill-blue-50" /> : <Circle size={20} />}
        </button>

        {/* Task Content Fields */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold tracking-tight truncate transition-all ${
            isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'
          }`}>
            {task.title}
          </h3>
          <p className={`text-xs mt-1.5 leading-relaxed wrap-break-word ${
            isCompleted ? 'text-slate-400/80' : 'text-slate-500'
          }`}>
            {task.description || <span className="italic text-slate-300">No descriptive brief provided.</span>}
          </p>

          {/* Metadata Row Footer */}
          <div className="flex items-center gap-3 mt-4 text-[10px] font-medium tracking-wide uppercase">
            <span className={`px-2 py-0.5 rounded-full ${
              isCompleted ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-600'
            }`}>
              {task.status}
            </span>
            <span className="flex items-center gap-1 text-slate-400 normal-case font-normal">
              <Calendar size={12} />
              {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Hover-Triggered Action Control Column */}
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            onClick={() => onEdit(task)}
            className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Edit Task"
          >
            <Edit2 size={15} />
          </button>
          <button 
            onClick={() => onDelete(task._id)}
            className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
            title="Delete Task"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}