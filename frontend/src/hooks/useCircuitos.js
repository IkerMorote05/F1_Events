import {
  createCircuito,
  deleteCircuito,
  getCircuitoById,
  getCircuitosAdmin,
  restoreCircuito,
  setCircuitoActive,
  updateCircuito
} from '../services/circuitoService';
import { useCollection } from './useCollection';

export const useCircuitos = () => {
  const collection = useCollection({
    fetchAll: getCircuitosAdmin,
    create: createCircuito,
    update: updateCircuito,
    remove: deleteCircuito,
    resourceName: 'circuitos',
    listKey: 'circuitos',
    errorMessage: 'No se pudieron cargar los circuitos.'
  });

  return {
    ...collection,
    load: collection.reload,
    getById: getCircuitoById,
    restore: restoreCircuito,
    setActive: setCircuitoActive
  };
};
