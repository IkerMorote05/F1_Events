import { useCallback, useEffect, useState } from 'react';

export const useCollection = ({
  fetchAll,
  create,
  update,
  remove,
  resourceName,
  listKey,
  errorMessage
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mutating, setMutating] = useState(false);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchAll();
      const collection = Array.isArray(response)
        ? response
        : response?.data || response?.[listKey] || [];

      setItems(collection);
    } catch (err) {
      console.error(`Error al cargar ${resourceName}:`, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [errorMessage, fetchAll, listKey, resourceName]);

  useEffect(() => {
    reload();
  }, [reload]);

  const createItem = useCallback(async (data) => {
    if (!create) throw new Error(`No se puede crear ${resourceName}.`);

    setMutating(true);
    try {
      const result = await create(data);
      await reload();
      return result;
    } finally {
      setMutating(false);
    }
  }, [create, reload, resourceName]);

  const updateItem = useCallback(async (id, data) => {
    if (!update) throw new Error(`No se puede actualizar ${resourceName}.`);

    setMutating(true);
    try {
      const result = await update(id, data);
      await reload();
      return result;
    } finally {
      setMutating(false);
    }
  }, [reload, resourceName, update]);

  const removeItem = useCallback(async (id) => {
    if (!remove) throw new Error(`No se puede eliminar ${resourceName}.`);

    setMutating(true);
    try {
      const result = await remove(id);
      await reload();
      return result;
    } finally {
      setMutating(false);
    }
  }, [reload, remove, resourceName]);

  const collection = { items, loading, error, reload, mutating };
  if (create) collection.createItem = createItem;
  if (update) collection.updateItem = updateItem;
  if (remove) collection.removeItem = removeItem;

  return collection;
};