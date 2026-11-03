import React, { useEffect, useState } from 'react';
import { escuderiaSchema } from './escuderiaSchema';
import { useCategoriasGlobales } from '../../hooks/useCategoriasGlobales';

const emptyForm = {
  nombre: '',
  pais: '',
  motor: '',
  categoria: '',
  siglas: '',
  jefe: '',
  año: ''
};
const getReferenceId = (value) => value?._id || value || '';

export const EscuderiaForm = ({ initialData, submitting, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const {
    items: categorias,
    loading: loadingCategorias,
    error: errorCategorias,
    load: reloadCategorias
  } = useCategoriasGlobales();

  useEffect(() => {
    setFormData(initialData
      ? {
          nombre: initialData.nombre || '',
          pais: initialData.pais || '',
          motor: initialData.motor || '',
          categoria: getReferenceId(initialData.categoria),
          siglas: initialData.siglas || '',
          jefe: initialData.jefe || initialData.jefeEquipo || '',
          año: String(initialData.año ?? initialData.anioFundacion ?? '')
        }
      : { ...emptyForm });
    setErrors({});
  }, [initialData]);

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
      {loadingCategorias ? <p>Cargando categorías...</p> : null}
      {errorCategorias ? (
        <div className="piloto-field-error">
          <p>{errorCategorias}</p>
          <button type="button" className="btn-secondary" onClick={reloadCategorias}>Reintentar</button>
        </div>
      ) : null}
      {!loadingCategorias && !errorCategorias && categorias.length === 0
        ? <p className="piloto-field-error">No hay categorías globales disponibles.</p>
        : null}

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

      <label htmlFor="categoria">Categoría</label>
      <select id="categoria" name="categoria" value={formData.categoria} onChange={handleChange}
        disabled={loadingCategorias || Boolean(errorCategorias)}
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
      {fieldError('categoria')}

      <label htmlFor="siglas">Siglas</label>
      <input id="siglas" name="siglas" value={formData.siglas} onChange={handleChange} />

      <label htmlFor="jefe">Jefe de equipo</label>
      <input id="jefe" name="jefe" value={formData.jefe} onChange={handleChange} />

      <label htmlFor="año">Año de fundación</label>
      <input id="año" name="año" type="number" min="1900" step="1" value={formData.año}
        onChange={handleChange} aria-invalid={Boolean(errors.año)}
        aria-describedby={errors.año ? 'año-error' : undefined} />
      {fieldError('año')}

      <div className="modal-actions">
        <button type="submit" className="btn-primary"
          disabled={submitting || loadingCategorias || Boolean(errorCategorias) || !categorias.length}>
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
      </div>
    </form>
  );
};
