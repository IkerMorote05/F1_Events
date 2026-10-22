import React from 'react';

export const PilotoError = ({ message, onRetry, resourceName = 'pilotos' }) => (
  <div className="piloto-error" role="alert">
    <p>{message}</p>
    {onRetry && (
      <button type="button" className="btn-secondary" onClick={onRetry} aria-label={`Reintentar carga de ${resourceName}`}>
        Reintentar
      </button>
    )}
  </div>
);
