import React, { useEffect, useState } from 'react';
import { categoriaCircuitosSchema } from './categoriaCircuitosSchema';

export const CategoriaCircuitosForm = ({ initialData, submitting, onSubmit, onCancel }) => {
  const [field, setField] = useState('tipo');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const fieldLocked = Boolean(initialData);

  useEffect(() => {
    const initialField = initialData?.tipo ? 'tipo' : 'desgaste';
    setField(initialData ? initialField : 'tipo');
    setValue(initialData?.[initialField] || '');
    setError('');
  }, [initialData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = categoriaCircuitosSchema.safeParse({ field, value });

    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Revisa los datos de la categoría.');
      return;
    }

    setError('');
    await onSubmit(result.data);
  };

  return (
    <form className="piloto-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="categoria-circuitos-field">Clase de categoría</label>
      <select
        id="categoria-circuitos-field"
        value={field}
        onChange={(event) => setField(event.target.value)}
        disabled={fieldLocked || submitting}
      >
        <option value="tipo">Tipo de circuito</option>
        <option value="desgaste">Desgaste</option>
      </select>

      <label htmlFor="categoria-circuitos-value">
        {field === 'tipo' ? 'Tipo' : 'Nivel de desgaste'}
      </label>
      <input
        id="categoria-circuitos-value"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setError('');
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'categoria-circuitos-error' : undefined}
        disabled={submitting}
      />
      {error ? (
        <p className="piloto-field-error" id="categoria-circuitos-error">{error}</p>
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
