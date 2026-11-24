import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { PilotoError } from '../../components/PilotoError';
import { useShopTicketDetail } from '../../hooks/useShopCatalog';
import { formatDate, formatPrice } from '../../utils/formatters';

export const TicketDetailModal = ({ slug, onSelectVariant, onClose }) => {
  const { ticket, loading, error, reload } = useShopTicketDetail(slug);

  useEffect(() => {
    if (!slug) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, slug]);

  if (!slug) return null;

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content home-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-detail-title"
      >
        <div className="home-modal-header">
          <div>
            <p className="piloto-eyebrow">Detalle de entrada</p>
            <h2 id="ticket-detail-title">{ticket?.race?.nombre || slug}</h2>
          </div>
          <button
            type="button"
            className="btn-secondary team-action-button"
            onClick={onClose}
            aria-label="Cerrar detalle"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {loading ? (
          <p className="home-empty-text">Cargando detalle de la entrada...</p>
        ) : error ? (
          <PilotoError resourceName="detalle de entrada" message={error} onRetry={reload} />
        ) : ticket ? (
          <div className="home-modal-body">
            <div className="home-modal-summary">
              <p><strong>Circuito:</strong> {ticket.circuit?.nombre || '—'}</p>
              <p><strong>Fecha de carrera:</strong> {formatDate(ticket.race?.fecha)}</p>
              <p><strong>SKU:</strong> {ticket.sku}</p>
              <p>
                <strong>Duración:</strong> {ticket.duration} {ticket.duration === 1 ? 'día' : 'días'}
              </p>
              <p><strong>Precio:</strong> <span className="home-price">{formatPrice(ticket.price)}</span></p>
              <p>
                <strong>Disponibilidad:</strong>{' '}
                {ticket.availabilityConfigured
                  ? `${ticket.availableQuantity ?? 0} entradas`
                  : 'Pendiente de configuración'}
              </p>
            </div>

            {Array.isArray(ticket.variants) && ticket.variants.length > 0 ? (
              <div className="home-variants-list">
                <h3>Opciones disponibles para esta carrera</h3>
                <ul>
                  {ticket.variants.map((variantTicket) => {
                    const isCurrent = variantTicket.sku === ticket.sku;
                    return (
                      <li key={variantTicket._id} className={isCurrent ? 'is-current' : ''}>
                        <div>
                          <strong>
                            {variantTicket.category?.categoriaEntrada?.categoriaEntrada || variantTicket.category?.sku}
                            {variantTicket.category?.categoriaGrada?.categoriaGrada
                              ? ` · Grada ${variantTicket.category.categoriaGrada.categoriaGrada}`
                              : ''}
                          </strong>
                          <p>
                            {variantTicket.duration} {variantTicket.duration === 1 ? 'día' : 'días'}
                            {' · '}
                            {variantTicket.availabilityConfigured
                              ? `${variantTicket.availableQuantity ?? 0} disp.`
                              : 'Pendiente'}
                          </p>
                        </div>
                        <div className="home-variant-actions">
                          <span className="home-price">{formatPrice(variantTicket.price)}</span>
                          {!isCurrent ? (
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => onSelectVariant(variantTicket.sku)}
                            >
                              Ver
                            </button>
                          ) : (
                            <span className="home-meta-badge">Seleccionada</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};
