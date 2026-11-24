/**
 * HomeCards — shared card-body components used in both HomeSections
 * (carousel) and HomeCatalogResults (paginated grid).
 *
 * Keeps the visual aesthetic consistent: pilot cards always show the
 * team-colour gradient header + race number; team cards always show the
 * left-border accent and badge row.
 */
import React from 'react';
import { MapPin, Ticket } from 'lucide-react';
import { NationalityBadge } from '../../components/NationalityBadge';
import { TEAM_COLORS } from '../../components/teamColors';
import {
  formatDate,
  formatPrice,
  getEntityImage,
  getPilotFullName,
  getTicketTotalPrice
} from '../../utils/formatters';

/* ── Shared media thumbnail ───────────────────────────────── */
export const HomeCardMedia = ({ entity }) => {
  const image = getEntityImage(entity);
  if (!image) return null;
  return (
    <div className="home-card-media">
      <img src={image.url} alt={image.alt} loading="lazy" />
    </div>
  );
};

/* ── Ticket card body ─────────────────────────────────────── */
export const TicketCardBody = ({ ticket, onSelectTicket }) => {
  const totalPrice = getTicketTotalPrice(ticket);
  const entryLabel = ticket.category?.categoriaEntrada?.categoriaEntrada;
  const standLabel = ticket.category?.categoriaGrada?.categoriaGrada;
  const price = Number.isFinite(ticket.price) ? ticket.price : totalPrice;

  return (
    <>
      <div className="home-badge-row">
        {entryLabel ? <span className="home-type-badge">{entryLabel}</span> : null}
        {standLabel ? <span className="home-meta-badge">Grada {standLabel}</span> : null}
      </div>
      <h3>{ticket.race?.nombre || ticket.sku}</h3>
      <p className="home-card-venue">
        <Ticket size={13} aria-hidden="true" />
        <span>{ticket.circuit?.nombre || 'Circuito sin asignar'}</span>
      </p>
      <p>
        <strong>Duración:</strong>{' '}
        {ticket.duration} {ticket.duration === 1 ? 'día' : 'días'}
      </p>
      <p>
        <strong>Disponibilidad:</strong>{' '}
        {ticket.availabilityConfigured
          ? `${ticket.availableQuantity ?? 0} entradas`
          : 'Pendiente de configuración'}
      </p>
      <div className="home-card-footer">
        <span className="home-price">{formatPrice(price)}</span>
        <button
          type="button"
          className="btn-primary home-card-cta"
          onClick={() => onSelectTicket(ticket.sku || ticket._id)}
        >
          Ver variantes
        </button>
      </div>
    </>
  );
};

/* ── Race card body ───────────────────────────────────────── */
export const RaceCardBody = ({ race }) => (
  <>
    <HomeCardMedia entity={race} />
    <span className="home-meta-badge">{race.estado || 'En vigor'}</span>
    <h3>{race.nombre}</h3>
    <p className="home-card-subtitle">{race.circuito?.nombre || 'Circuito sin asignar'}</p>
    {race.circuito?.location ? (
      <p className="home-card-venue">
        <MapPin size={13} aria-hidden="true" />
        <span>{race.circuito.location.ciudad}, {race.circuito.location.pais}</span>
      </p>
    ) : null}
    <p><strong>Fecha:</strong> {formatDate(race.fecha)}</p>
    <p><strong>Capacidad:</strong> {Number(race.capacidad || 0).toLocaleString('es-ES')} plazas</p>
  </>
);

/* ── Circuit card body ────────────────────────────────────── */
export const CircuitCardBody = ({ circuit }) => (
  <>
    <HomeCardMedia entity={circuit} />
    <div className="home-badge-row">
      <span className="home-type-badge">{circuit.categoria?.competicion || 'F1'}</span>
      {circuit.tipo?.tipo ? <span className="home-meta-badge">{circuit.tipo.tipo}</span> : null}
    </div>
    <h3>{circuit.nombre}</h3>
    <p className="home-card-subtitle">
      {circuit.location
        ? `${circuit.location.ciudad}, ${circuit.location.pais}`
        : 'Ubicación N/A'}
    </p>
    <p><strong>Longitud:</strong> {circuit.longitud} km</p>
    {circuit.desgaste?.desgaste
      ? <p><strong>Desgaste:</strong> {circuit.desgaste.desgaste}</p>
      : null}
    {circuit.ultimoGanador
      ? <p><strong>Último ganador:</strong> {circuit.ultimoGanador}</p>
      : null}
    {circuit.vueltaRapida?.tiempo ? (
      <p>
        <strong>Vuelta rápida:</strong> {circuit.vueltaRapida.tiempo}
        {circuit.vueltaRapida.piloto ? ` (${circuit.vueltaRapida.piloto})` : ''}
      </p>
    ) : null}
  </>
);

/* ── Pilot card (full article) ────────────────────────────── */
/**
 * Gradient header with team colour + race number, optional photo, stats.
 * Same look in both carousel and filtered grid.
 */
export const PilotCard = ({ piloto, className = '' }) => {
  const teamColor = TEAM_COLORS[piloto.escuderia?.siglas]?.primary || '#e10600';
  const image = getEntityImage(piloto);

  return (
    <article className={`f1-card home-card home-pilot-card ${className}`.trim()}>
      <div
        className="f1-card-header f1-pilot-header"
        style={{ background: `linear-gradient(135deg, ${teamColor} 0%, #111827 80%)` }}
      >
        <h3>{getPilotFullName(piloto)}</h3>
        <span className="f1-number">#{piloto.numero}</span>
      </div>
      {image ? (
        <div className="home-card-media home-pilot-media">
          <img src={image.url} alt={image.alt} loading="lazy" />
        </div>
      ) : null}
      <p className="home-card-subtitle">
        {piloto.estado === 'compitiendo'
          ? piloto.escuderia?.nombre || 'Sin escudería'
          : piloto.estado}
      </p>
      <p><strong>Nacionalidad:</strong> <NationalityBadge nationality={piloto.nacionalidad} /></p>
      <p>
        <strong>Puntos:</strong>{' '}
        <span className="f1-pts">{piloto.puntos || 0} PTS</span>
        {' · '}
        <span>{piloto.victorias || 0} vic.</span>
        {' · '}
        <span>{piloto.podios || 0} podios</span>
      </p>
    </article>
  );
};

/* ── Team card (full article) ─────────────────────────────── */
/**
 * Left-border accent with team colour, badges, stats.
 * Same look in both carousel and filtered grid.
 */
export const TeamCard = ({ escuderia, puntos, className = '' }) => {
  const primaryColor = TEAM_COLORS[escuderia.siglas]?.primary || '#e10600';

  return (
    <article
      className={`f1-card home-card ${className}`.trim()}
      style={{ borderLeftColor: primaryColor }}
    >
      <HomeCardMedia entity={escuderia} />
      <div className="home-badge-row">
        {escuderia.siglas ? <span className="home-type-badge">{escuderia.siglas}</span> : null}
        <span className="home-meta-badge">{escuderia.categoria?.competicion || 'F1'}</span>
      </div>
      <h3>{escuderia.nombre}</h3>
      <p className="home-card-subtitle">{escuderia.pais}</p>
      <p><strong>Motor:</strong> {escuderia.motor || 'N/A'}</p>
      <p><strong>Jefe de equipo:</strong> {escuderia.jefe || 'N/A'}</p>
      <p>
        <strong>Puntos:</strong>{' '}
        <span className="f1-pts">
          {puntos ?? escuderia.puntos ?? 0} PTS
        </span>
      </p>
    </article>
  );
};

/* ── CatalogCard dispatcher ───────────────────────────────── */
/**
 * Renders the right card for a given catalog item type.
 * Returns a fully-styled <article> (or <PilotCard>/<TeamCard>).
 */
export const CatalogCard = ({ item, onSelectTicket }) => {
  switch (item.type) {
    case 'ticket':
      return (
        <article className="f1-card home-card home-ticket-card">
          <TicketCardBody ticket={item} onSelectTicket={onSelectTicket} />
        </article>
      );
    case 'race':
      return (
        <article className="f1-card home-card">
          <RaceCardBody race={item} />
        </article>
      );
    case 'circuit':
      return (
        <article className="f1-card home-card">
          <CircuitCardBody circuit={item} />
        </article>
      );
    case 'pilot':
      return <PilotCard piloto={item} />;
    case 'escuderia':
      return <TeamCard escuderia={item} />;
    default:
      return (
        <article className="f1-card home-card">
          <h3>{item.title || item.nombre}</h3>
        </article>
      );
  }
};
