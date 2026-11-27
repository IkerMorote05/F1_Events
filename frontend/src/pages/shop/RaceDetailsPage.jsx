import React, { useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, MapPin, Route } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { EntityGallery } from '../../features/shop/DetailShared';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { getCarreraById } from '../../services/carreraService';
import { getCircuitoById } from '../../services/circuitoService';
import { getShopCatalog } from '../../services/shopService';
import { formatDate, formatPrice } from '../../utils/formatters';

export const RaceDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const fetchRace = useCallback(() => getCarreraById(slug), [slug]);
  const { data: race, loading, error, reload } = useAsyncResource({
    fetcher: fetchRace,
    initialData: null,
    enabled: Boolean(slug),
    errorMessage: 'No se pudo cargar el detalle de la carrera.'
  });

  const circuitIdentifier = race?.circuito?.slug || race?.circuito?._id;
  const fetchCircuit = useCallback(() => getCircuitoById(circuitIdentifier), [circuitIdentifier]);
  const { data: circuit } = useAsyncResource({
    fetcher: fetchCircuit,
    initialData: null,
    enabled: Boolean(circuitIdentifier),
    errorMessage: 'No se pudo cargar el circuito.'
  });

  const raceIdentifier = race?.slug || race?._id;
  const fetchTickets = useCallback(
    () => getShopCatalog({ type: 'ticket', race: raceIdentifier, limit: 50 }),
    [raceIdentifier]
  );
  const { data: ticketsCatalog, loading: ticketsLoading } = useAsyncResource({
    fetcher: fetchTickets,
    initialData: { items: [] },
    enabled: Boolean(raceIdentifier),
    errorMessage: 'No se pudieron cargar las entradas disponibles.'
  });

  if (loading) return <PilotoSkeleton resourceName="detalle de la carrera" />;
  if (error) return <PilotoError resourceName="detalle de la carrera" message={error} onRetry={reload} />;
  if (!race) return null;

  const circuitData = circuit || race.circuito;
  const tickets = ticketsCatalog?.items || [];

  const ticketColumns = [
    {
      key: 'entry',
      label: 'Tipo de entrada',
      render: (item) => item.category?.categoriaEntrada?.categoriaEntrada || item.category?.sku || item.sku
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
      key: 'price',
      label: 'Precio',
      render: (item) => <strong className="home-price">{formatPrice(item.price)}</strong>
    },
    {
      key: 'actions',
      label: 'Acción',
      render: (item) => (
        <button
          type="button"
          className="btn-primary home-card-cta"
          onClick={() => navigate(`/shop/${encodeURIComponent(item.sku || item._id)}`)}
        >
          Ver entrada
        </button>
      )
    }
  ];

  return (
    <section className="page-container home-page details-page">
      <header className="page-header home-hero">
        <div>
          <p className="piloto-eyebrow">Gran Premio · {race.estado || 'En vigor'}</p>
          <h1>{race.nombre}</h1>
          <p>
            {circuitData?.nombre || 'Circuito sin asignar'}
            {race.fecha ? ` · ${formatDate(race.fecha)}` : ''}
          </p>
        </div>
        <Link to="/shop?type=race" className="btn-outline-red home-hero-cta">
          <ArrowLeft size={17} aria-hidden="true" />
          <span>Volver a carreras</span>
        </Link>
      </header>

      <div className="home-stats-row" aria-label="Resumen de la carrera">
        <article className="home-stat-card">
          <span className="home-stat-label">Estado</span>
          <strong className="home-stat-value">{race.estado || 'En vigor'}</strong>
        </article>
        <article className="home-stat-card">
          <span className="home-stat-label">Capacidad</span>
          <strong className="home-stat-value">{Number(race.capacidad || 0).toLocaleString('es-ES')}</strong>
        </article>
        <article className="home-stat-card">
          <span className="home-stat-label">Entradas disponibles</span>
          <strong className="home-stat-value">{tickets.length}</strong>
        </article>
        <article className="home-stat-card">
          <span className="home-stat-label">Longitud del circuito</span>
          <strong className="home-stat-value">
            {circuitData?.longitud ? `${circuitData.longitud} km` : '—'}
          </strong>
        </article>
      </div>

      <div className="home-modal-summary details-summary-card">
        <div className="home-badge-row">
          <span className="home-type-badge">{race.estado || 'En vigor'}</span>
          {circuitData?.categoria?.competicion ? (
            <span className="home-meta-badge">{circuitData.categoria.competicion}</span>
          ) : null}
          {circuitData?.tipo?.tipo ? (
            <span className="home-meta-badge">{circuitData.tipo.tipo}</span>
          ) : null}
        </div>
        <p className="home-inline-meta">
          <CalendarDays size={15} aria-hidden="true" />
          <span><strong>Fecha:</strong> {formatDate(race.fecha)}</span>
        </p>
        {circuitData ? (
          <p className="home-inline-meta">
            <Route size={15} aria-hidden="true" />
            <span>
              <strong>Circuito:</strong>{' '}
              <Link
                to={`/shop/circuit/${encodeURIComponent(circuitData.slug || circuitData._id)}`}
                className="details-inline-link"
              >
                {circuitData.nombre}
              </Link>
              {circuitData.longitud ? ` (${circuitData.longitud} km)` : ''}
            </span>
          </p>
        ) : null}
        {circuitData?.location ? (
          <p className="home-inline-meta">
            <MapPin size={15} aria-hidden="true" />
            <span>
              <strong>Ubicación:</strong> {circuitData.location.ciudad}, {circuitData.location.pais}
            </span>
          </p>
        ) : null}
        {circuitData?.desgaste?.desgaste ? (
          <p><strong>Desgaste:</strong> {circuitData.desgaste.desgaste}</p>
        ) : null}
        {circuitData?.ultimoGanador ? (
          <p><strong>Último ganador:</strong> {circuitData.ultimoGanador}</p>
        ) : null}
        {circuitData?.vueltaRapida?.tiempo ? (
          <p>
            <strong>Vuelta rápida:</strong> {circuitData.vueltaRapida.tiempo}
            {circuitData.vueltaRapida.piloto ? ` (${circuitData.vueltaRapida.piloto})` : ''}
          </p>
        ) : null}
      </div>

      <h2>Entradas disponibles para esta carrera</h2>
      {ticketsLoading ? (
        <p className="home-empty-text">Cargando entradas disponibles...</p>
      ) : (
        <DataTable
          columns={ticketColumns}
          rows={tickets}
          rowKey={(item) => item._id}
          emptyMessage="No hay entradas disponibles registradas para esta carrera."
        />
      )}

      <EntityGallery entity={race} title="Imágenes de la carrera" />
    </section>
  );
};

export default RaceDetailsPage;
