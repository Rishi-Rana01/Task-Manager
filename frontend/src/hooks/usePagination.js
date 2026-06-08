import { useState, useCallback } from 'react';

/**
 * usePagination — manages pagination state for server-side paginated lists.
 *
 * @param {number} totalPages  — total number of pages (from API)
 * @returns {object} { currentPage, setTotalPages, goTo, next, prev, reset }
 */
export function usePagination(initialTotalPages = 1) {
  const [currentPage, setCurrentPage]   = useState(1);
  const [totalPages,  setTotalPages]    = useState(initialTotalPages);

  const goTo = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const next = useCallback(() => {
    setCurrentPage(p => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prev = useCallback(() => {
    setCurrentPage(p => Math.max(p - 1, 1));
  }, []);

  const reset = useCallback(() => setCurrentPage(1), []);

  return { currentPage, totalPages, setTotalPages, goTo, next, prev, reset };
}
