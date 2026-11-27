import React, { useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, MapPin, Route } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { EntityGallery } from '../../features/shop/DetailShared';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { getCircuitoById } from '../../services/circuitoService';
import { getShopCatalog } from '../../services/shopService';
import { formatDate, formatPrice } from '../../utils/formatters';

export const CircuitDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const fetchCircuit = useCallback(() => getCircuitoById(slug), [slug]);
  const { data: circuit, loading, error, reload } = useAsyncResource({
    fetcher: fetchCircuit,
    initialData: null,
    enabled: Boolean(slug),
    errorMessage: 'No se pudo cargar el detalle del circuito.'
  });

  const circuitIdentifier = circuit?.slug || circuit?._id;
  const fetchRaces = useCallback(
    () => getShopCatalog({ type: 'race', circuit: circuitIdentifier, limit: 20 }),
    [circuitIdentifier]
  );
  const { data: racesCatalog } = useAsyncResource({
    fetcher: fetchRaces,
    initialData: { items: [] },
    enabled: Boolean(circuitIdentifier),
    errorMessage: 'No se pudieron cargar las carreras del circuito.'
  });

  const fetchTickets = useCallback(
    () => getShopCatalog({ type: 'ticket', circuit: circuitIdentifier, limit: 50 }),
    [circuitIdentifier]
  );
  const { data: ticketsCatalog } = useAsyncResource({
    fetcher: fetchTickets,
    initialData: { items: [] },
    enabled: Boolean(circuitIdentifier),
    errorMessage: 'No se pudieron cargar las entradas del circuito.'
  });

  if (loading) return <PilotoSkeleton resourceName="detalle del circuito" />;
  if (error) return <PilotoError resourceName="detalle del circuito" message={error} onRetry={reload} />;
  if (!circuit) return null;

  const races = racesCatalog?.items || [];
  const tickets = ticketsCatalog?.items || [];

  const raceColumns = [
    {
      key: 'nombre',
      label: 'Carrera',
      render: (item) => (
        <Link to={`/shop/race/${encodeURIComponent(item.slug || item._id)}`} className="details-inline-link">
          {item.nombre}
        </Link>
      )
    },
    { key: 'fecha', label: 'Fecha', render: (item) => formatDate(item.fecha) },
    { key: 'capacidad', label: 'Capacidad', render: (item) => Number(item.capacidad || 0).toLocaleString('es-ES') },
    { key: 'estado', label: 'Estado', render: (item) => <span className="home-meta-badge">{item.estado || 'En vigor'}</span> }
  ];

  const ticketColumns = [
    { key: 'race', label: 'Carrera', render: (item) => item.race?.nombre || item.sku },
    {
      key: 'entry',
      label: 'Tipo de entrada',
      render: (item) => item.category?.categoriaEntrada?.categoriaEntrada || item.category?.sku || '—'
    },
    { key: 'duration', label: 'Duración', render: (item) => `${item.duration} ${item.duration === 1 ? 'día' : 'días'}` },
    { key: 'price', label: 'Precio', render: (item) => <strong className="home-price">{formatPrice(item.price)}</strong> },
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
          <p className="piloto-eyebrow">
            Circuito
            {circuit.categoria?.competicion ? ` · ${circuit.categoria.competicion}` : ''}
          </p>
          <h1>{circuit.nombre}</h1>
          <p>
            {circuit.location
              ? `${circuit.location.ciudad}, ${circuit.location.pais}`
              : 'Ubicación N/A'}
          </p>
        </div>
        <Link to="/shop?type=circuit" className="btn-outline-red home-hero-cta">
          <ArrowLeft size={17} aria-hidden="true" />
          <span>Volver a circuitos</span>
        </Link>
      </header>

      <div className="home-stats-row" aria-label="Especificaciones del circuito">
        <article className="home-stat-card">
          <span className="home-stat-label">Longitud</span>
          <strong className="home-stat-value">{circuit.longitud} km</strong>
        </article>
        <article className="home-stat-card">
          <span className="home-stat-label">Tipo</span>
          <strong className="home-stat-value">{circuit.tipo?.tipo || '—'}</strong>
        </article>
        <article className="home-stat-card">
          <span className="home-stat-label">Desgaste</span>
          <strong className="home-stat-value">{circuit.desgaste?.desgaste || '—'}</strong>
        </article>
        <article className="home-stat-card">
          <span className="home-stat-label">Carreras programadas</span>
          <strong className="home-stat-value">{races.length}</strong>
        </article>
      </div>

      <div className="home-modal-summary details-summary-card">
        <div className="home-badge-row">
          <span className="home-type-badge">{circuit.categoria?.competicion || 'F1'}</span>
          {circuit.tipo?.tipo ? <span className="home-meta-badge">{circuit.tipo.tipo}</span> : null}
          {circuit.desgaste?.desgaste ? <span className="home-meta-badge">Desgaste {circuit.desgaste.desgaste}</span> : null}
        </div>
        {circuit.location ? (
          <p className="home-inline-meta">
            <MapPin size={15} aria-hidden="true" />
            <span>
              <strong>Ubicación:</strong> {circuit.location.ciudad}, {circuit.location.pais}
              {circuit.location.capital ? ` (Capital: ${circuit.location.capital})` : ''}
            </span>
          </p>
        ) : null}
        <p className="home-inline-meta">
          <Route size={15} aria-hidden="true" />
          <span><strong>Longitud:</strong> {circuit.longitud} km</span>
        </p>
        {circuit.ultimoGanador ? (
          <p><strong>Último ganador:</strong> {circuit.ultimoGanador}</p>
        ) : null}
        {circuit.vueltaRapida?.tiempo ? (
          <p className="home-inline-meta">
            <CalendarDays size={15} aria-hidden="true" />
            <span>
              <strong>Vuelta rápida:</strong> {circuit.vueltaRapida.tiempo}
              {circuit.vueltaRapida.piloto ? ` (${circuit.vueltaRapida.piloto})` : ''}
            </span>
          </p>
        ) : null}
      </div>

      <h2>Carreras en este circuito</h2>
      <DataTable
        columns={raceColumns}
        rows={races}
        rowKey={(item) => item._id}
        emptyMessage="No hay carreras registradas en este circuito."
      />

      <h2>Entradas disponibles</h2>
      <DataTable
        columns={ticketColumns}
        rows={tickets}
        rowKey={(item) => item._id}
        emptyMessage="No hay entradas disponibles para este circuito."
      />

      <EntityGallery entity={circuit} title="Imágenes del circuito" />
    </section>
  );
};

export default CircuitDetailsPage;
