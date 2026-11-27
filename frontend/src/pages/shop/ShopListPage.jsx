import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Menu } from 'lucide-react';
import { HomeCatalogResults } from '../../features/home/HomeCatalogResults';
import { HomeFilters } from '../../features/home/HomeFilters';
import { useShopCatalog } from '../../hooks/useShopCatalog';
import { useShopHomeResource } from '../../hooks/useShopHome';

export const ShopListPage = () => {
  const navigate = useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const catalog = useShopCatalog({ syncWithUrl: true });
  const { data: categories } = useShopHomeResource('categories', {
    initialData: { global: [], circuit: [] }
  });
  const { data: localizaciones } = useShopHomeResource('localizaciones', {
    initialData: []
  });
  const { data: escuderias } = useShopHomeResource('escuderias', {
    initialData: []
  });

  const handleSelectTicket = (slug) => {
    navigate(`/shop/${encodeURIComponent(slug)}`);
  };

  return (
    <section className="page-container home-page shop-page">
      <header className="page-header home-hero">
        <div>
          <p className="piloto-eyebrow">FIA Formula One · Tienda</p>
          <h1>Catálogo oficial</h1>
          <p>
            Busca y filtra entradas, carreras, circuitos, pilotos y escuderías activas.
          </p>
        </div>
        <div className="shop-header-actions">
          <button
            type="button"
            className="btn-outline-red shop-filters-toggle"
            aria-expanded={filtersOpen}
            aria-controls="shop-filters"
            onClick={() => setFiltersOpen((current) => !current)}
          >
            <Menu size={17} aria-hidden="true" />
            <span>Filtros</span>
          </button>
          <Link to="/" className="btn-outline-red home-hero-cta">
            <Home size={17} aria-hidden="true" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </header>

      {filtersOpen ? (
        <button
          type="button"
          className="shop-filters-backdrop"
          aria-label="Cerrar filtros"
          onClick={() => setFiltersOpen(false)}
        />
      ) : null}

      <div className="home-layout">
        <div className="home-content">
          <HomeCatalogResults
            items={catalog.items}
            pagination={catalog.pagination}
            loading={catalog.loading}
            error={catalog.error}
            hasActiveFilters={catalog.hasActiveFilters}
            hasInvalidPriceRange={catalog.hasInvalidPriceRange}
            onRetry={catalog.reload}
            onPageChange={(offset) => catalog.updateFilters({ offset })}
            onSelectTicket={handleSelectTicket}
            onResetFilters={catalog.resetFilters}
          />
        </div>

        <HomeFilters
          id="shop-filters"
          mobileOpen={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          filters={catalog.filters}
          categories={categories}
          escuderias={escuderias || []}
          localizaciones={localizaciones || []}
          hasActiveFilters={catalog.hasActiveFilters}
          hasInvalidPriceRange={catalog.hasInvalidPriceRange}
          onUpdateFilters={catalog.updateFilters}
          onToggleCategory={catalog.toggleCategory}
          onToggleEscuderia={catalog.toggleEscuderia}
          onToggleSort={catalog.toggleSort}
          onResetFilters={catalog.resetFilters}
        />
      </div>
    </section>
  );
};

export default ShopListPage;
