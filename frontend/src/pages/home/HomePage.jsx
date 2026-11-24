import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { HomeCatalogResults } from '../../features/home/HomeCatalogResults';
import { HomeFilters } from '../../features/home/HomeFilters';
import { HomeSections } from '../../features/home/HomeSections';
import { TicketDetailModal } from '../../features/home/TicketDetailModal';
import { useShopCatalog } from '../../hooks/useShopCatalog';
import { useShopHome } from '../../hooks/useShopHome';

export const HomePage = () => {
  const { data, errors, loading, error, reload, reloadResource } = useShopHome();
  const catalog = useShopCatalog();
  const [selectedTicketSlug, setSelectedTicketSlug] = useState(null);

  if (loading) return <PilotoSkeleton resourceName="inicio" />;
  if (error) return <PilotoError resourceName="inicio" message={error} onRetry={reload} />;

  return (
    <section className="page-container home-page">
      <header className="page-header home-hero">
        <div>
          <p className="piloto-eyebrow">FIA Formula One · Portal &amp; Entradas</p>
          <h1>Temporada y catálogo oficial</h1>
          <p>
            Explora entradas disponibles, próximas carreras, circuitos, pilotos y escuderías activas.
          </p>
        </div>
        <Link to="/clasificacion" className="btn-outline-red home-hero-cta">
          <Trophy size={17} aria-hidden="true" />
          <span>Ver clasificación</span>
        </Link>
      </header>

      <div className="home-stats-row" aria-label="Resumen del catálogo">
        <article className="home-stat-card">
          <span className="home-stat-label">Entradas disponibles</span>
          <strong className="home-stat-value">{data.tickets?.length || 0}</strong>
        </article>
        <article className="home-stat-card">
          <span className="home-stat-label">Carreras activas</span>
          <strong className="home-stat-value">{data.races?.length || 0}</strong>
        </article>
        <article className="home-stat-card">
          <span className="home-stat-label">Circuitos</span>
          <strong className="home-stat-value">{data.circuits?.length || 0}</strong>
        </article>
        <article className="home-stat-card">
          <span className="home-stat-label">Pilotos y escuderías</span>
          <strong className="home-stat-value">{(data.pilots?.length || 0) + (data.escuderias?.length || 0)}</strong>
        </article>
      </div>

      <div className="home-layout">
        <div className="home-content">
          {catalog.hasActiveFilters ? (
            <HomeCatalogResults
              items={catalog.items}
              pagination={catalog.pagination}
              loading={catalog.loading}
              error={catalog.error}
              hasInvalidPriceRange={catalog.hasInvalidPriceRange}
              onRetry={catalog.reload}
              onPageChange={(offset) => catalog.updateFilters({ offset })}
              onSelectTicket={setSelectedTicketSlug}
              onResetFilters={catalog.resetFilters}
            />
          ) : (
            <HomeSections
              data={data}
              errors={errors}
              onRetryResource={reloadResource}
              onSelectTicket={setSelectedTicketSlug}
            />
          )}
        </div>

        <HomeFilters
          filters={catalog.filters}
          categories={data.categories}
          localizaciones={data.localizaciones || []}
          hasActiveFilters={catalog.hasActiveFilters}
          hasInvalidPriceRange={catalog.hasInvalidPriceRange}
          onUpdateFilters={catalog.updateFilters}
          onToggleCategory={catalog.toggleCategory}
          onResetFilters={catalog.resetFilters}
        />
      </div>

      <TicketDetailModal
        slug={selectedTicketSlug}
        onSelectVariant={setSelectedTicketSlug}
        onClose={() => setSelectedTicketSlug(null)}
      />
    </section>
  );
};

export default HomePage;
