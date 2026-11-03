import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { UsuarioForm } from '../../features/usuarios/UsuarioForm';
import { useUsuarios } from '../../hooks/useUsuarios';
import { normalizeApiError } from '../../utils/errorHandler';
import { showApiError, showSuccess } from '../../utils/sweetAlert';

export const UsuarioEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, updateItem } = useUsuarios();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadUsuario = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsuario(await getById(id));
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, [getById, id]);

  useEffect(() => {
    loadUsuario();
  }, [loadUsuario]);

  const handleUpdate = async (payload) => {
    setSubmitting(true);
    try {
      await updateItem(id, payload);
      await showSuccess('Usuario actualizado correctamente');
      navigate('/usuarios');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo actualizar el usuario');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PilotoSkeleton resourceName="usuarios" />;
  if (error) return <PilotoError resourceName="usuarios" message={error} onRetry={loadUsuario} />;
  if (!usuario) return <PilotoError resourceName="usuarios" message="No se encontró el usuario solicitado." />;
  if (usuario.deletedAt) {
    return <PilotoError resourceName="usuarios" message="No se puede editar un usuario eliminado." />;
  }

  return (
    <section className="page-container piloto-form-page">
      <header>
        <p className="piloto-eyebrow">Administración</p>
        <h1>Editar usuario</h1>
      </header>
      <UsuarioForm
        initialData={usuario}
        submitting={submitting}
        onSubmit={handleUpdate}
        onCancel={() => navigate('/usuarios')}
      />
    </section>
  );
};

export default UsuarioEditPage;
