import React, { useEffect, useState } from 'react';
import { categoriaGlobalSchema } from './categoriaGlobalSchema';

export const CategoriaGlobalForm = ({ initialData, submitting, onSubmit, onCancel }) => {
  const [competicion, setCompeticion] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setCompeticion(initialData?.competicion || '');
    setIsActive(initialData?.isActive !== false);
    setError('');
  }, [initialData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = categoriaGlobalSchema.safeParse({ competicion, isActive });

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

      <label htmlFor="categoria-global-isActive">Estado de la ficha</label>
      <select id="categoria-global-isActive" value={String(isActive)}
        onChange={(event) => setIsActive(event.target.value === 'true')} disabled={submitting}>
        <option value="true">Activa</option>
        <option value="false">Inactiva</option>
      </select>

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
