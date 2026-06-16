import { useState, useEffect, useCallback, useRef } from 'react';

export function useData(fetcher, deps = [], { pollInterval = 0 } = {}) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const timerRef              = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      // API returns { success: true, data: [...] }
      // axios interceptor returns res.data, so result = { success, data }
      if (result && typeof result === 'object' && 'data' in result) {
        setData(result.data);
      } else {
        setData(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
    if (pollInterval > 0) {
      timerRef.current = setInterval(load, pollInterval);
    }
    return () => clearInterval(timerRef.current);
  }, [load, pollInterval]);

  return { data, loading, error, refresh: load };
}
