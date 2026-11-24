export const formatPrice = (price) => {
  const parsed = Number(price);
  if (!Number.isFinite(parsed)) return '—';
  return parsed.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR'
  });
};

export const formatDate = (value, options = { dateStyle: 'medium', timeZone: 'UTC' }) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('es-ES', options).format(date);
};

export const getTicketTotalPrice = (ticket) => {
  if (!ticket) return NaN;
  if (
    ticket.basePrice !== undefined
    && ticket.basePrice !== null
    && Number.isFinite(Number(ticket.basePrice))
  ) {
    return Number(ticket.basePrice) * Number(ticket.duration) + (Number(ticket.category?.price) || 0);
  }
  return Number(ticket.price) + (Number(ticket.category?.price) || 0);
};

export const getCircuitCategoryLabel = (category) => (
  category?.tipo
  || category?.desgaste
  || category?.categoriaEntrada
  || category?.categoriaGrada
  || ''
);

export const getPilotFullName = (piloto) => (
  [piloto?.nombre, piloto?.apellidos].filter(Boolean).join(' ')
);

export const getEntityImage = (entity) => {
  const firstImage = Array.isArray(entity?.images) ? entity.images[0] : null;
  if (!firstImage?.image_url) return null;
  try {
    const protocol = new URL(firstImage.image_url).protocol;
    if (protocol !== 'http:' && protocol !== 'https:') return null;
    return {
      url: firstImage.image_url,
      alt: firstImage.alt_text || entity.nombre || 'Imagen'
    };
  } catch {
    return null;
  }
};
