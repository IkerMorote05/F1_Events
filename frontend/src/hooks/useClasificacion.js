import { useCallback } from 'react';
import { getClasificacionPublica } from '../services/clasificacionService';
import { useAsyncResource } from './useAsyncResource';

const fetchClasificacion = async () => {
  const data = await getClasificacionPublica();
  if (!Array.isArray(data?.pilotos) || !Array.isArray(data?.escuderias)) {
    throw new Error('La respuesta de clasificación no tiene un formato válido.');
  }
  return data;
};

export const useClasificacion = () => {
  const fetcher = useCallback(fetchClasificacion, []);
  const { data, loading, error, reload } = useAsyncResource({
    fetcher,
    initialData: { pilotos: [], escuderias: [] },
    errorMessage: 'No se pudieron obtener los datos de la clasificación.'
  });

  return {
    pilotos: data?.pilotos || [],
    escuderias: data?.escuderias || [],
    loading,
    error,
    reload
  };
};
