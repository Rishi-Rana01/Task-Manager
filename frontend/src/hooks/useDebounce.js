import { useState, useEffect } from 'react';

/**
 * useDebounce — delays updating the returned value until after `delay` ms
 * of inactivity. Used for search inputs to avoid firing on every keystroke.
 *
 * @param {*}      value  — the value to debounce
 * @param {number} delay  — delay in milliseconds (default 300)
 * @returns debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
