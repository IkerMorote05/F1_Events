import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { RolForm } from '../../features/roles/RolForm';
import { useRoles } from '../../hooks/useRoles';
import { normalizeApiError } from '../../utils/errorHandler';
import { showApiError, showSuccess } from '../../utils/sweetAlert';

export const RolEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, updateItem } = useRoles();
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadRol = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRol(await getById(id));
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, [getById, id]);

  useEffect(() => {
    loadRol();
  }, [loadRol]);

  const handleUpdate = async (payload) => {
    setSubmitting(true);
    try {
      await updateItem(id, payload);
      await showSuccess('Rol actualizado correctamente');
      navigate('/roles');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo actualizar el rol');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PilotoSkeleton resourceName="roles" />;
  if (error) return <PilotoError resourceName="roles" message={error} onRetry={loadRol} />;
  if (!rol) return <PilotoError resourceName="roles" message="No se encontró el rol solicitado." />;
  if (rol.deletedAt) {
    return <PilotoError resourceName="roles" message="No se puede editar un rol eliminado." />;
  }

  return (
    <section className="page-container piloto-form-page">
      <header>
        <p className="piloto-eyebrow">Administración</p>
        <h1>Editar rol</h1>
      </header>
      <RolForm
        initialData={rol}
        submitting={submitting}
        onSubmit={handleUpdate}
        onCancel={() => navigate('/roles')}
      />
    </section>
  );
};

export default RolEditPage;
