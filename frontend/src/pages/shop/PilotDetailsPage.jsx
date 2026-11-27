import React, { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Flag, Shield, Trophy } from 'lucide-react';
import { NationalityBadge } from '../../components/NationalityBadge';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { TEAM_COLORS } from '../../components/teamColors';
import { EntityGallery } from '../../features/shop/DetailShared';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { getPilotoById } from '../../services/pilotoService';
import { formatDate, getPilotFullName } from '../../utils/formatters';

const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - date.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - date.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < date.getUTCDate())) {
    age -= 1;
  }
  return age >= 0 ? age : null;
};

export const PilotDetailsPage = () => {
  const { slug } = useParams();
  const fetcher = useCallback(() => getPilotoById(slug), [slug]);
  const { data: piloto, loading, error, reload } = useAsyncResource({
    fetcher,
    initialData: null,
    enabled: Boolean(slug),
    errorMessage: 'No se pudo cargar el detalle del piloto.'
  });

  if (loading) return <PilotoSkeleton resourceName="detalle del piloto" />;
  if (error) return <PilotoError resourceName="detalle del piloto" message={error} onRetry={reload} />;
  if (!piloto) return null;

  const fullName = getPilotFullName(piloto);
  const teamColor = TEAM_COLORS[piloto.escuderia?.siglas]?.primary || '#e10600';
  const age = calculateAge(piloto.fecha_nacimiento);

  return (
    <section className="page-container home-page details-page">
      <header className="page-header home-hero">
        <div>
          <p className="piloto-eyebrow">
            Piloto · #{piloto.numero}
            {piloto.categoria?.competicion ? ` · ${piloto.categoria.competicion}` : ''}
          </p>
          <h1>{fullName}</h1>
          <p>
            {piloto.escuderia?.nombre || 'Sin escudería asignada'}
            {piloto.estado ? ` · ${piloto.estado}` : ''}
          </p>
        </div>
        <Link to="/shop?type=pilot" className="btn-outline-red home-hero-cta">
          <ArrowLeft size={17} aria-hidden="true" />
          <span>Volver a pilotos</span>
        </Link>
      </header>

      <div className="home-stats-row" aria-label="Estadísticas del piloto">
        <article className="home-stat-card" style={{ borderLeftColor: teamColor }}>
          <span className="home-stat-label">Dorsal</span>
          <strong className="home-stat-value">#{piloto.numero}</strong>
        </article>
        <article className="home-stat-card" style={{ borderLeftColor: teamColor }}>
          <span className="home-stat-label">Puntos</span>
          <strong className="home-stat-value">{piloto.puntos ?? 0}</strong>
        </article>
        <article className="home-stat-card" style={{ borderLeftColor: teamColor }}>
          <span className="home-stat-label">Victorias</span>
          <strong className="home-stat-value">{piloto.victorias ?? 0}</strong>
        </article>
        <article className="home-stat-card" style={{ borderLeftColor: teamColor }}>
          <span className="home-stat-label">Podios</span>
          <strong className="home-stat-value">{piloto.podios ?? 0}</strong>
        </article>
      </div>

      <div className="home-modal-summary details-summary-card">
        <div className="home-badge-row">
          <span className="home-type-badge">{piloto.estado || 'compitiendo'}</span>
          {piloto.categoria?.competicion ? (
            <span className="home-meta-badge">{piloto.categoria.competicion}</span>
          ) : null}
        </div>
        <p className="home-inline-meta">
          <Trophy size={15} aria-hidden="true" />
          <span><strong>Nacionalidad:</strong> <NationalityBadge nationality={piloto.nacionalidad} /></span>
        </p>
        {piloto.fecha_nacimiento ? (
          <p className="home-inline-meta">
            <span>
              <strong>Fecha de nacimiento:</strong> {formatDate(piloto.fecha_nacimiento)}
              {age !== null ? ` (${age} años)` : ''}
            </span>
          </p>
        ) : null}
        {piloto.escuderia ? (
          <p className="home-inline-meta">
            <Flag size={15} aria-hidden="true" />
            <span>
              <strong>Escudería:</strong>{' '}
              <Link
                to={`/shop/escuderia/${encodeURIComponent(piloto.escuderia.slug || piloto.escuderia._id)}`}
                className="details-inline-link"
              >
                {piloto.escuderia.nombre}
              </Link>
              {piloto.escuderia.siglas ? ` (${piloto.escuderia.siglas})` : ''}
            </span>
          </p>
        ) : null}
        {piloto.escuderia?.motor ? (
          <p className="home-inline-meta">
            <Shield size={15} aria-hidden="true" />
            <span><strong>Motor:</strong> {piloto.escuderia.motor}</span>
          </p>
        ) : null}
      </div>

      <EntityGallery entity={piloto} title="Imágenes del piloto" />
    </section>
  );
};

export default PilotDetailsPage;
