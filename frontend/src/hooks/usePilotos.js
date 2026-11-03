import { useCallback, useState } from 'react';
import {
  createPiloto,
  deletePiloto,
  getPilotoById,
  restorePiloto,
  setPilotoActive,
  updatePiloto
} from '../services/pilotoService';
import { useF1Data } from './useF1Data';

export const usePilotos = () => {
  const collection = useF1Data().pilotos;
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
    (data) => runMutation(() => createPiloto(data)),
    [runMutation]
  );

  const updateItem = useCallback(
    (id, data) => runMutation(() => updatePiloto(id, data)),
    [runMutation]
  );

  const removeItem = useCallback(
    (slug) => runMutation(() => deletePiloto(slug)),
    [runMutation]
  );

  return {
    ...collection,
    load: collection.reload,
    mutating,
    createItem,
    updateItem,
    removeItem,
    getById: getPilotoById,
    restore: restorePiloto,
    setActive: setPilotoActive
  };
};
