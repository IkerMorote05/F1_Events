import Swal from 'sweetalert2';
import { normalizeApiError } from './errorHandler';

export const confirmDeletion = async (entityName = 'registro') => {
  const result = await Swal.fire({
    icon: 'warning',
    title: `¿Eliminar ${entityName}?`,
    text: 'Esta acción no se puede deshacer.',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc3545'
  });

  return result.isConfirmed;
};

export const showApiError = async (error, title = 'No se pudo completar la operación') => {
  const normalized = normalizeApiError(error);
  const detailText = normalized.details.length ? `\n${normalized.details.join('\n')}` : '';

  await Swal.fire({
    icon: 'error',
    title,
    text: `${normalized.message}${detailText}`,
    confirmButtonText: 'Entendido'
  });
};

export const showSuccess = async (title) => {
  await Swal.fire({ icon: 'success', title, confirmButtonText: 'Aceptar' });
};

export const confirmPilotoDeletion = () => confirmDeletion('piloto');
export const showPilotoError = showApiError;
export const showPilotoSuccess = showSuccess;
