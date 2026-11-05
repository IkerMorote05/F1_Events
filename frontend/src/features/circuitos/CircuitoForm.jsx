import React, { useEffect, useState } from 'react';
import { circuitoImageSchema, circuitoSchema } from './circuitoSchema';

const emptyForm = {
  nombre: '',
  categoria: '',
  tipo: '',
  longitud: '',
  location: '',
  ultimoGanador: '',
  desgaste: '',
  tiempoVueltaRapida: '',
  pilotoVueltaRapida: '',
  anioVueltaRapida: ''
};

const getReferenceId = (value) => value?._id || value || '';

export const CircuitoForm = ({
  initialData,
  locations,
  categoriasGlobales,
  categoriasCircuitos,
  submitting,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const vueltaRapida = initialData?.vueltaRapida;
    setFormData(initialData
      ? {
          nombre: initialData.nombre || '',
          categoria: getReferenceId(initialData.categoria),
          tipo: initialData.tipo?.tipo || initialData.tipo || '',
          longitud: String(initialData.longitud ?? ''),
          location: initialData.location?._id || initialData.location || '',
          ultimoGanador: initialData.ultimoGanador || '',
          desgaste: initialData.desgaste?.desgaste || initialData.desgaste || '',
          tiempoVueltaRapida: vueltaRapida?.tiempo || '',
          pilotoVueltaRapida: vueltaRapida?.piloto || '',
          anioVueltaRapida: vueltaRapida?.anio
            ? String(new Date(vueltaRapida.anio).getUTCFullYear())
            : ''
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
      current.categoria || !categoriasGlobales.length
        ? current
        : { ...current, categoria: categoriasGlobales[0]._id }
    ));
  }, [categoriasGlobales, initialData]);

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
    const result = circuitoSchema.safeParse(formData);
    const imageResults = images.map((image) => circuitoImageSchema.safeParse(image));
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
  const canSubmit = !submitting && categoriasGlobales.length > 0 && locations.length > 0
    && categoriasCircuitos.length > 0;
  const circuitCategoryOptions = (field, currentValue) => {
    const options = [...new Set(categoriasCircuitos
      .map((category) => category[field])
      .filter((value) => typeof value === 'string' && value.trim()))];
    return currentValue && !options.includes(currentValue)
      ? [currentValue, ...options]
      : options;
  };

  return (
    <form className="piloto-form" onSubmit={handleSubmit} noValidate>
      {categoriasGlobales.length === 0
        ? <p className="piloto-field-error">No hay categorías globales disponibles.</p>
        : null}
      {categoriasCircuitos.length === 0
        ? <p className="piloto-field-error">No hay categorías de circuitos disponibles.</p>
        : null}

      <label htmlFor="nombre">Nombre</label>
      <input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} {...fieldProps('nombre')} />
      {fieldError('nombre')}

      <label htmlFor="categoria">Competición</label>
      <select id="categoria" name="categoria" value={formData.categoria} onChange={handleChange}
        {...fieldProps('categoria')}>
        <option value="">-- Selecciona una competición --</option>
        {categoriasGlobales.map((categoria) => (
          <option key={categoria._id} value={categoria._id}
            disabled={Boolean(categoria.deletedAt && categoria._id !== formData.categoria)}>
            {categoria.competicion}{categoria.deletedAt ? ' (eliminada)' : ''}
          </option>
        ))}
      </select>
      {fieldError('categoria')}

      <label htmlFor="tipo">Tipo de circuito</label>
      <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange}
        {...fieldProps('tipo')}>
        <option value="">-- Selecciona un tipo de circuito --</option>
        {circuitCategoryOptions('tipo', formData.tipo).map((tipo) => (
          <option key={tipo} value={tipo}>{tipo}</option>
        ))}
      </select>
      {fieldError('tipo')}

      <label htmlFor="longitud">Longitud (km)</label>
      <input id="longitud" name="longitud" type="number" min="0" step="any" value={formData.longitud}
        onChange={handleChange} {...fieldProps('longitud')} />
      {fieldError('longitud')}

      <label htmlFor="location">Ubicación</label>
      <select id="location" name="location" value={formData.location} onChange={handleChange}
        {...fieldProps('location')}>
        <option value="">Selecciona una ubicación</option>
        {locations.map((location) => (
          <option key={location._id} value={location._id}>
            {location.ciudad}, {location.pais}
          </option>
        ))}
      </select>
      {fieldError('location')}
      {locations.length === 0
        ? <p className="piloto-field-error">Registra una ubicación antes de crear un circuito.</p>
        : null}

      <label htmlFor="ultimoGanador">Último ganador</label>
      <input id="ultimoGanador" name="ultimoGanador" value={formData.ultimoGanador} onChange={handleChange} />

      <label htmlFor="desgaste">Desgaste</label>
      <select id="desgaste" name="desgaste" value={formData.desgaste} onChange={handleChange}
        {...fieldProps('desgaste')}>
        <option value="">-- Selecciona un nivel de desgaste --</option>
        {circuitCategoryOptions('desgaste', formData.desgaste).map((desgaste) => (
          <option key={desgaste} value={desgaste}>{desgaste}</option>
        ))}
      </select>

      <fieldset className="circuito-form-fieldset">
        <legend>Vuelta rápida (opcional)</legend>
        <label htmlFor="tiempoVueltaRapida">Tiempo</label>
        <input id="tiempoVueltaRapida" name="tiempoVueltaRapida" value={formData.tiempoVueltaRapida}
          onChange={handleChange} {...fieldProps('tiempoVueltaRapida')} />
        {fieldError('tiempoVueltaRapida')}

        <label htmlFor="pilotoVueltaRapida">Piloto</label>
        <input id="pilotoVueltaRapida" name="pilotoVueltaRapida" value={formData.pilotoVueltaRapida}
          onChange={handleChange} {...fieldProps('pilotoVueltaRapida')} />
        {fieldError('pilotoVueltaRapida')}

        <label htmlFor="anioVueltaRapida">Año</label>
        <input id="anioVueltaRapida" name="anioVueltaRapida" type="number" min="1900" max="9999" step="1"
          value={formData.anioVueltaRapida} onChange={handleChange} {...fieldProps('anioVueltaRapida')} />
        {fieldError('anioVueltaRapida')}
      </fieldset>

      <section className="piloto-images-section" aria-labelledby="circuito-images-title">
        <div className="piloto-images-header">
          <div>
            <h2 id="circuito-images-title">Imágenes del circuito</h2>
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
            <label htmlFor={`circuito-image-${index}-url`}>
              URL de la imagen
              <input
                id={`circuito-image-${index}-url`}
                type="url"
                value={image.image_url}
                onChange={(event) => handleImageChange(index, 'image_url', event.target.value)}
                aria-invalid={Boolean(errors[`image-${index}-image_url`])}
                aria-describedby={errors[`image-${index}-image_url`] ? `image-${index}-image_url-error` : undefined}
                disabled={submitting}
              />
              {imageFieldError(index, 'image_url')}
            </label>

            <label htmlFor={`circuito-image-${index}-alt`}>
              Texto alternativo
              <input
                id={`circuito-image-${index}-alt`}
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
        <button type="submit" className="btn-primary" disabled={!canSubmit}>
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
      </div>
    </form>
  );
};
