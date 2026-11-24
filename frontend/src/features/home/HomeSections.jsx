import React from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Flag, Route, Ticket, Trophy } from 'lucide-react';
import { CardCarousel } from '../../components/CardCarousel';
import { PilotoError } from '../../components/PilotoError';
import { calculateEscuderiaPoints } from '../../utils/escuderiaPoints';
import {
  CircuitCardBody,
  HomeCardMedia,
  PilotCard,
  RaceCardBody,
  TeamCard,
  TicketCardBody
} from './HomeCards';

/* ── Section header with inline carousel controls ─────────── */
const SectionHeader = ({ icon: Icon, title, subtitle, count, carouselProps }) => {
  const { hasOverflow, canScrollLeft, canScrollRight, scrollLeft, scrollRight } =
    carouselProps || {};

  return (
    <div className="home-section-header">
      <div className="home-section-title">
        <span className="profile-section-icon" aria-hidden="true">
          <Icon size={18} />
        </span>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="home-section-header-right">
        <span className="home-count-badge">{count}</span>
        {hasOverflow ? (
          <>
            <button
              type="button"
              className="f1-carousel-btn"
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              aria-label={`Retroceder en ${title}`}
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="f1-carousel-btn"
              onClick={scrollRight}
              disabled={!canScrollRight}
              aria-label={`Avanzar en ${title}`}
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

/* ── Helper: render a section with optional carousel or error ── */
const CarouselSection = ({ ariaLabel, icon, title, subtitle, items, error, errorKey, onRetryResource, renderCard }) => {
  if (error) {
    return (
      <section className="home-section" aria-label={ariaLabel}>
        <SectionHeader icon={icon} title={title} subtitle={subtitle} count={0} />
        <PilotoError
          resourceName={title.toLowerCase()}
          message={error}
          onRetry={() => onRetryResource(errorKey)}
        />
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="home-section" aria-label={ariaLabel}>
        <SectionHeader icon={icon} title={title} subtitle={subtitle} count={0} />
        <p className="home-empty-text">No hay {title.toLowerCase()} registrados en este momento.</p>
      </section>
    );
  }

  return (
    <section className="home-section" aria-label={ariaLabel}>
      <CardCarousel
        label={title.toLowerCase()}
        renderHeader={(carouselProps) => (
          <SectionHeader
            icon={icon}
            title={title}
            subtitle={subtitle}
            count={items.length}
            carouselProps={carouselProps}
          />
        )}
      >
        {items.map(renderCard)}
      </CardCarousel>
    </section>
  );
};

/* ── Main component ───────────────────────────────────────── */
export const HomeSections = ({ data, errors, onRetryResource, onSelectTicket }) => {
  const tickets = data.tickets || [];
  const races = data.races || [];
  const circuits = data.circuits || [];
  const pilots = [...(data.pilots || [])].sort((a, b) => (b.puntos || 0) - (a.puntos || 0));
  const escuderias = data.escuderias || [];

  const puntosPorEscuderia = calculateEscuderiaPoints(pilots);
  const escuderiasOrdenadas = [...escuderias]
    .map((e) => ({ ...e, puntos: puntosPorEscuderia.get(String(e._id)) || 0 }))
    .sort((a, b) => b.puntos - a.puntos);

  return (
    <div className="home-sections">
      {/* ── Entradas ──────────────────────────────── */}
      <CarouselSection
        ariaLabel="Entradas disponibles"
        icon={Ticket}
        title="Entradas disponibles"
        subtitle="Pases activos con disponibilidad calculada por carrera y circuito."
        items={tickets}
        error={errors.tickets}
        errorKey="tickets"
        onRetryResource={onRetryResource}
        renderCard={(ticket) => (
          <article key={ticket._id} className="f1-card home-card home-ticket-card">
            <TicketCardBody ticket={ticket} onSelectTicket={onSelectTicket} />
          </article>
        )}
      />

      {/* ── Carreras ──────────────────────────────── */}
      <CarouselSection
        ariaLabel="Carreras del calendario"
        icon={CalendarDays}
        title="Carreras"
        subtitle="Grandes premios activos del calendario oficial."
        items={races}
        error={errors.races}
        errorKey="races"
        onRetryResource={onRetryResource}
        renderCard={(race) => (
          <article key={race._id} className="f1-card home-card">
            <RaceCardBody race={race} />
          </article>
        )}
      />

      {/* ── Circuitos ─────────────────────────────── */}
      <CarouselSection
        ariaLabel="Circuitos activos"
        icon={Route}
        title="Circuitos"
        subtitle="Trazados, especificaciones técnicas y vueltas rápidas."
        items={circuits}
        error={errors.circuits}
        errorKey="circuits"
        onRetryResource={onRetryResource}
        renderCard={(circuit) => (
          <article key={circuit._id} className="f1-card home-card">
            <CircuitCardBody circuit={circuit} />
          </article>
        )}
      />

      {/* ── Pilotos ───────────────────────────────── */}
      <CarouselSection
        ariaLabel="Pilotos activos"
        icon={Trophy}
        title="Pilotos destacados"
        subtitle="Parrilla activa ordenada por puntuación del campeonato."
        items={pilots}
        error={errors.pilots}
        errorKey="pilots"
        onRetryResource={onRetryResource}
        renderCard={(piloto) => (
          <PilotCard key={piloto._id} piloto={piloto} />
        )}
      />

      {/* ── Escuderías ────────────────────────────── */}
      <CarouselSection
        ariaLabel="Escuderías activas"
        icon={Flag}
        title="Escuderías"
        subtitle="Equipos participantes y puntos acumulados."
        items={escuderiasOrdenadas}
        error={errors.escuderias}
        errorKey="escuderias"
        onRetryResource={onRetryResource}
        renderCard={(escuderia) => (
          <TeamCard key={escuderia._id} escuderia={escuderia} puntos={escuderia.puntos} />
        )}
      />
    </div>
  );
};
