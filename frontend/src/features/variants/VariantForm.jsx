import React, { useEffect, useState } from 'react';
import { variantSchema } from './variantSchema';

export const VariantForm = ({ initialData, submitting, onSubmit, onCancel }) => {
  const [sku, setSku] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setSku(initialData?.sku || '');
    setError('');
  }, [initialData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = variantSchema.safeParse({ sku });
    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Revisa el SKU.');
      return;
    }

    setError('');
    await onSubmit(result.data);
  };

  return (
    <form className="piloto-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="variant-sku">SKU</label>
      <input
        id="variant-sku"
        name="sku"
        value={sku}
        onChange={(event) => {
          setSku(event.target.value);
          setError('');
        }}
        disabled={submitting}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'variant-sku-error' : undefined}
      />
      {error ? <p className="piloto-field-error" id="variant-sku-error">{error}</p> : null}

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
