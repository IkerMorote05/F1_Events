import { useCallback, useState } from 'react';
import {
  createEscuderia,
  deleteEscuderia,
  getEscuderiaById,
  restoreEscuderia,
  setEscuderiaActive,
  updateEscuderia
} from '../services/escuderiaService';
import { useF1Data } from './useF1Data';

export const useEscuderias = () => {
  const collection = useF1Data().escuderias;
  const [mutating, setMutating] = useState(false);

  const runMutation = useCallback(async (mutation) => {
    setMutating(true);
    try {
      const result = await mutation();
      await collection.reload();
      return result;
    } finally {
      setMutating(false);
    }
  }, [collection.reload]);

  const createItem = useCallback(
    (data) => runMutation(() => createEscuderia(data)),
    [runMutation]
  );

  const updateItem = useCallback(
    (id, data) => runMutation(() => updateEscuderia(id, data)),
    [runMutation]
  );

  const removeItem = useCallback(
    (slug) => runMutation(() => deleteEscuderia(slug)),
    [runMutation]
  );

  return {
    ...collection,
    load: collection.reload,
    mutating,
    createItem,
    updateItem,
    removeItem,
    getById: getEscuderiaById,
    restore: restoreEscuderia,
    setActive: setEscuderiaActive
  };
};
