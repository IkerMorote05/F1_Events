import { useCallback, useEffect, useState } from 'react';

export const useCollection = ({ fetchAll, create, update, remove, resourceName, listKey, errorMessage }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const createItem = async (data) => {
    const result = await create(data);
    await reload();
    return result;
  };

  const updateItem = async (id, data) => {
    const result = await update(id, data);
    await reload();
    return result;
  };

  const removeItem = async (id) => {
    const result = await remove(id);
    await reload();
    return result;
  };

  return { items, loading, error, reload, createItem, updateItem, removeItem };
};