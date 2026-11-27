import React, { useCallback, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Flag, MapPin, Wrench } from 'lucide-react';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { TEAM_COLORS } from '../../components/teamColors';
import { PilotCard } from '../../features/home/HomeCards';
import { EntityGallery } from '../../features/shop/DetailShared';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { getEscuderiaById } from '../../services/escuderiaService';
import { getShopCatalog } from '../../services/shopService';

export const EscuderiaDetailsPage = () => {
  const { slug } = useParams();

  const fetchEscuderia = useCallback(() => getEscuderiaById(slug), [slug]);
  const { data: escuderia, loading, error, reload } = useAsyncResource({
    fetcher: fetchEscuderia,
    initialData: null,
    enabled: Boolean(slug),
    errorMessage: 'No se pudo cargar el detalle de la escudería.'
  });

  const escuderiaKey = escuderia?._id || slug;
  const fetchPilots = useCallback(
    () => getShopCatalog({ type: 'pilot', escuderia: escuderiaKey, limit: 20 }),
    [escuderiaKey]
  );
  const { data: pilotsCatalog, loading: pilotsLoading } = useAsyncResource({
    fetcher: fetchPilots,
    initialData: { items: [] },
    enabled: Boolean(escuderia?._id),
    errorMessage: 'No se pudieron cargar los pilotos de la escudería.'
  });

  const pilots = useMemo(
    () => [...(pilotsCatalog?.items || [])].sort((a, b) => (b.puntos || 0) - (a.puntos || 0)),
    [pilotsCatalog?.items]
  );

  const totals = useMemo(() => pilots.reduce((acc, pilot) => ({
    puntos: acc.puntos + (Number(pilot.puntos) || 0),
    victorias: acc.victorias + (Number(pilot.victorias) || 0),
    podios: acc.podios + (Number(pilot.podios) || 0)
  }), { puntos: 0, victorias: 0, podios: 0 }), [pilots]);

  if (loading) return <PilotoSkeleton resourceName="detalle de escudería" />;
  if (error) return <PilotoError resourceName="detalle de escudería" message={error} onRetry={reload} />;
  if (!escuderia) return null;

  const teamColor = TEAM_COLORS[escuderia.siglas]?.primary || '#e10600';

  return (
    <section className="page-container home-page details-page">
      <header className="page-header home-hero">
        <div>
          <p className="piloto-eyebrow">
            Escudería
            {escuderia.siglas ? ` · ${escuderia.siglas}` : ''}
            {escuderia.categoria?.competicion ? ` · ${escuderia.categoria.competicion}` : ''}
          </p>
          <h1>{escuderia.nombre}</h1>
          <p>
            {escuderia.pais}
            {escuderia.jefe ? ` · Jefe de equipo: ${escuderia.jefe}` : ''}
          </p>
        </div>
        <Link to="/shop?type=escuderia" className="btn-outline-red home-hero-cta">
          <ArrowLeft size={17} aria-hidden="true" />
          <span>Volver a escuderías</span>
        </Link>
      </header>

      <div className="home-stats-row" aria-label="Estadísticas conjuntas de la escudería">
        <article className="home-stat-card" style={{ borderLeftColor: teamColor }}>
          <span className="home-stat-label">Puntos conjuntos</span>
          <strong className="home-stat-value">{totals.puntos}</strong>
        </article>
        <article className="home-stat-card" style={{ borderLeftColor: teamColor }}>
          <span className="home-stat-label">Victorias conjuntas</span>
          <strong className="home-stat-value">{totals.victorias}</strong>
        </article>
        <article className="home-stat-card" style={{ borderLeftColor: teamColor }}>
          <span className="home-stat-label">Podios conjuntos</span>
          <strong className="home-stat-value">{totals.podios}</strong>
        </article>
        <article className="home-stat-card" style={{ borderLeftColor: teamColor }}>
          <span className="home-stat-label">Año de fundación</span>
          <strong className="home-stat-value">{escuderia.año || '—'}</strong>
        </article>
      </div>

      <div className="home-modal-summary details-summary-card">
        <div className="home-badge-row">
          {escuderia.siglas ? <span className="home-type-badge">{escuderia.siglas}</span> : null}
          {escuderia.categoria?.competicion ? (
            <span className="home-meta-badge">{escuderia.categoria.competicion}</span>
          ) : null}
        </div>
        <p className="home-inline-meta">
          <MapPin size={15} aria-hidden="true" />
          <span><strong>País:</strong> {escuderia.pais || 'N/A'}</span>
        </p>
        <p className="home-inline-meta">
          <Wrench size={15} aria-hidden="true" />
          <span><strong>Motor:</strong> {escuderia.motor || 'N/A'}</span>
        </p>
        <p className="home-inline-meta">
          <Flag size={15} aria-hidden="true" />
          <span><strong>Jefe de equipo:</strong> {escuderia.jefe || 'N/A'}</span>
        </p>
        {escuderia.año ? (
          <p className="home-inline-meta">
            <Calendar size={15} aria-hidden="true" />
            <span><strong>Fundación:</strong> {escuderia.año}</span>
          </p>
        ) : null}
      </div>

      <h2>Pilotos de la escudería</h2>
      {pilotsLoading ? (
        <p className="home-empty-text">Cargando pilotos...</p>
      ) : pilots.length === 0 ? (
        <p className="home-empty-text">No hay pilotos asociados a esta escudería.</p>
      ) : (
        <div className="home-results-grid">
          {pilots.map((piloto) => (
            <PilotCard key={piloto._id} piloto={piloto} />
          ))}
        </div>
      )}

      <EntityGallery entity={escuderia} title="Imágenes de la escudería" />
    </section>
  );
};

export default EscuderiaDetailsPage;
