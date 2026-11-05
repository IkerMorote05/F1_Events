import React, { useEffect, useState } from 'react';
import { escuderiaImageSchema, escuderiaSchema } from './escuderiaSchema';
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
  const [images, setImages] = useState([]);
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
    setImages(Array.isArray(initialData?.images)
      ? initialData.images.map(({ _id, image_url, alt_text }) => ({
          _id,
          image_url: image_url || '',
          alt_text: alt_text || ''
        }))
      : []);
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

  const handleImageChange = (index, field, value) => {
    setImages((current) => current.map((image, imageIndex) => (
      imageIndex === index ? { ...image, [field]: value } : image
    )));
    setErrors((current) => ({ ...current, [`image-${index}-${field}`]: undefined }));
  };

  const removeImage = (index) => {
    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
    setErrors((current) => Object.fromEntries(
      Object.entries(current).filter(([name]) => !name.startsWith('image-'))
    ));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = escuderiaSchema.safeParse(formData);
    const imageResults = images.map((image) => escuderiaImageSchema.safeParse(image));
    const nextErrors = {};

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        nextErrors[issue.path[0]] = issue.message;
      });
    }
    imageResults.forEach((image, index) => {
      if (!image.success) {
        image.error.issues.forEach((issue) => {
          nextErrors[`image-${index}-${issue.path[0]}`] = issue.message;
        });
      }
    });

    if (!result.success || imageResults.some((image) => !image.success)) {
      setErrors(nextErrors);
      return;
    }

    const imagesToSave = imageResults.map((image, position) => ({
      ...image.data,
      position
    }));
    await onSubmit(result.data, imagesToSave);
  };

  const fieldError = (name) => errors[name]
    ? <p className="piloto-field-error" id={`${name}-error`}>{errors[name]}</p>
    : null;
  const imageFieldError = (index, field) => {
    const name = `image-${index}-${field}`;
    return errors[name]
      ? <p className="piloto-field-error" id={`${name}-error`}>{errors[name]}</p>
      : null;
  };
  const isHttpUrl = (value) => {
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  };

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

      <section className="piloto-images-section" aria-labelledby="escuderia-images-title">
        <div className="piloto-images-header">
          <div>
            <h2 id="escuderia-images-title">Imágenes de la escudería</h2>
            <p>Añade cero o más imágenes mediante una URL pública.</p>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setImages((current) => [...current, { image_url: '', alt_text: '' }])}
            disabled={submitting}
          >
            Añadir imagen
          </button>
        </div>

        {images.map((image, index) => (
          <fieldset className="piloto-image-item" key={image._id || `new-image-${index}`}>
            <legend>Imagen {index + 1}</legend>
            <label htmlFor={`escuderia-image-${index}-url`}>
              URL de la imagen
              <input
                id={`escuderia-image-${index}-url`}
                type="url"
                value={image.image_url}
                onChange={(event) => handleImageChange(index, 'image_url', event.target.value)}
                aria-invalid={Boolean(errors[`image-${index}-image_url`])}
                aria-describedby={errors[`image-${index}-image_url`] ? `image-${index}-image_url-error` : undefined}
                disabled={submitting}
              />
              {imageFieldError(index, 'image_url')}
            </label>

            <label htmlFor={`escuderia-image-${index}-alt`}>
              Texto alternativo
              <input
                id={`escuderia-image-${index}-alt`}
                value={image.alt_text}
                onChange={(event) => handleImageChange(index, 'alt_text', event.target.value)}
                disabled={submitting}
              />
            </label>

            <div className="piloto-image-preview">
              {isHttpUrl(image.image_url)
                ? <img src={image.image_url} alt={image.alt_text} loading="lazy" />
                : <span>Vista previa no disponible</span>}
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => removeImage(index)}
              disabled={submitting}
              aria-label={`Quitar imagen ${index + 1}`}
            >
              Quitar imagen
            </button>
          </fieldset>
        ))}
      </section>

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
