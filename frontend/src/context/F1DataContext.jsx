import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getEscuderiasAdmin } from '../services/escuderiaService';
import { getPilotosAdmin } from '../services/pilotoService';

export const F1DataContext = createContext(null);

export const F1DataProvider = ({ children }) => {
  const [pilotos, setPilotos] = useState({
    items: [],
    loading: true,
    error: null
  });
  const [escuderias, setEscuderias] = useState({
    items: [],
    loading: true,
    error: null
  });
  const loaded = useRef({ pilotos: false, escuderias: false });
  const pending = useRef({ pilotos: null, escuderias: null });

  const loadPilotos = useCallback(async ({ force = false } = {}) => {
    if (pending.current.pilotos) return pending.current.pilotos;
    if (loaded.current.pilotos && !force) return;

    setPilotos((current) => ({ ...current, loading: true, error: null }));
    const request = getPilotosAdmin()
      .then((response) => {
        const items = Array.isArray(response) ? response : response?.data || response?.pilotos || [];
        setPilotos({ items, loading: false, error: null });
        loaded.current.pilotos = true;
      })
      .catch((requestError) => {
        console.error('Error al cargar pilotos:', requestError);
        setPilotos((current) => ({
          ...current,
          loading: false,
          error: 'No se pudieron cargar los datos.'
        }));
      })
      .finally(() => {
        pending.current.pilotos = null;
      });

    pending.current.pilotos = request;
    return request;
  }, []);

  const loadEscuderias = useCallback(async ({ force = false } = {}) => {
    if (pending.current.escuderias) return pending.current.escuderias;
    if (loaded.current.escuderias && !force) return;

    setEscuderias((current) => ({ ...current, loading: true, error: null }));
    const request = getEscuderiasAdmin()
      .then((response) => {
        const items = Array.isArray(response) ? response : response?.data || response?.escuderias || [];
        setEscuderias({ items, loading: false, error: null });
        loaded.current.escuderias = true;
      })
      .catch((requestError) => {
        console.error('Error al cargar escuderías:', requestError);
        setEscuderias((current) => ({
          ...current,
          loading: false,
          error: 'No se pudieron cargar las escuderías.'
        }));
      })
      .finally(() => {
        pending.current.escuderias = null;
      });

    pending.current.escuderias = request;
    return request;
  }, []);

  const refreshPilotos = useCallback(() => loadPilotos({ force: true }), [loadPilotos]);
  const refreshEscuderias = useCallback(() => loadEscuderias({ force: true }), [loadEscuderias]);

  useEffect(() => {
    loadPilotos();
    loadEscuderias();
  }, [loadPilotos, loadEscuderias]);

  const value = useMemo(() => ({
    pilotos: { ...pilotos, reload: refreshPilotos, load: refreshPilotos },
    escuderias: { ...escuderias, reload: refreshEscuderias, load: refreshEscuderias }
  }), [pilotos, escuderias, refreshPilotos, refreshEscuderias]);

  return <F1DataContext.Provider value={value}>{children}</F1DataContext.Provider>;
};