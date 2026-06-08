import { Trash2, CheckCheck, Flag, X } from 'lucide-react';

/**
 * BulkActionsBar — floating action bar shown when tasks are selected.
 *
 * Props:
 *   selectedCount  {number}
 *   onClearSelect  {() => void}
 *   onBulkDelete   {() => void}
 *   onBulkComplete {() => void}
 *   onBulkPriority {(priority: string) => void}
 */
export default function BulkActionsBar({
  selectedCount,
  onClearSelect,
  onBulkDelete,
  onBulkComplete,
  onBulkPriority,
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="flex items-center gap-3 bg-slate-900 dark:bg-slate-800 text-white px-5 py-3 rounded-2xl shadow-2xl shadow-slate-900/40 border border-slate-700">
        {/* Selection count */}
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
          <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
            {selectedCount}
          </span>
          <span className="text-sm font-medium text-slate-300">selected</span>
        </div>

        {/* Mark complete */}
        <button
          onClick={onBulkComplete}
          title="Mark all complete"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-400/10 transition-colors cursor-pointer"
        >
          <CheckCheck size={15} />
          Complete
        </button>

        {/* Priority change */}
        <div className="relative group">
          <button
            title="Change priority"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-400 hover:bg-amber-400/10 transition-colors cursor-pointer"
          >
            <Flag size={15} />
            Priority
          </button>
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl min-w-[110px]">
            {['high', 'medium', 'low'].map(p => (
              <button
                key={p}
                onClick={() => onBulkPriority(p)}
                className="px-4 py-2 text-xs font-medium capitalize text-left hover:bg-slate-700 transition-colors cursor-pointer text-slate-300"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={onBulkDelete}
          title="Delete selected"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
        >
          <Trash2 size={15} />
          Delete
        </button>

        {/* Clear selection */}
        <button
          onClick={onClearSelect}
          title="Clear selection"
          className="ml-1 p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
