import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RolForm } from '../../features/roles/RolForm';
import { useRoles } from '../../hooks/useRoles';
import { showApiError, showSuccess } from '../../utils/sweetAlert';

export const RolCreatePage = () => {
  const navigate = useNavigate();
  const { createItem } = useRoles();
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (payload) => {
    setSubmitting(true);
    try {
      await createItem(payload);
      await showSuccess('Rol creado correctamente');
      navigate('/roles');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo guardar el rol');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-container piloto-form-page">
      <header>
        <p className="piloto-eyebrow">Administración</p>
        <h1>Nuevo rol</h1>
      </header>
      <RolForm
        submitting={submitting}
        onSubmit={handleCreate}
        onCancel={() => navigate('/roles')}
      />
    </section>
  );
};

export default RolCreatePage;
