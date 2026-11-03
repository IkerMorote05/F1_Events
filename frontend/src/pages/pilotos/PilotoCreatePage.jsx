import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PilotoError } from '../../components/PilotoError';
import { PilotoForm } from '../../features/pilotos/PilotoForm';
import { useCategoriasGlobales } from '../../hooks/useCategoriasGlobales';
import { useEscuderias } from '../../hooks/useEscuderias';
import { usePilotos } from '../../hooks/usePilotos';
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

  const handleCreate = async (payload) => {
    setSubmitting(true);
    try {
      await createItem(payload);
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
