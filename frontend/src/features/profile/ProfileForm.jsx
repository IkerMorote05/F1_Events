import React, { useEffect, useState } from 'react';
import { ImagePlus, Monitor, Moon, Sun, Trash2 } from 'lucide-react';
import { profileSchema } from './profileSchema';

const themeOptions = [
  { value: 'system', label: 'Automático', description: 'Sigue el tema de tu dispositivo.', Icon: Monitor },
  { value: 'light', label: 'Claro', description: 'Una apariencia luminosa.', Icon: Sun },
  { value: 'dark', label: 'Oscuro', description: 'Una apariencia de alto contraste.', Icon: Moon },
];

export const ProfileForm = ({ profile, submitting, onSubmit }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    avatarUrl: '',
    theme: 'system'
  });
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData({
      nombre: profile?.nombre || '',
      apellidos: profile?.apellidos || '',
      avatarUrl: '',
      theme: themeOptions.some(({ value }) => value === profile?.settings?.theme)
        ? profile.settings.theme
        : 'system'
    });
    setRemoveAvatar(false);
    setPreviewFailed(false);
    setError('');
  }, [profile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (name === 'avatarUrl') {
      setRemoveAvatar(false);
      setPreviewFailed(false);
    }
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const avatarUrl = formData.avatarUrl.trim();

    const result = profileSchema.safeParse({
      nombre: formData.nombre,
      apellidos: formData.apellidos,
      ...(avatarUrl && avatarUrl !== profile?.avatar?.image_url
        ? { avatarUrl }
        : {}),
      ...(removeAvatar ? { avatar: null } : {}),
      settings: {
        ...profile?.settings,
        theme: formData.theme
      }
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Revisa los datos del perfil.');
      return;
    }

    setError('');
    await onSubmit(result.data);
  };

  const previewUrl = formData.avatarUrl.trim()
    || (removeAvatar ? '' : profile?.avatar?.image_url || '');

  return (
    <form className="profile-form" onSubmit={handleSubmit} noValidate>
      <section className="profile-section" aria-labelledby="profile-details-title">
        <div className="profile-section-heading">
          <div className="profile-section-icon" aria-hidden="true"><ImagePlus size={20} /></div>
          <div>
            <h2 id="profile-details-title">Datos personales</h2>
            <p>Actualiza tu nombre y la imagen que aparece en tu cuenta.</p>
          </div>
        </div>

        <div className="profile-fields">
          <label className="profile-field" htmlFor="profile-nombre">
            <span>Nombre</span>
            <input
              id="profile-nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              disabled={submitting}
              autoComplete="given-name"
              required
            />
          </label>

          <label className="profile-field" htmlFor="profile-apellidos">
            <span>Apellidos</span>
            <input
              id="profile-apellidos"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              disabled={submitting}
              autoComplete="family-name"
              required
            />
          </label>
        </div>

        <div className="profile-avatar-editor">
          <div className="profile-avatar-preview" role="img" aria-label="Vista previa del avatar">
            {previewUrl && !previewFailed ? (
              <img
                src={previewUrl}
                alt="Vista previa del avatar"
                onError={() => setPreviewFailed(true)}
              />
            ) : (
              <ImagePlus size={30} aria-hidden="true" />
            )}
          </div>

          <div className="profile-avatar-fields">
            <label className="profile-field" htmlFor="profile-avatar-url">
              <span>Avatar <small>Opcional</small></span>
              <input
                id="profile-avatar-url"
                name="avatarUrl"
                type="url"
                value={formData.avatarUrl}
                onChange={handleChange}
                disabled={submitting}
                placeholder="https://ejemplo.com/mi-avatar.jpg"
                autoComplete="url"
              />
            </label>
            <p className="profile-field-hint">Pega una URL pública de imagen para añadir o cambiar tu avatar.</p>
            {profile?.avatar && !removeAvatar ? (
              <button
                type="button"
                className="profile-remove-avatar"
                onClick={() => {
                  setRemoveAvatar(true);
                  setFormData((current) => ({ ...current, avatarUrl: '' }));
                  setPreviewFailed(false);
                }}
                disabled={submitting}
              >
                <Trash2 size={16} aria-hidden="true" />
                Quitar avatar actual
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="profile-section" aria-labelledby="profile-preferences-title">
        <div className="profile-section-heading">
          <div className="profile-section-icon" aria-hidden="true"><Sun size={20} /></div>
          <div>
            <h2 id="profile-preferences-title">Apariencia</h2>
            <p>Elige cómo quieres ver la aplicación. Esta preferencia es opcional.</p>
          </div>
        </div>

        <fieldset className="profile-theme-options">
          <legend className="visually-hidden">Tema de la aplicación</legend>
          {themeOptions.map(({ value, label, description, Icon }) => (
            <label
              className={`profile-theme-option${formData.theme === value ? ' is-selected' : ''}`}
              key={value}
            >
              <input
                type="radio"
                name="theme"
                value={value}
                checked={formData.theme === value}
                onChange={handleChange}
                disabled={submitting}
              />
              <Icon size={20} aria-hidden="true" />
              <span className="profile-theme-copy">
                <strong>{label}</strong>
                <small>{description}</small>
              </span>
              <span className="profile-theme-check" aria-hidden="true" />
            </label>
          ))}
        </fieldset>
      </section>

      {error ? <p className="profile-form-error" role="alert">{error}</p> : null}

      <div className="profile-form-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
};
