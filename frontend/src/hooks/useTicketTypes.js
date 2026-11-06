import {
  createTicketType,
  deleteTicketType,
  getTicketTypeById,
  getTicketTypesAdmin,
  updateTicketType
} from '../services/ticketTypeService';
import { useCollection } from './useCollection';

export const useTicketTypes = () => {
  const collection = useCollection({
    fetchAll: getTicketTypesAdmin,
    create: createTicketType,
    update: updateTicketType,
    remove: deleteTicketType,
    resourceName: 'tipos de entrada',
    listKey: 'data',
    errorMessage: 'No se pudieron cargar los tipos de entrada.'
  });

  return {
    ...collection,
    load: collection.reload,
    getById: getTicketTypeById
  };
};
