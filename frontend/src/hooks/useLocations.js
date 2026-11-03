import { useCallback } from 'react';
import {
  createLocation,
  deleteLocation,
  getLocationById,
  getLocations,
  updateLocation
} from '../services/locationService';
import { useCollection } from './useCollection';

export const useLocations = ({ includeDeleted = false } = {}) => {
  const fetchLocations = useCallback(
    () => getLocations({ includeDeleted }),
    [includeDeleted]
  );
  const collection = useCollection({
    fetchAll: fetchLocations,
    create: createLocation,
    update: updateLocation,
    remove: deleteLocation,
    resourceName: 'ubicaciones',
    listKey: 'locations',
    errorMessage: 'No se pudieron cargar las ubicaciones.'
  });

  return {
    ...collection,
    load: collection.reload,
    getById: getLocationById
  };
};
