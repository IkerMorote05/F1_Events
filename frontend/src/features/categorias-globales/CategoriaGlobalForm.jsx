import React, { useEffect, useState } from 'react';
import { categoriaGlobalSchema } from './categoriaGlobalSchema';

export const CategoriaGlobalForm = ({ initialData, submitting, onSubmit, onCancel }) => {
  const [competicion, setCompeticion] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setCompeticion(initialData?.competicion || '');
    setError('');
  }, [initialData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = categoriaGlobalSchema.safeParse({ competicion });

    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Revisa el nombre de la competición.');
      return;
    }

    setError('');
    await onSubmit(result.data);
  };

  return (
    <form className="piloto-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="categoria-global-competicion">Nombre de la competición</label>
      <input
        id="categoria-global-competicion"
        name="competicion"
        value={competicion}
        onChange={(event) => {
          setCompeticion(event.target.value);
          setError('');
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'categoria-global-error' : undefined}
        disabled={submitting}
      />
      {error ? (
        <p className="piloto-field-error" id="categoria-global-error">{error}</p>
      ) : null}

      <div className="modal-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
      </div>
    </form>
  );
};
