import { useState, useCallback } from 'react';

/**
 * useLocalStorage — useState backed by localStorage for persistence across
 * page refreshes. Falls back gracefully if localStorage is unavailable.
 *
 * @param {string} key           — localStorage key
 * @param {*}      initialValue  — default value when key doesn't exist
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`[useLocalStorage] Failed to set "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}
