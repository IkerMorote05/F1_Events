import { useCallback, useEffect, useRef, useState } from 'react';
import { normalizeApiError } from '../utils/errorHandler';

export const useAsyncResource = ({
  fetcher,
  initialData = null,
  enabled = true,
  errorMessage = 'No se pudieron cargar los datos.'
}) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);

  const reload = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      if (requestIdRef.current === requestId) {
        setData(result);
      }
      return result;
    } catch (err) {
      if (requestIdRef.current === requestId) {
        setError(normalizeApiError(err).message || errorMessage);
      }
      return undefined;
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [errorMessage, fetcher]);

  useEffect(() => {
    if (!enabled) {
      requestIdRef.current += 1;
      setLoading(false);
      setError(null);
      return;
    }
    reload();
  }, [enabled, reload]);

  useEffect(() => () => {
    requestIdRef.current += 1;
  }, []);

  return { data, loading, error, reload };
};
