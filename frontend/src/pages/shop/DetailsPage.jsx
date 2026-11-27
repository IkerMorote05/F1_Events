import React, { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Route, Ticket } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { useShopTicketDetail } from '../../hooks/useShopCatalog';
import { usePublicVariants } from '../../hooks/useVariants';
import { formatDate, formatPrice } from '../../utils/formatters';

export const DetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { ticket, loading, error, reload } = useShopTicketDetail(slug);
  const { variants: publicVariants } = usePublicVariants({ enabled: Boolean(slug) });

  const matchedVariant = useMemo(() => {
    if (!ticket?.category) return null;
    const categoryId = String(ticket.category._id || '');
    const categorySlug = ticket.category.slug;
    return publicVariants.find(
      (variant) => String(variant._id) === categoryId || (categorySlug && variant.slug === categorySlug)
    ) || null;
  }, [publicVariants, ticket]);

  if (loading) return <PilotoSkeleton resourceName="detalle de entrada" />;
  if (error) return <PilotoError resourceName="detalle de entrada" message={error} onRetry={reload} />;
  if (!ticket) return null;

  const entryLabel = ticket.category?.categoriaEntrada?.categoriaEntrada || ticket.category?.sku || '—';
  const standLabel = ticket.category?.categoriaGrada?.categoriaGrada;
  const raceVariants = Array.isArray(ticket.variants) ? ticket.variants : [];
  const circuitAvailability = Array.isArray(matchedVariant?.availabilityByCircuit)
    ? matchedVariant.availabilityByCircuit
    : [];

  const variantColumns = [
    {
      key: 'entry',
      label: 'Tipo de entrada',
      render: (item) => item.category?.categoriaEntrada?.categoriaEntrada || item.category?.sku || '—'
    },
    {
      key: 'stand',
      label: 'Grada',
      render: (item) => item.category?.categoriaGrada?.categoriaGrada || 'General'
    },
    {
      key: 'duration',
      label: 'Duración',
      render: (item) => `${item.duration} ${item.duration === 1 ? 'día' : 'días'}`
    },
    {
      key: 'percentage',
      label: 'Cuota',
      render: (item) => Number.isFinite(Number(item.category?.percentage))
        ? `${Number(item.category.percentage)} %`
        : '—'
    },
    {
      key: 'availability',
      label: 'Disponibilidad',
      render: (item) => item.availabilityConfigured
        ? `${item.availableQuantity ?? 0} entradas`
        : 'Pendiente'
    },
    {
      key: 'price',
      label: 'Precio',
      render: (item) => <strong className="home-price">{formatPrice(item.price)}</strong>
    },
    {
      key: 'actions',
      label: 'Acción',
      render: (item) => item.sku === ticket.sku ? (
        <span className="home-meta-badge">Seleccionada</span>
      ) : (
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate(`/shop/${encodeURIComponent(item.sku)}`)}
        >
          Ver detalle
        </button>
      )
    }
  ];

  const circuitColumns = [
    {
      key: 'circuit',
      label: 'Circuito',
      render: (item) => item.circuit?.nombre || 'Circuito'
    },
    {
      key: 'capacity',
      label: 'Capacidad total',
      render: (item) => Number(item.capacity || 0).toLocaleString('es-ES')
    },
    {
      key: 'percentageTotal',
      label: 'Porcentaje asignado',
      render: (item) => `${item.percentageTotal ?? 0} %`
    },
    {
      key: 'configured',
      label: 'Estado',
      render: (item) => (
        <span className="home-meta-badge">{item.configured ? 'Configurado' : 'Pendiente'}</span>
      )
    },
    {
      key: 'availableQuantity',
      label: 'Entradas disponibles',
      render: (item) => <strong>{item.availableQuantity ?? 0}</strong>
    }
  ];

  return (
    <section className="page-container home-page details-page">
      <header className="page-header home-hero">
        <div>
          <p className="piloto-eyebrow">Detalle de entrada · {ticket.sku}</p>
          <h1>{ticket.race?.nombre || ticket.sku}</h1>
          <p>
            {ticket.circuit?.nombre || 'Circuito sin asignar'}
            {ticket.race?.fecha ? ` · ${formatDate(ticket.race.fecha)}` : ''}
          </p>
        </div>
        <Link to="/shop" className="btn-outline-red home-hero-cta">
          <ArrowLeft size={17} aria-hidden="true" />
          <span>Volver al catálogo</span>
        </Link>
      </header>

      <div className="home-stats-row" aria-label="Resumen de la entrada">
        <article className="home-stat-card">
          <span className="home-stat-label">Precio total</span>
          <strong className="home-stat-value">{formatPrice(ticket.price)}</strong>
        </article>
        <article className="home-stat-card">
          <span className="home-stat-label">Duración</span>
          <strong className="home-stat-value">
            {ticket.duration} {ticket.duration === 1 ? 'día' : 'días'}
          </strong>
        </article>
        <article className="home-stat-card">
          <span className="home-stat-label">Disponibilidad</span>
          <strong className="home-stat-value">
            {ticket.availabilityConfigured ? (ticket.availableQuantity ?? 0) : '—'}
          </strong>
        </article>
        <article className="home-stat-card">
          <span className="home-stat-label">Estado</span>
          <strong className="home-stat-value">{ticket.estado || 'Disponible'}</strong>
        </article>
      </div>

      <div className="home-modal-summary details-summary-card">
        <div className="home-badge-row">
          <span className="home-type-badge">{entryLabel}</span>
          {standLabel ? <span className="home-meta-badge">Grada {standLabel}</span> : null}
          {ticket.category?.sku ? <span className="home-meta-badge">{ticket.category.sku}</span> : null}
        </div>
        <p className="home-inline-meta">
          <Route size={15} aria-hidden="true" />
          <span>
            <strong>Circuito:</strong>{' '}
            {ticket.circuit ? (
              <Link
                to={`/shop/circuit/${encodeURIComponent(ticket.circuit.slug || ticket.circuit._id)}`}
                className="details-inline-link"
              >
                {ticket.circuit.nombre}
              </Link>
            ) : '—'}
          </span>
        </p>
        <p className="home-inline-meta">
          <CalendarDays size={15} aria-hidden="true" />
          <span>
            <strong>Carrera:</strong>{' '}
            {ticket.race ? (
              <Link
                to={`/shop/race/${encodeURIComponent(ticket.race.slug || ticket.race._id)}`}
                className="details-inline-link"
              >
                {ticket.race.nombre}
              </Link>
            ) : '—'}
            {ticket.race?.fecha ? ` (${formatDate(ticket.race.fecha)})` : ''}
          </span>
        </p>
        <p className="home-inline-meta">
          <Ticket size={15} aria-hidden="true" />
          <span>
            <strong>Desglose de precio:</strong>{' '}
            {formatPrice(ticket.basePrice)} × {ticket.duration} {ticket.duration === 1 ? 'día' : 'días'}
            {' + '}
            {formatPrice(ticket.category?.price || 0)} (suplemento de variante)
          </span>
        </p>
        {ticket.category?.descripcion ? (
          <p className="home-card-description">{ticket.category.descripcion}</p>
        ) : null}
      </div>

      <h2>Opciones disponibles para esta carrera</h2>
      <DataTable
        columns={variantColumns}
        rows={raceVariants}
        rowKey={(item) => item._id}
        emptyMessage="No hay otras variantes disponibles para esta carrera."
      />

      {circuitAvailability.length > 0 ? (
        <>
          <h2>Disponibilidad de la variante por circuito</h2>
          <DataTable
            columns={circuitColumns}
            rows={circuitAvailability}
            rowKey={(item) => item.circuit?._id || item.circuit?.nombre}
            emptyMessage="Sin circuitos asignados para esta variante."
          />
        </>
      ) : null}
    </section>
  );
};

export default DetailsPage;
