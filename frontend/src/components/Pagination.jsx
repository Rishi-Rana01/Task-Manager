import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onGoTo, onNext, onPrev, totalItems, itemsPerPage }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const first = (currentPage - 1) * itemsPerPage + 1;
  const last  = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
      <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
        <span className="font-semibold" style={{ color: 'var(--text)' }}>{first}–{last}</span>
        {' '}of{' '}
        <span className="font-semibold" style={{ color: 'var(--text)' }}>{totalItems}</span>
        {' '}tasks
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="p-2 rounded-xl transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.background = 'var(--surface-2)')}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <ChevronLeft size={15} />
        </button>

        {getPages().map((page, idx) =>
          page === '...' ? (
            <span key={`e-${idx}`} className="w-9 text-center text-sm select-none" style={{ color: 'var(--text-muted)' }}>…</span>
          ) : (
            <button
              key={page}
              onClick={() => onGoTo(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              className="w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer"
              style={page === currentPage
                ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' }
                : { color: 'var(--text-muted)' }
              }
              onMouseEnter={e => page !== currentPage && (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={e => page !== currentPage && (e.currentTarget.style.background = 'transparent')}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="p-2 rounded-xl transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.background = 'var(--surface-2)')}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
