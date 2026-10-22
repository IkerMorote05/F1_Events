import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PilotoError } from '../components/PilotoError';
import { PilotoForm } from '../features/pilotos/PilotoForm';
import { useEscuderias, usePilotos } from '../hooks/useF1Data';
import { showPilotoError, showPilotoSuccess } from '../utils/sweetAlert';

export const PilotoCreatePage = () => {
  const navigate = useNavigate();
  const { createItem } = usePilotos();
  const { items: escuderias, loading: loadingEscuderias, error: errorEscuderias, reload } = useEscuderias();
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

  if (loadingEscuderias) return <p className="page-container">Cargando escuderías...</p>;
  if (errorEscuderias) return <PilotoError message={errorEscuderias} onRetry={reload} />;

  return (
    <section className="page-container piloto-form-page">
      <header>
        <p className="piloto-eyebrow">Administración</p>
        <h1>Nuevo piloto</h1>
      </header>
      <PilotoForm
        escuderias={escuderias}
        submitting={submitting}
        onSubmit={handleCreate}
        onCancel={() => navigate('/pilotos')}
      />
    </section>
  );
};

export default PilotoCreatePage;
