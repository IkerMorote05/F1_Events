import React, { useEffect, useState } from 'react';
import { escuderiaSchema } from './escuderiaSchema';

const emptyForm = {
  nombre: '',
  pais: '',
  motor: '',
  jefe: '',
  año: ''
};

export const EscuderiaForm = ({ initialData, submitting, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(initialData
      ? {
          nombre: initialData.nombre || '',
          pais: initialData.pais || '',
          motor: initialData.motor || '',
          jefe: initialData.jefe || initialData.jefeEquipo || '',
          año: String(initialData.año ?? initialData.anioFundacion ?? '')
        }
      : { ...emptyForm });
    setErrors({});
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = escuderiaSchema.safeParse(formData);

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

  return (
    <form className="piloto-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="nombre">Nombre</label>
      <input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange}
        aria-invalid={Boolean(errors.nombre)} aria-describedby={errors.nombre ? 'nombre-error' : undefined} />
      {fieldError('nombre')}

      <label htmlFor="pais">País</label>
      <input id="pais" name="pais" value={formData.pais} onChange={handleChange}
        aria-invalid={Boolean(errors.pais)} aria-describedby={errors.pais ? 'pais-error' : undefined} />
      {fieldError('pais')}

      <label htmlFor="motor">Motor</label>
      <input id="motor" name="motor" value={formData.motor} onChange={handleChange}
        aria-invalid={Boolean(errors.motor)} aria-describedby={errors.motor ? 'motor-error' : undefined} />
      {fieldError('motor')}

      <label htmlFor="jefe">Jefe de equipo</label>
      <input id="jefe" name="jefe" value={formData.jefe} onChange={handleChange} />

      <label htmlFor="año">Año de fundación</label>
      <input id="año" name="año" type="number" min="1900" step="1" value={formData.año}
        onChange={handleChange} aria-invalid={Boolean(errors.año)}
        aria-describedby={errors.año ? 'año-error' : undefined} />
      {fieldError('año')}

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
