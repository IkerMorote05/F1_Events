export const normalizeApiError = (error) => {
  const responseData = error?.response?.data || {};
  const details = Array.isArray(responseData.details)
    ? responseData.details.filter((detail) => typeof detail === 'string' && detail.trim())
    : [];

  return {
    message: responseData.message || responseData.error || error?.message || 'Ha ocurrido un error inesperado.',
    details
  };
};
