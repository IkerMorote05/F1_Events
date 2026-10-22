import React from 'react';

export const PilotoSkeleton = ({ resourceName = 'pilotos' }) => (
  <div className="page-container" role="status" aria-label={`Cargando ${resourceName}`}>
    <div className="piloto-skeleton-header" />
    <div className="piloto-skeleton-stats">
      {[1, 2, 3].map((item) => <div className="piloto-skeleton-stat" key={item} />)}
    </div>
    <div className="piloto-skeleton-table">
      {[1, 2, 3, 4].map((item) => <div className="piloto-skeleton-row" key={item} />)}
    </div>
  </div>
);
