import {
  createUsuario,
  deleteUsuario,
  getUsuarioById,
  getUsuariosAdmin,
  updateUsuario
} from '../services/usuarioService';
import { useCollection } from './useCollection';

export const useUsuarios = () => {
  const collection = useCollection({
    fetchAll: getUsuariosAdmin,
    create: createUsuario,
    update: updateUsuario,
    remove: deleteUsuario,
    resourceName: 'usuarios',
    listKey: 'data',
    errorMessage: 'No se pudieron cargar los usuarios.'
  });

  return {
    ...collection,
    load: collection.reload,
    getById: getUsuarioById
  };
};
