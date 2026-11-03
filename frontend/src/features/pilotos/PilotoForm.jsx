import React, { useEffect, useState } from 'react';
import { pilotoSchema } from './pilotoSchema';

const emptyForm = {
  nombre: '',
  apellidos: '',
  numero: '',
  nacionalidad: '',
  puntos: '0',
  victorias: '0',
  podios: '0',
  escuderia: '',
  categoria: '',
  fecha_nacimiento: ''
};

const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');
const getReferenceId = (value) => value?._id || value || '';

export const PilotoForm = ({ initialData, escuderias, categorias, submitting, onSubmit, onCancel }) => {
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
          victorias: String(initialData.victorias ?? 0),
          podios: String(initialData.podios ?? 0),
          escuderia: getReferenceId(initialData.escuderia),
          categoria: getReferenceId(initialData.categoria),
          fecha_nacimiento: toDateInput(initialData.fecha_nacimiento)
        }
      : { ...emptyForm, escuderia: escuderias[0]?._id || '' });
    setErrors({});
  }, [initialData, escuderias]);

  useEffect(() => {
    if (initialData) return;
    setFormData((current) => (
      current.categoria || !categorias.length
        ? current
        : { ...current, categoria: categorias[0]._id }
    ));
  }, [categorias, initialData]);

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

    const { fecha_nacimiento, ...payload } = result.data;
    await onSubmit(fecha_nacimiento ? { ...payload, fecha_nacimiento } : payload);
  };

  const renderFieldError = (name) => errors[name]
    ? <p className="piloto-field-error" id={`${name}-error`}>{errors[name]}</p>
    : null;

  return (
    <form className="piloto-form" onSubmit={handleSubmit} noValidate>
      {categorias.length === 0
        ? <p className="piloto-field-error">No hay categorías globales disponibles.</p>
        : null}

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

      <label htmlFor="victorias">Victorias</label>
      <input id="victorias" name="victorias" type="number" min="0" step="1" value={formData.victorias}
        onChange={handleChange} aria-invalid={Boolean(errors.victorias)}
        aria-describedby={errors.victorias ? 'victorias-error' : undefined} />
      {renderFieldError('victorias')}

      <label htmlFor="podios">Podios</label>
      <input id="podios" name="podios" type="number" min="0" step="1" value={formData.podios}
        onChange={handleChange} aria-invalid={Boolean(errors.podios)}
        aria-describedby={errors.podios ? 'podios-error' : undefined} />
      {renderFieldError('podios')}

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

      <label htmlFor="categoria">Categoría</label>
      <select id="categoria" name="categoria" value={formData.categoria} onChange={handleChange}
        aria-invalid={Boolean(errors.categoria)}
        aria-describedby={errors.categoria ? 'categoria-error' : undefined}>
        <option value="">-- Selecciona una categoría --</option>
        {categorias.map((categoria) => (
          <option key={categoria._id} value={categoria._id}
            disabled={Boolean(categoria.deletedAt && categoria._id !== formData.categoria)}>
            {categoria.competicion}{categoria.deletedAt ? ' (eliminada)' : ''}
          </option>
        ))}
      </select>
      {renderFieldError('categoria')}

      <div className="modal-actions">
        <button type="submit" className="btn-primary"
          disabled={submitting || !categorias.length}>
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
      </div>
    </form>
  );
};
