import React, { useEffect, useState } from 'react';
import { pilotoSchema } from './pilotoSchema';

const emptyForm = {
  nombre: '',
  apellidos: '',
  numero: '',
  nacionalidad: '',
  puntos: '0',
  escuderia: '',
  fecha_nacimiento: ''
};

const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');

export const PilotoForm = ({ initialData, escuderias, submitting, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(initialData
      ? {
          nombre: initialData.nombre || '',
          apellidos: initialData.apellidos || '',
          numero: String(initialData.numero ?? ''),
          nacionalidad: initialData.nacionalidad || '',
          puntos: String(initialData.puntos ?? 0),
          escuderia: initialData.escuderia?._id || initialData.escuderia || '',
          fecha_nacimiento: toDateInput(initialData.fecha_nacimiento)
        }
      : { ...emptyForm, escuderia: escuderias[0]?._id || '' });
    setErrors({});
  }, [initialData, escuderias]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = pilotoSchema.safeParse(formData);

    if (!result.success) {
      const nextErrors = {};
      result.error.issues.forEach((issue) => {
        nextErrors[issue.path[0]] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    await onSubmit({
      ...result.data,
      fecha_nacimiento: result.data.fecha_nacimiento || null
    });
  };

  const renderFieldError = (name) => errors[name]
    ? <p className="piloto-field-error" id={`${name}-error`}>{errors[name]}</p>
    : null;

  return (
    <form className="piloto-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="nombre">Nombre</label>
      <input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange}
        aria-invalid={Boolean(errors.nombre)} aria-describedby={errors.nombre ? 'nombre-error' : undefined} />
      {renderFieldError('nombre')}

      <label htmlFor="apellidos">Apellidos</label>
      <input id="apellidos" name="apellidos" value={formData.apellidos} onChange={handleChange} />

      <label htmlFor="numero">Número</label>
      <input id="numero" name="numero" type="number" min="0" step="1" value={formData.numero}
        onChange={handleChange} aria-invalid={Boolean(errors.numero)}
        aria-describedby={errors.numero ? 'numero-error' : undefined} />
      {renderFieldError('numero')}

      <label htmlFor="nacionalidad">Nacionalidad</label>
      <input id="nacionalidad" name="nacionalidad" value={formData.nacionalidad} onChange={handleChange}
        aria-invalid={Boolean(errors.nacionalidad)}
        aria-describedby={errors.nacionalidad ? 'nacionalidad-error' : undefined} />
      {renderFieldError('nacionalidad')}

      <label htmlFor="fecha_nacimiento">Fecha de nacimiento</label>
      <input id="fecha_nacimiento" name="fecha_nacimiento" type="date"
        value={formData.fecha_nacimiento} onChange={handleChange} />

      <label htmlFor="puntos">Puntos</label>
      <input id="puntos" name="puntos" type="number" min="0" step="1" value={formData.puntos}
        onChange={handleChange} aria-invalid={Boolean(errors.puntos)}
        aria-describedby={errors.puntos ? 'puntos-error' : undefined} />
      {renderFieldError('puntos')}

      <label htmlFor="escuderia">Escudería</label>
      <select id="escuderia" name="escuderia" value={formData.escuderia} onChange={handleChange}
        aria-invalid={Boolean(errors.escuderia)}
        aria-describedby={errors.escuderia ? 'escuderia-error' : undefined}>
        <option value="">-- Selecciona una escudería --</option>
        {escuderias.map((escuderia) => (
          <option key={escuderia._id} value={escuderia._id}>{escuderia.nombre}</option>
        ))}
      </select>
      {renderFieldError('escuderia')}

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
