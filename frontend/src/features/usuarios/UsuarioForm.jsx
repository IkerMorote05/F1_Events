import React, { useEffect, useState } from 'react';
import { usuarioCreateSchema, usuarioUpdateSchema } from './usuarioSchema';
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
  const [images, setImages] = useState([]);
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
      setImages(nextImages.filter((image) => !image.deletedAt
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const schema = isEditing ? usuarioUpdateSchema : usuarioCreateSchema;
    const result = schema.safeParse(formData);
    if (!result.success) {
      const nextErrors = {};
      result.error.issues.forEach((issue) => {
        nextErrors[issue.path[0]] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    const { password, avatar, ...payload } = result.data;
    await onSubmit({
      ...payload,
      ...(password ? { password } : {}),
      ...(avatar ? { avatar } : {})
    });
  };

  const fieldError = (name) => errors[name]
    ? <p className="piloto-field-error" id={`${name}-error`}>{errors[name]}</p>
    : null;
  const fieldProps = (name) => ({
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-error` : undefined
  });

  return (
    <form className="piloto-form" onSubmit={handleSubmit} noValidate>
      {loadingReferences ? <p>Cargando roles e imágenes...</p> : null}
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
        {images.map((image) => (
          <option key={image._id} value={image._id}>
            {image.alt_text || image.image_url}{image.isActive === false ? ' (inactiva)' : ''}
          </option>
        ))}
      </select>

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
