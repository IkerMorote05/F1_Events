import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PilotoError } from '../../components/PilotoError';
import { EscuderiaForm } from '../../features/escuderias/EscuderiaForm';
import { useEscuderias } from '../../hooks/useEscuderias';
import { syncEscuderiaImages } from '../../services/escuderiaService';
import { showApiError, showSuccess } from '../../utils/sweetAlert';

export const EscuderiaCreatePage = () => {
  const navigate = useNavigate();
  const { createItem } = useEscuderias();
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (payload, images) => {
    setSubmitting(true);
    try {
      const escuderia = await createItem(payload);
      try {
        await syncEscuderiaImages(escuderia._id, images);
      } catch (imageError) {
        await showApiError(imageError, 'La escudería se creó, pero no se pudieron guardar todas las imágenes');
        navigate(escuderia._id ? `/escuderias/${escuderia._id}/editar` : '/escuderias');
        return;
      }
      await showSuccess('Escudería creada correctamente');
      navigate('/escuderias');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo guardar la escudería');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-container piloto-form-page">
      <header>
        <p className="piloto-eyebrow">Administración</p>
        <h1>Nueva escudería</h1>
      </header>
      <EscuderiaForm
        submitting={submitting}
        onSubmit={handleCreate}
        onCancel={() => navigate('/escuderias')}
      />
    </section>
  );
};

export default EscuderiaCreatePage;
