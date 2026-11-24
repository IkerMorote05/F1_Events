import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { CatalogCard } from './HomeCards';

export const HomeCatalogResults = ({
  items,
  pagination,
  loading,
  error,
  hasInvalidPriceRange,
  onRetry,
  onPageChange,
  onSelectTicket,
  onResetFilters
}) => {
  if (hasInvalidPriceRange) {
    return (
      <section className="home-section" aria-label="Resultados filtrados del catálogo">
        <div className="home-empty-state">
          <p>Ajusta el rango de precios para mostrar los resultados.</p>
        </div>
      </section>
    );
  }
  if (loading) return <PilotoSkeleton resourceName="resultados del catálogo" />;
  if (error) return <PilotoError resourceName="catálogo" message={error} onRetry={onRetry} />;

  const total = pagination?.total || 0;
  const limit = pagination?.limit || 5;
  const offset = pagination?.offset || 0;
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total > 0 ? offset + 1 : 0;
  const to = Math.min(offset + items.length, total);

  return (
    <section className="home-section" aria-label="Resultados filtrados del catálogo">
      <div className="home-section-header">
        <div>
          <h2>Resultados del catálogo</h2>
          <p>
            {total > 0
              ? `Mostrando ${from}–${to} de ${total} ${total === 1 ? 'resultado' : 'resultados'}`
              : '0 resultados encontrados'}
          </p>
        </div>
        <div className="home-section-header-right">
          <button type="button" className="btn-secondary" onClick={onResetFilters}>
            Volver a portada
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="home-empty-state">
          <p>No se encontraron elementos con los filtros seleccionados.</p>
          <button type="button" className="btn-primary" onClick={onResetFilters}>
            Mostrar todo el Home
          </button>
        </div>
      ) : (
        <>
          <div className="home-results-grid">
            {items.map((item) => (
              <CatalogCard
                key={`${item.type}-${item._id}`}
                item={item}
                onSelectTicket={onSelectTicket}
              />
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="home-pagination" role="navigation" aria-label="Paginación de resultados">
              <button
                type="button"
                className="btn-secondary"
                disabled={offset <= 0}
                onClick={() => onPageChange(Math.max(0, offset - limit))}
              >
                <ChevronLeft size={16} aria-hidden="true" />
                <span>Anterior</span>
              </button>
              <span>Página {currentPage} de {totalPages}</span>
              <button
                type="button"
                className="btn-secondary"
                disabled={offset + limit >= total}
                onClick={() => onPageChange(offset + limit)}
              >
                <span>Siguiente</span>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
};
