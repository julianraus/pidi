import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Generic data-fetching hook.
 * @param {Function} fetcher - async function that returns data
 * @param {Array}    deps    - dependency array (like useEffect)
 * @param {Object}   opts    - { immediate: bool, pollInterval: ms }
 */
export function useApi(fetcher, deps = [], opts = {}) {
  const { immediate = true, pollInterval } = opts;
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError]     = useState(null);
  const timerRef              = useRef(null);
  const mountedRef            = useRef(true);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mountedRef.current) setData(result?.data ?? result);
    } catch (err) {
      if (mountedRef.current) setError(err.message);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    if (immediate) execute();

    if (pollInterval) {
      timerRef.current = setInterval(execute, pollInterval);
    }

    return () => {
      mountedRef.current = false;
      clearInterval(timerRef.current);
    };
  }, [execute, immediate, pollInterval]);

  return { data, loading, error, refetch: execute };
}

/**
 * Mutation hook — for POST/action calls.
 */
export function useMutation(mutationFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [data, setData]       = useState(null);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mutationFn(...args);
      setData(result?.data ?? result);
      return result?.data ?? result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn]);

  return { mutate, loading, error, data };
}
