import {
  createCarrera,
  deleteCarrera,
  getCarreraById,
  getCarrerasAdmin,
  restoreCarrera,
  setCarreraActive,
  updateCarrera
} from '../services/carreraService';
import { useCollection } from './useCollection';

export const useCarreras = () => {
  const collection = useCollection({
    fetchAll: getCarrerasAdmin,
    create: createCarrera,
    update: updateCarrera,
    remove: deleteCarrera,
    resourceName: 'carreras',
    listKey: 'carreras',
    errorMessage: 'No se pudieron cargar las carreras.'
  });

  return {
    ...collection,
    load: collection.reload,
    getById: getCarreraById,
    restore: restoreCarrera,
    setActive: setCarreraActive
  };
};
