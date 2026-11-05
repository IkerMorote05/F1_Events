import React, { useEffect, useState } from 'react';
import { usuarioCreateSchema, usuarioImageSchema, usuarioUpdateSchema } from './usuarioSchema';
import { getUsuarioImages, getUsuarioRoles } from '../../services/usuarioService';

const getReferenceId = (value) => value?._id || value || '';

export const UsuarioForm = ({ initialData, submitting, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    roles: '',
    avatar: '',
    isActive: true
  });
  const [roles, setRoles] = useState([]);
  const [avatarImages, setAvatarImages] = useState([]);
  const [entityImages, setEntityImages] = useState([]);
  const [loadingReferences, setLoadingReferences] = useState(true);
  const [referenceError, setReferenceError] = useState('');
  const [errors, setErrors] = useState({});
  const isEditing = Boolean(initialData);

  useEffect(() => {
    setFormData(initialData
      ? {
          nombre: initialData.nombre || '',
          apellidos: initialData.apellidos || '',
          email: initialData.email || '',
          password: '',
          roles: getReferenceId(initialData.roles),
          avatar: getReferenceId(initialData.avatar),
          isActive: initialData.isActive !== false
        }
      : {
          nombre: '',
          apellidos: '',
          email: '',
          password: '',
          roles: '',
          avatar: '',
          isActive: true
        });
    setEntityImages(Array.isArray(initialData?.images)
      ? initialData.images.map(({ _id, image_url, alt_text }) => ({
          _id,
          image_url: image_url || '',
          alt_text: alt_text || ''
        }))
      : []);
    setErrors({});
  }, [initialData]);

  const loadReferences = async () => {
    setLoadingReferences(true);
    setReferenceError('');
    try {
      const [availableRoles, availableImages] = await Promise.all([
        getUsuarioRoles(),
        getUsuarioImages()
      ]);
      const nextRoles = Array.isArray(availableRoles) ? availableRoles : [];
      const nextImages = Array.isArray(availableImages) ? availableImages : [];
      setRoles(nextRoles.filter((role) => !role.deletedAt
        && (role.isActive !== false || String(role._id) === String(getReferenceId(initialData?.roles)))));
      setAvatarImages(nextImages.filter((image) => !image.deletedAt
        && (image.isActive !== false || String(image._id) === String(getReferenceId(initialData?.avatar)))));
    } catch (error) {
      console.error('Error al cargar roles e imágenes para usuarios:', error);
      setReferenceError('No se pudieron cargar los roles y las imágenes.');
    } finally {
      setLoadingReferences(false);
    }
  };

  useEffect(() => {
    loadReferences();
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleImageChange = (index, field, value) => {
    setEntityImages((current) => current.map((image, imageIndex) => (
      imageIndex === index ? { ...image, [field]: value } : image
    )));
    setErrors((current) => ({ ...current, [`image-${index}-${field}`]: undefined }));
  };

  const removeImage = (index) => {
    setEntityImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
    setErrors((current) => Object.fromEntries(
      Object.entries(current).filter(([name]) => !name.startsWith('image-'))
    ));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const schema = isEditing ? usuarioUpdateSchema : usuarioCreateSchema;
    const result = schema.safeParse(formData);
    const imageResults = entityImages.map((image) => usuarioImageSchema.safeParse(image));
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

    const { password, avatar, ...payload } = result.data;
    const imagesToSave = imageResults.map((image, position) => ({
      ...image.data,
      position
    }));
    await onSubmit({
      ...payload,
      ...(password ? { password } : {}),
      ...(avatar ? { avatar } : {})
    }, imagesToSave);
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
      {loadingReferences ? <p>Cargando roles y avatares...</p> : null}
      {referenceError ? (
        <div className="piloto-field-error">
          <p>{referenceError}</p>
          <button type="button" className="btn-secondary" onClick={loadReferences}>Reintentar</button>
        </div>
      ) : null}

      <label htmlFor="usuario-nombre">Nombre</label>
      <input id="usuario-nombre" name="nombre" value={formData.nombre} onChange={handleChange}
        disabled={submitting} {...fieldProps('nombre')} />
      {fieldError('nombre')}

      <label htmlFor="usuario-apellidos">Apellidos</label>
      <input id="usuario-apellidos" name="apellidos" value={formData.apellidos} onChange={handleChange}
        disabled={submitting} {...fieldProps('apellidos')} />
      {fieldError('apellidos')}

      <label htmlFor="usuario-email">Correo electrónico</label>
      <input id="usuario-email" name="email" type="email" autoComplete="email" value={formData.email}
        onChange={handleChange} disabled={submitting} {...fieldProps('email')} />
      {fieldError('email')}

      <label htmlFor="usuario-password">{isEditing ? 'Nueva contraseña (opcional)' : 'Contraseña'}</label>
      <input id="usuario-password" name="password" type="password"
        autoComplete={isEditing ? 'new-password' : 'new-password'} value={formData.password}
        onChange={handleChange} disabled={submitting} {...fieldProps('password')} />
      {fieldError('password')}

      <label htmlFor="usuario-rol">Rol</label>
      <select id="usuario-rol" name="roles" value={formData.roles} onChange={handleChange}
        disabled={loadingReferences || Boolean(referenceError) || submitting || !roles.length}
        {...fieldProps('roles')}>
        <option value="">-- Selecciona un rol --</option>
        {roles.map((role) => (
          <option key={role._id} value={role._id}>
            {role.nombre}{role.isActive === false ? ' (inactivo)' : ''}
          </option>
        ))}
      </select>
      {fieldError('roles')}
      {!loadingReferences && !referenceError && !roles.length
        ? <p className="piloto-field-error">Crea un rol activo antes de registrar usuarios.</p>
        : null}

      <label htmlFor="usuario-avatar">Avatar (opcional)</label>
      <select id="usuario-avatar" name="avatar" value={formData.avatar} onChange={handleChange}
        disabled={loadingReferences || Boolean(referenceError) || submitting}>
        <option value="">Sin avatar</option>
        {avatarImages.map((image) => (
          <option key={image._id} value={image._id}>
            {image.alt_text || image.image_url}{image.isActive === false ? ' (inactiva)' : ''}
          </option>
        ))}
      </select>

      <section className="piloto-images-section" aria-labelledby="usuario-images-title">
        <div className="piloto-images-header">
          <div>
            <h2 id="usuario-images-title">Imágenes del usuario</h2>
            <p>Añade cero o más imágenes asociadas al usuario, independientemente de su avatar.</p>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setEntityImages((current) => [...current, { image_url: '', alt_text: '' }])}
            disabled={submitting}
          >
            Añadir imagen
          </button>
        </div>

        {entityImages.map((image, index) => (
          <fieldset className="piloto-image-item" key={image._id || `new-image-${index}`}>
            <legend>Imagen {index + 1}</legend>
            <label htmlFor={`usuario-image-${index}-url`}>
              URL de la imagen
              <input
                id={`usuario-image-${index}-url`}
                type="url"
                value={image.image_url}
                onChange={(event) => handleImageChange(index, 'image_url', event.target.value)}
                aria-invalid={Boolean(errors[`image-${index}-image_url`])}
                aria-describedby={errors[`image-${index}-image_url`] ? `image-${index}-image_url-error` : undefined}
                disabled={submitting}
              />
              {imageFieldError(index, 'image_url')}
            </label>

            <label htmlFor={`usuario-image-${index}-alt`}>
              Texto alternativo
              <input
                id={`usuario-image-${index}-alt`}
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

      <label htmlFor="usuario-isActive">Estado</label>
      <select id="usuario-isActive" name="isActive" value={String(formData.isActive)}
        onChange={(event) => setFormData((current) => ({ ...current, isActive: event.target.value === 'true' }))}
        disabled={submitting}>
        <option value="true">Activo</option>
        <option value="false">Inactivo</option>
      </select>

      <div className="modal-actions">
        <button type="submit" className="btn-primary"
          disabled={submitting || loadingReferences || Boolean(referenceError) || !roles.length}>
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
      </div>
    </form>
  );
};
