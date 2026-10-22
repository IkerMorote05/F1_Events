import React, { useEffect, useState } from 'react';
import { carreraSchema } from './carreraSchema';

const emptyForm = {
  nombre: '',
  fecha: '',
  capacidad: '',
  circuito: ''
};

export const CarreraForm = ({ initialData, circuitos, submitting, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(initialData
      ? {
          nombre: initialData.nombre || '',
          fecha: initialData.fecha ? new Date(initialData.fecha).toISOString().slice(0, 10) : '',
          capacidad: String(initialData.capacidad ?? ''),
          circuito: initialData.circuito?._id || initialData.circuito || ''
        }
      : { ...emptyForm, circuito: circuitos[0]?._id || '' });
    setErrors({});
  }, [initialData, circuitos]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = carreraSchema.safeParse(formData);

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
      <label htmlFor="nombre">Nombre</label>
      <input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} {...fieldProps('nombre')} />
      {fieldError('nombre')}

      <label htmlFor="fecha">Fecha</label>
      <input id="fecha" name="fecha" type="date" value={formData.fecha} onChange={handleChange}
        {...fieldProps('fecha')} />
      {fieldError('fecha')}

      <label htmlFor="capacidad">Capacidad</label>
      <input id="capacidad" name="capacidad" type="number" min="0" step="1" value={formData.capacidad}
        onChange={handleChange} {...fieldProps('capacidad')} />
      {fieldError('capacidad')}

      <label htmlFor="circuito">Circuito</label>
      <select id="circuito" name="circuito" value={formData.circuito} onChange={handleChange}
        {...fieldProps('circuito')}>
        <option value="">-- Selecciona un circuito --</option>
        {circuitos.map((circuito) => (
          <option key={circuito._id} value={circuito._id} disabled={Boolean(circuito.deletedAt)}>
            {circuito.nombre}{circuito.deletedAt ? ' (eliminado)' : ''}
          </option>
        ))}
      </select>
      {fieldError('circuito')}

      {circuitos.length === 0 ? <p className="piloto-field-error">Registra un circuito antes de crear una carrera.</p> : null}

      <div className="modal-actions">
        <button type="submit" className="btn-primary" disabled={submitting || circuitos.length === 0}>
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
      </div>
    </form>
  );
};
