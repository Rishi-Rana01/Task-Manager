import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination — renders page navigation controls.
 *
 * Props:
 *   currentPage   {number}
 *   totalPages    {number}
 *   onGoTo        {(page: number) => void}
 *   onNext        {() => void}
 *   onPrev        {() => void}
 *   totalItems    {number}
 *   itemsPerPage  {number}
 */
export default function Pagination({
  currentPage,
  totalPages,
  onGoTo,
  onNext,
  onPrev,
  totalItems,
  itemsPerPage,
}) {
  if (totalPages <= 1) return null;

  // Build visible page numbers with ellipsis
  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end   = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const firstItem = (currentPage - 1) * itemsPerPage + 1;
  const lastItem  = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-5 border-t border-slate-200 dark:border-slate-700">
      {/* Range label */}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Showing{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-200">{firstItem}–{lastItem}</span>{' '}
        of{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-200">{totalItems}</span>{' '}
        tasks
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {getPages().map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 text-sm select-none">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onGoTo(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                page === currentPage
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
