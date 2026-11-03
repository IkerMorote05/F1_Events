import {
  createVariant,
  deleteVariant,
  getVariantById,
  getVariantsAdmin,
  updateVariant
} from '../services/variantService';
import { useCollection } from './useCollection';

export const useVariants = () => {
  const collection = useCollection({
    fetchAll: getVariantsAdmin,
    create: createVariant,
    update: updateVariant,
    remove: deleteVariant,
    resourceName: 'variantes',
    listKey: 'data',
    errorMessage: 'No se pudieron cargar las variantes.'
  });

  return {
    ...collection,
    load: collection.reload,
    getById: getVariantById
  };
};
