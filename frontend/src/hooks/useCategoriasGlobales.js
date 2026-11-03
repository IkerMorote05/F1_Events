import {
  createCategoriaGlobal,
  deleteCategoriaGlobal,
  getCategoriasGlobalesAdmin,
  getCategoriaGlobalById,
  updateCategoriaGlobal
} from '../services/categoriaGlobalService';
import { useCollection } from './useCollection';

export const useCategoriasGlobales = () => {
  const collection = useCollection({
    fetchAll: getCategoriasGlobalesAdmin,
    create: createCategoriaGlobal,
    update: updateCategoriaGlobal,
    remove: deleteCategoriaGlobal,
    resourceName: 'categorías globales',
    listKey: 'categorias',
    errorMessage: 'No se pudieron cargar las categorías globales.'
  });

  return {
    ...collection,
    load: collection.reload,
    getById: getCategoriaGlobalById
  };
};
