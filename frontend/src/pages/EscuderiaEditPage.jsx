import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PilotoError } from '../components/PilotoError';
import { PilotoSkeleton } from '../components/PilotoSkeleton';
import { EscuderiaForm } from '../features/escuderias/EscuderiaForm';
import { useEscuderias } from '../hooks/useF1Data';
import { getEscuderiaById } from '../services/escuderiaService';
import { normalizeApiError } from '../utils/errorHandler';
import { showApiError, showSuccess } from '../utils/sweetAlert';

export const EscuderiaEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateItem } = useEscuderias();
  const [escuderia, setEscuderia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadEscuderia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEscuderia(await getEscuderiaById(id));
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEscuderia();
  }, [loadEscuderia]);

  const handleUpdate = async (payload) => {
    setSubmitting(true);
    try {
      await updateItem(id, payload);
      await showSuccess('Escudería actualizada correctamente');
      navigate('/escuderias');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo actualizar la escudería');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PilotoSkeleton resourceName="escuderías" />;
  if (error) return <PilotoError resourceName="escuderías" message={error} onRetry={loadEscuderia} />;
  if (!escuderia) return <PilotoError resourceName="escuderías" message="No se encontró la escudería solicitada." />;

  return (
    <section className="page-container piloto-form-page">
      <header>
        <p className="piloto-eyebrow">Administración</p>
        <h1>Editar escudería</h1>
      </header>
      <EscuderiaForm
        initialData={escuderia}
        submitting={submitting}
        onSubmit={handleUpdate}
        onCancel={() => navigate('/escuderias')}
      />
    </section>
  );
};

export default EscuderiaEditPage;
