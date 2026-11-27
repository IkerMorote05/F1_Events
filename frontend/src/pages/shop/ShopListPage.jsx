import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { HomeCatalogResults } from '../../features/home/HomeCatalogResults';
import { HomeFilters } from '../../features/home/HomeFilters';
import { useShopCatalog } from '../../hooks/useShopCatalog';
import { useShopHomeResource } from '../../hooks/useShopHome';

export const ShopListPage = () => {
  const navigate = useNavigate();
  const catalog = useShopCatalog({ syncWithUrl: true });
  const { data: categories } = useShopHomeResource('categories', {
    initialData: { global: [], circuit: [] }
  });
  const { data: localizaciones } = useShopHomeResource('localizaciones', {
    initialData: []
  });

  const handleSelectTicket = (slug) => {
    navigate(`/shop/${encodeURIComponent(slug)}`);
  };

  return (
    <section className="page-container home-page">
      <header className="page-header home-hero">
        <div>
          <p className="piloto-eyebrow">FIA Formula One · Tienda</p>
          <h1>Catálogo oficial</h1>
          <p>
            Busca y filtra entradas, carreras, circuitos, pilotos y escuderías activas.
          </p>
        </div>
        <Link to="/" className="btn-outline-red home-hero-cta">
          <Home size={17} aria-hidden="true" />
          <span>Volver al inicio</span>
        </Link>
      </header>

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
          filters={catalog.filters}
          categories={categories}
          localizaciones={localizaciones || []}
          hasActiveFilters={catalog.hasActiveFilters}
          hasInvalidPriceRange={catalog.hasInvalidPriceRange}
          onUpdateFilters={catalog.updateFilters}
          onToggleCategory={catalog.toggleCategory}
          onResetFilters={catalog.resetFilters}
        />
      </div>
    </section>
  );
};

export default ShopListPage;
