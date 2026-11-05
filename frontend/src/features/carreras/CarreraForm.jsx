import React, { useEffect, useState } from 'react';
import { carreraImageSchema, carreraSchema } from './carreraSchema';

const emptyForm = {
  nombre: '',
  fecha: '',
  capacidad: '',
  circuito: ''
};

export const CarreraForm = ({ initialData, circuitos, submitting, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [images, setImages] = useState([]);
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
    setImages(Array.isArray(initialData?.images)
        ? initialData.images.map(({ _id, image_url, alt_text }) => ({
            _id,
            image_url: image_url || '',
            alt_text: alt_text || ''
          }))
        : []);
    setErrors({});
  }, [initialData, circuitos]);

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
    const result = carreraSchema.safeParse(formData);
    const imageResults = images.map((image) => carreraImageSchema.safeParse(image));
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

      <section className="piloto-images-section" aria-labelledby="carrera-images-title">
        <div className="piloto-images-header">
          <div>
            <h2 id="carrera-images-title">Imágenes de la carrera</h2>
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
            <label htmlFor={`carrera-image-${index}-url`}>
              URL de la imagen
              <input
                id={`carrera-image-${index}-url`}
                type="url"
                value={image.image_url}
                onChange={(event) => handleImageChange(index, 'image_url', event.target.value)}
                aria-invalid={Boolean(errors[`image-${index}-image_url`])}
                aria-describedby={errors[`image-${index}-image_url`] ? `image-${index}-image_url-error` : undefined}
                disabled={submitting}
              />
              {imageFieldError(index, 'image_url')}
            </label>

            <label htmlFor={`carrera-image-${index}-alt`}>
              Texto alternativo
              <input
                id={`carrera-image-${index}-alt`}
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
