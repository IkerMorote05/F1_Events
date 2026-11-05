import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PilotoError } from '../../components/PilotoError';
import { PilotoForm } from '../../features/pilotos/PilotoForm';
import { useCategoriasGlobales } from '../../hooks/useCategoriasGlobales';
import { useEscuderias } from '../../hooks/useEscuderias';
import { usePilotos } from '../../hooks/usePilotos';
import { syncPilotoImages } from '../../services/pilotoService';
import { showPilotoError, showPilotoSuccess } from '../../utils/sweetAlert';

export const PilotoCreatePage = () => {
  const navigate = useNavigate();
  const { createItem } = usePilotos();
  const { items: escuderias, loading: loadingEscuderias, error: errorEscuderias, reload } = useEscuderias();
  const {
    items: categorias,
    loading: loadingCategorias,
    error: errorCategorias,
    load: reloadCategorias
  } = useCategoriasGlobales();
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (payload, images) => {
    setSubmitting(true);
    try {
      const piloto = await createItem(payload);
      try {
        await syncPilotoImages(piloto._id, images);
      } catch (imageError) {
        await showPilotoError(imageError, 'El piloto se creó, pero no se pudieron guardar todas las imágenes');
        navigate(piloto._id ? `/pilotos/${piloto._id}/editar` : '/pilotos');
        return;
      }
      await showPilotoSuccess('Piloto creado correctamente');
      navigate('/pilotos');
    } catch (requestError) {
      await showPilotoError(requestError, 'Error al guardar el piloto');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingEscuderias || loadingCategorias) return <p className="page-container">Cargando datos del piloto...</p>;
  if (errorEscuderias) return <PilotoError message={errorEscuderias} onRetry={reload} />;
  if (errorCategorias) return <PilotoError message={errorCategorias} onRetry={reloadCategorias} />;

  return (
    <section className="page-container piloto-form-page">
      <header>
        <p className="piloto-eyebrow">Administración</p>
        <h1>Nuevo piloto</h1>
      </header>
      <PilotoForm
        escuderias={escuderias}
        categorias={categorias}
        submitting={submitting}
        onSubmit={handleCreate}
        onCancel={() => navigate('/pilotos')}
      />
    </section>
  );
};

export default PilotoCreatePage;
