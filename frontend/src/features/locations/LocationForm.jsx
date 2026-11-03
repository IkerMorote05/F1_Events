import React, { useEffect, useState } from 'react';
import { locationSchema } from './locationSchema';

export const LocationForm = ({ initialData, submitting, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({ pais: '', ciudad: '', capital: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData({
      pais: initialData?.pais || '',
      ciudad: initialData?.ciudad || '',
      capital: initialData?.capital || ''
    });
    setErrors({});
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = locationSchema.safeParse(formData);
    if (!result.success) {
      const nextErrors = {};
      result.error.issues.forEach((issue) => {
        nextErrors[issue.path[0]] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    await onSubmit(result.data);
  };

  const fieldError = (name) => errors[name]
    ? <p className="piloto-field-error" id={`${name}-error`}>{errors[name]}</p>
    : null;
  const fieldProps = (name) => ({
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-error` : undefined
  });

  return (
    <form className="piloto-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="location-pais">País</label>
      <input id="location-pais" name="pais" value={formData.pais} onChange={handleChange}
        disabled={submitting} {...fieldProps('pais')} />
      {fieldError('pais')}

      <label htmlFor="location-ciudad">Ciudad</label>
      <input id="location-ciudad" name="ciudad" value={formData.ciudad} onChange={handleChange}
        disabled={submitting} {...fieldProps('ciudad')} />
      {fieldError('ciudad')}

      <label htmlFor="location-capital">Capital</label>
      <input id="location-capital" name="capital" value={formData.capital} onChange={handleChange}
        disabled={submitting} {...fieldProps('capital')} />
      {fieldError('capital')}

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
