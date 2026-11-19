import React, { useCallback, useEffect, useState } from 'react';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { ProfileForm } from '../../features/profile/ProfileForm';
import { useAuth } from '../../context/AuthContext';
import { getMyProfile, updateMyProfile } from '../../services/profileService';
import { normalizeApiError } from '../../utils/errorHandler';
import { showApiError, showSuccess } from '../../utils/sweetAlert';

export const ProfilePage = () => {
  const { updateUser } = useAuth();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const profileAccount = await getMyProfile();
      setAccount(profileAccount);
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      const updatedAccount = await updateMyProfile(data);
      setAccount(updatedAccount);
      updateUser(updatedAccount);
      await showSuccess('Perfil actualizado correctamente');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo actualizar el perfil');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PilotoSkeleton resourceName="perfil" />;
  if (error) return <PilotoError resourceName="perfil" message={error} onRetry={loadProfile} />;
  if (!account?.profile) {
    return <PilotoError resourceName="perfil" message="No se encontró el perfil de usuario." onRetry={loadProfile} />;
  }

  return (
    <section className="page-container profile-page">
      <header className="page-header">
        <div>
          <p className="piloto-eyebrow">Cuenta</p>
          <h1>Mi perfil</h1>
          <p>Personaliza tus datos, tu avatar y la apariencia de la aplicación.</p>
        </div>
      </header>

      <div className="piloto-dashboard-stats" aria-label="Datos de la cuenta">
        <article className="piloto-stat">
          <span>Correo electrónico</span>
          <strong>{account.email}</strong>
        </article>
        <article className="piloto-stat">
          <span>Rol</span>
          <strong>{account.role || 'Usuario'}</strong>
        </article>
      </div>

      <ProfileForm
        profile={account.profile}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </section>
  );
};

export default ProfilePage;
