import { ChevronLeft, ChevronRight } from 'lucide-react';

const activeStyle = {
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  color: '#fff',
  boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
};

export default function Pagination({ currentPage, totalPages, onGoTo, onNext, onPrev, totalItems, itemsPerPage }) {
  if (!totalPages || totalPages <= 1) return null;

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

  const navBtnBase = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
    color: 'var(--text-muted)',
    background: 'transparent',
  };

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-5"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
        <span className="font-semibold" style={{ color: 'var(--text)' }}>{first}–{last}</span>
        {' '}of{' '}
        <span className="font-semibold" style={{ color: 'var(--text)' }}>{totalItems}</span>
        {' '}tasks
      </p>

      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          aria-label="Previous page"
          style={{ ...navBtnBase, opacity: currentPage === 1 ? 0.3 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          onMouseEnter={e => { if (currentPage !== 1) e.currentTarget.style.background = 'var(--surface-2)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <ChevronLeft size={15} />
        </button>

        {/* Page numbers */}
        {getPages().map((page, idx) =>
          page === '...' ? (
            <span
              key={`e-${idx}`}
              style={{ width: '36px', textAlign: 'center', fontSize: '14px', userSelect: 'none', color: 'var(--text-muted)' }}
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onGoTo(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              style={page === currentPage
                ? { ...navBtnBase, ...activeStyle }
                : { ...navBtnBase }
              }
              onMouseEnter={e => { if (page !== currentPage) e.currentTarget.style.background = 'var(--surface-2)'; }}
              onMouseLeave={e => { if (page !== currentPage) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: '12px', fontWeight: 700 }}>{page}</span>
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          style={{ ...navBtnBase, opacity: currentPage === totalPages ? 0.3 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          onMouseEnter={e => { if (currentPage !== totalPages) e.currentTarget.style.background = 'var(--surface-2)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
