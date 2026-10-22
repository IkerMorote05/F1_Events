import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PilotoError } from '../components/PilotoError';
import { PilotoSkeleton } from '../components/PilotoSkeleton';
import { CircuitoForm } from '../features/circuitos/CircuitoForm';
import { useCircuitos } from '../hooks/useF1Data';
import { getCircuitoById } from '../services/circuitoService';
import { normalizeApiError } from '../utils/errorHandler';
import { showApiError, showSuccess } from '../utils/sweetAlert';

export const CircuitoEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateItem } = useCircuitos();
  const [circuito, setCircuito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadCircuito = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCircuito(await getCircuitoById(id));
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadCircuito(); }, [loadCircuito]);

  const handleUpdate = async (payload) => {
    setSubmitting(true);
    try {
      await updateItem(id, payload);
      await showSuccess('Circuito actualizado correctamente');
      navigate('/circuitos');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo actualizar el circuito');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PilotoSkeleton resourceName="circuitos" />;
  if (error) return <PilotoError resourceName="circuitos" message={error} onRetry={loadCircuito} />;
  if (!circuito) return <PilotoError resourceName="circuitos" message="No se encontró el circuito solicitado." />;

  return (
    <section className="page-container piloto-form-page">
      <header><p className="piloto-eyebrow">Administración</p><h1>Editar circuito</h1></header>
      <CircuitoForm initialData={circuito} submitting={submitting} onSubmit={handleUpdate}
        onCancel={() => navigate('/circuitos')} />
    </section>
  );
};

export default CircuitoEditPage;
