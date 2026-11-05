import React, { useEffect, useState } from 'react';
import { locationImageSchema, locationSchema } from './locationSchema';

export const LocationForm = ({ initialData, submitting, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({ pais: '', ciudad: '', capital: '' });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData({
      pais: initialData?.pais || '',
      ciudad: initialData?.ciudad || '',
      capital: initialData?.capital || ''
    });
    setImages(Array.isArray(initialData?.images)
      ? initialData.images.map(({ _id, image_url, alt_text }) => ({
          _id,
          image_url: image_url || '',
          alt_text: alt_text || ''
        }))
      : []);
    setErrors({});
  }, [initialData]);

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
    const result = locationSchema.safeParse(formData);
    const imageResults = images.map((image) => locationImageSchema.safeParse(image));
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

      <section className="piloto-images-section" aria-labelledby="location-images-title">
        <div className="piloto-images-header">
          <div>
            <h2 id="location-images-title">Imágenes de la ubicación</h2>
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
            <label htmlFor={`location-image-${index}-url`}>
              URL de la imagen
              <input
                id={`location-image-${index}-url`}
                type="url"
                value={image.image_url}
                onChange={(event) => handleImageChange(index, 'image_url', event.target.value)}
                aria-invalid={Boolean(errors[`image-${index}-image_url`])}
                aria-describedby={errors[`image-${index}-image_url`] ? `image-${index}-image_url-error` : undefined}
                disabled={submitting}
              />
              {imageFieldError(index, 'image_url')}
            </label>

            <label htmlFor={`location-image-${index}-alt`}>
              Texto alternativo
              <input
                id={`location-image-${index}-alt`}
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
