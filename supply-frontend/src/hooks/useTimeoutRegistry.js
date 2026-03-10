import { useCallback, useEffect, useRef } from 'react';

export function useTimeoutRegistry() {
  const timeoutIdsRef = useRef([]);

  const registerTimeout = useCallback((fn, delay) => {
    const timeoutId = setTimeout(() => {
      timeoutIdsRef.current = timeoutIdsRef.current.filter((id) => id !== timeoutId);
      fn();
    }, delay);

    timeoutIdsRef.current.push(timeoutId);
    return timeoutId;
  }, []);

  const clearRegisteredTimeout = useCallback((timeoutId) => {
    clearTimeout(timeoutId);
    timeoutIdsRef.current = timeoutIdsRef.current.filter((id) => id !== timeoutId);
  }, []);

  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((id) => clearTimeout(id));
      timeoutIdsRef.current = [];
    };
  }, []);

  return { registerTimeout, clearRegisteredTimeout };
}
