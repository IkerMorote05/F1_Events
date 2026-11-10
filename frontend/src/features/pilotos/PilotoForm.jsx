import React, { useEffect, useState } from 'react';
import { pilotoImageSchema, pilotoSchema } from './pilotoSchema';

const emptyForm = {
  nombre: '',
  apellidos: '',
  numero: '',
  nacionalidad: '',
  puntos: '0',
  victorias: '0',
  podios: '0',
  escuderia: '',
  estado: 'compitiendo',
  categoria: '',
  fecha_nacimiento: ''
};

const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');
const getReferenceId = (value) => value?._id || value || '';

export const PilotoForm = ({ initialData, escuderias, categorias, submitting, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [images, setImages] = useState([]);
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
          estado: initialData.estado || 'compitiendo',
          categoria: getReferenceId(initialData.categoria),
          fecha_nacimiento: toDateInput(initialData.fecha_nacimiento)
        }
      : { ...emptyForm, escuderia: escuderias[0]?._id || '' });
    setImages(Array.isArray(initialData?.images)
      ? initialData.images.map(({ _id, image_url, alt_text }) => ({
          _id,
          image_url: image_url || '',
          alt_text: alt_text || ''
        }))
      : []);
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
    const result = pilotoSchema.safeParse(formData);
    const imageResult = images.map((image) => pilotoImageSchema.safeParse(image));
    const nextErrors = {};

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        nextErrors[issue.path[0]] = issue.message;
      });
    }
    imageResult.forEach((image, index) => {
      if (!image.success) {
        image.error.issues.forEach((issue) => {
          nextErrors[`image-${index}-${issue.path[0]}`] = issue.message;
        });
      }
    });

    if (!result.success || imageResult.some((image) => !image.success)) {
      setErrors(nextErrors);
      return;
    }

    const { fecha_nacimiento, ...payload } = result.data;
    const imagesToSave = imageResult.map((image, position) => ({
      ...image.data,
      position
    }));
    await onSubmit(fecha_nacimiento ? { ...payload, fecha_nacimiento } : payload, imagesToSave);
  };

  const renderFieldError = (name) => errors[name]
    ? <p className="piloto-field-error" id={`${name}-error`}>{errors[name]}</p>
    : null;
  const renderImageFieldError = (index, field) => {
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

      <label htmlFor="escuderia">Escudería{['compitiendo', 'lesion', 'piloto reserva'].includes(formData.estado) ? ' *' : ''}</label>
      <select id="escuderia" name="escuderia" value={formData.escuderia} onChange={handleChange}
        aria-invalid={Boolean(errors.escuderia)}
        aria-describedby={errors.escuderia ? 'escuderia-error' : undefined}>
        <option value="">-- Sin escudería --</option>
        {escuderias.map((escuderia) => (
          <option key={escuderia._id} value={escuderia._id}>{escuderia.nombre}</option>
        ))}
      </select>
      {renderFieldError('escuderia')}

      <label htmlFor="estado">Estado del piloto</label>
      <select id="estado" name="estado" value={formData.estado} onChange={handleChange}
        aria-invalid={Boolean(errors.estado)}
        aria-describedby={errors.estado ? 'estado-error' : undefined}>
        <option value="compitiendo">Compitiendo</option>
        <option value="agente libre">Agente libre</option>
        <option value="lesion">Lesión</option>
        <option value="retirado">Retirado</option>
        <option value="piloto reserva">Piloto reserva</option>
      </select>
      {renderFieldError('estado')}

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

      <section className="piloto-images-section" aria-labelledby="piloto-images-title">
        <div className="piloto-images-header">
          <div>
            <h2 id="piloto-images-title">Imágenes del piloto</h2>
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
            <label htmlFor={`piloto-image-${index}-url`}>
              URL de la imagen
              <input
                id={`piloto-image-${index}-url`}
                type="url"
                value={image.image_url}
                onChange={(event) => handleImageChange(index, 'image_url', event.target.value)}
                aria-invalid={Boolean(errors[`image-${index}-image_url`])}
                aria-describedby={errors[`image-${index}-image_url`] ? `image-${index}-image_url-error` : undefined}
                disabled={submitting}
              />
              {renderImageFieldError(index, 'image_url')}
            </label>

            <label htmlFor={`piloto-image-${index}-alt`}>
              Texto alternativo
              <input
                id={`piloto-image-${index}-alt`}
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
