import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsuarioForm } from '../../features/usuarios/UsuarioForm';
import { useUsuarios } from '../../hooks/useUsuarios';
import { syncUsuarioImages } from '../../services/usuarioService';
import { showApiError, showSuccess } from '../../utils/sweetAlert';

export const UsuarioCreatePage = () => {
  const navigate = useNavigate();
  const { createItem } = useUsuarios();
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (payload, images) => {
    setSubmitting(true);
    try {
      const usuario = await createItem(payload);
      try {
        await syncUsuarioImages(usuario._id, images);
      } catch (imageError) {
        await showApiError(imageError, 'El usuario se creó, pero no se pudieron guardar todas las imágenes');
        navigate(usuario._id ? `/usuarios/${usuario._id}/editar` : '/usuarios');
        return;
      }
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
