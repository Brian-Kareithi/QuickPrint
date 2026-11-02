'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Load data once (and on demand) with explicit loading / error states.
 * Because every API call has a timeout, `loading` always ends - on success or with an error to show.
 */
export function useLoader<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const latest = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(async () => {
    const id = ++latest.current;
    setLoading(true);
    setError('');
    try {
      const result = await fetcher();
      if (id === latest.current) setData(result);
    } catch (e: any) {
      if (id === latest.current) setError(e?.message || 'Something went wrong. Please try again.');
    } finally {
      if (id === latest.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { data, setData, loading, error, reload: run };
}
