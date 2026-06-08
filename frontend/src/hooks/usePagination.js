import { useState, useCallback, useRef } from 'react';

export function usePagination(initialPage = 1) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages,  setTotalPages]  = useState(1);

  // Keep a ref so callbacks always see the latest value without re-creating
  const totalPagesRef = useRef(totalPages);
  const syncTotalPages = useCallback((n) => {
    totalPagesRef.current = n;
    setTotalPages(n);
  }, []);

  const goTo = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPagesRef.current)));
  }, []);

  const next = useCallback(() => {
    setCurrentPage(p => Math.min(p + 1, totalPagesRef.current));
  }, []);

  const prev = useCallback(() => {
    setCurrentPage(p => Math.max(p - 1, 1));
  }, []);

  const reset = useCallback(() => setCurrentPage(1), []);

  return { currentPage, totalPages, setTotalPages: syncTotalPages, goTo, next, prev, reset };
}
