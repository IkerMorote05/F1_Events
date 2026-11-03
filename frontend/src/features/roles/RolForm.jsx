import React, { useEffect, useState } from 'react';
import { rolSchema } from './rolSchema';

export const RolForm = ({ initialData, submitting, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({ nombre: '', description: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData({
      nombre: initialData?.nombre || '',
      description: initialData?.description || ''
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
    const result = rolSchema.safeParse(formData);
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
      <label htmlFor="rol-nombre">Nombre</label>
      <input id="rol-nombre" name="nombre" value={formData.nombre} onChange={handleChange}
        disabled={submitting} {...fieldProps('nombre')} />
      {fieldError('nombre')}

      <label htmlFor="rol-description">Descripción</label>
      <input id="rol-description" name="description" value={formData.description}
        onChange={handleChange} disabled={submitting} {...fieldProps('description')} />
      {fieldError('description')}

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
