import { useCallback } from 'react';
import {
  createVariant,
  deleteVariant,
  getVariantById,
  getVariants,
  getVariantsAdmin,
  updateVariant
} from '../services/variantService';
import { useAsyncResource } from './useAsyncResource';
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

export const usePublicVariants = ({ enabled = true } = {}) => {
  const fetcher = useCallback(() => getVariants(), []);
  const { data, loading, error, reload } = useAsyncResource({
    fetcher,
    initialData: [],
    enabled,
    errorMessage: 'No se pudieron cargar las variantes.'
  });

  return {
    variants: Array.isArray(data) ? data : [],
    loading,
    error,
    reload
  };
};
