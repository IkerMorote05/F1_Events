import { useCallback, useEffect, useRef, useState } from 'react';
import { getShopHomeResource } from '../services/shopService';
import { normalizeApiError } from '../utils/errorHandler';
import { useAsyncResource } from './useAsyncResource';

const INITIAL_HOME_DATA = {
  categories: { global: [], circuit: [] },
  localizaciones: [],
  tickets: [],
  races: [],
  circuits: [],
  pilots: [],
  escuderias: []
};

const HOME_KEYS = Object.keys(INITIAL_HOME_DATA);

export const useShopHomeResource = (resource, { initialData = null, enabled = true } = {}) => {
  const fetcher = useCallback(() => getShopHomeResource(resource), [resource]);
  return useAsyncResource({
    fetcher,
    initialData,
    enabled,
    errorMessage: `No se pudo cargar ${resource}.`
  });
};

export const useShopHome = () => {
  const [data, setData] = useState(INITIAL_HOME_DATA);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);

  const loadAll = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setErrors({});

    const results = await Promise.allSettled(
      HOME_KEYS.map((resource) => getShopHomeResource(resource))
    );

    if (requestIdRef.current !== requestId) return;

    const nextData = { ...INITIAL_HOME_DATA };
    const nextErrors = {};

    results.forEach((result, index) => {
      const key = HOME_KEYS[index];
      if (result.status === 'fulfilled') {
        nextData[key] = result.value ?? INITIAL_HOME_DATA[key];
      } else {
        nextErrors[key] = normalizeApiError(result.reason).message;
      }
    });

    setData(nextData);
    setErrors(nextErrors);
    setLoading(false);
  }, []);

  const reloadResource = useCallback(async (resource) => {
    if (!HOME_KEYS.includes(resource)) return;
    setErrors((current) => ({ ...current, [resource]: undefined }));

    try {
      const value = await getShopHomeResource(resource);
      setData((current) => ({ ...current, [resource]: value ?? INITIAL_HOME_DATA[resource] }));
    } catch (err) {
      setErrors((current) => ({ ...current, [resource]: normalizeApiError(err).message }));
    }
  }, []);

  useEffect(() => {
    loadAll();
    return () => {
      requestIdRef.current += 1;
    };
  }, [loadAll]);

  const errorCount = Object.values(errors).filter(Boolean).length;
  const allFailed = errorCount === HOME_KEYS.length;

  return {
    data,
    errors,
    loading,
    error: allFailed ? 'No se pudieron cargar los datos de inicio. Asegúrate de que el backend esté activo.' : null,
    reload: loadAll,
    reloadResource
  };
};
