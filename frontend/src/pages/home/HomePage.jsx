import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trophy } from 'lucide-react';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { HomeSections } from '../../features/home/HomeSections';
import { useShopHome } from '../../hooks/useShopHome';

export const HomePage = () => {
  const navigate = useNavigate();
  const { data, errors, loading, error, reload, reloadResource } = useShopHome();

  if (loading) return <PilotoSkeleton resourceName="inicio" />;
  if (error) return <PilotoError resourceName="inicio" message={error} onRetry={reload} />;

  const handleSelectTicket = (slug) => {
    navigate(`/shop/${encodeURIComponent(slug)}`);
  };

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
        <div className="home-hero-actions">
          <Link to="/shop" className="btn-outline-red home-hero-cta">
            <ShoppingBag size={17} aria-hidden="true" />
            <span>Explorar catálogo</span>
          </Link>
          <Link to="/clasificacion" className="btn-outline-red home-hero-cta">
            <Trophy size={17} aria-hidden="true" />
            <span>Ver clasificación</span>
          </Link>
        </div>
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

      <HomeSections
        data={data}
        errors={errors}
        onRetryResource={reloadResource}
        onSelectTicket={handleSelectTicket}
      />
    </section>
  );
};

export default HomePage;
