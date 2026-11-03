import {
  createRol,
  deleteRol,
  getRolById,
  getRolesAdmin,
  updateRol
} from '../services/rolService';
import { useCollection } from './useCollection';

export const useRoles = () => {
  const collection = useCollection({
    fetchAll: getRolesAdmin,
    create: createRol,
    update: updateRol,
    remove: deleteRol,
    resourceName: 'roles',
    listKey: 'data',
    errorMessage: 'No se pudieron cargar los roles.'
  });

  return {
    ...collection,
    load: collection.reload,
    getById: getRolById
  };
};
