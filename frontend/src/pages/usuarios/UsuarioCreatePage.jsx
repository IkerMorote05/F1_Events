import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsuarioForm } from '../../features/usuarios/UsuarioForm';
import { useUsuarios } from '../../hooks/useUsuarios';
import { showApiError, showSuccess } from '../../utils/sweetAlert';

export const UsuarioCreatePage = () => {
  const navigate = useNavigate();
  const { createItem } = useUsuarios();
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (payload) => {
    setSubmitting(true);
    try {
      await createItem(payload);
      await showSuccess('Usuario creado correctamente');
      navigate('/usuarios');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo guardar el usuario');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-container piloto-form-page">
      <header>
        <p className="piloto-eyebrow">Administración</p>
        <h1>Nuevo usuario</h1>
      </header>
      <UsuarioForm
        submitting={submitting}
        onSubmit={handleCreate}
        onCancel={() => navigate('/usuarios')}
      />
    </section>
  );
};

export default UsuarioCreatePage;
