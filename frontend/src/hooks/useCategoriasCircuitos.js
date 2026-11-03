import {
  createCategoriaCircuitos,
  deleteCategoriaCircuitos,
  getCategoriasCircuitosAdmin,
  getCategoriaCircuitosById,
  updateCategoriaCircuitos
} from '../services/categoriaCircuitosService';
import { useCollection } from './useCollection';

export const useCategoriasCircuitos = () => {
  const collection = useCollection({
    fetchAll: getCategoriasCircuitosAdmin,
    create: createCategoriaCircuitos,
    update: updateCategoriaCircuitos,
    remove: deleteCategoriaCircuitos,
    resourceName: 'categorías de circuitos',
    listKey: 'categorias',
    errorMessage: 'No se pudieron cargar las categorías de circuitos.'
  });

  return {
    ...collection,
    load: collection.reload,
    getById: getCategoriaCircuitosById
  };
};
