import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PilotoError } from '../components/PilotoError';
import { PilotoSkeleton } from '../components/PilotoSkeleton';
import { CarreraForm } from '../features/carreras/CarreraForm';
import { useCarreras, useCircuitos } from '../hooks/useF1Data';
import { getCarreraById } from '../services/carreraService';
import { normalizeApiError } from '../utils/errorHandler';
import { showApiError, showSuccess } from '../utils/sweetAlert';

export const CarreraEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateItem } = useCarreras();
  const { items: circuitos, loading: loadingCircuitos, error: errorCircuitos, load: loadCircuitos } = useCircuitos();
  const [carrera, setCarrera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const circuitoActualId = carrera?.circuito?._id || carrera?.circuito;
  const circuitosDisponibles = circuitos.filter(
    (circuito) => !circuito.deletedAt || String(circuito._id) === String(circuitoActualId)
  );

  const loadCarrera = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCarrera(await getCarreraById(id));
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadCarrera(); }, [loadCarrera]);

  const handleUpdate = async (payload) => {
    const circuitoOriginal = carrera?.circuito?._id || carrera?.circuito;
    const { circuito: circuitoSeleccionado, ...datosSinCircuito } = payload;
    const updatePayload = String(circuitoSeleccionado) === String(circuitoOriginal)
      ? datosSinCircuito
      : payload;
    setSubmitting(true);
    try {
      await updateItem(id, updatePayload);
      await showSuccess('Carrera actualizada correctamente');
      navigate('/carreras');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo actualizar la carrera');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingCircuitos) return <PilotoSkeleton resourceName="carreras" />;
  if (error) return <PilotoError resourceName="carreras" message={error} onRetry={loadCarrera} />;
  if (errorCircuitos) return <PilotoError resourceName="circuitos" message={errorCircuitos} onRetry={loadCircuitos} />;
  if (!carrera) return <PilotoError resourceName="carreras" message="No se encontró la carrera solicitada." />;

  return (
    <section className="page-container piloto-form-page">
      <header><p className="piloto-eyebrow">Administración</p><h1>Editar carrera</h1></header>
      <CarreraForm initialData={carrera} circuitos={circuitosDisponibles} submitting={submitting}
        onSubmit={handleUpdate} onCancel={() => navigate('/carreras')} />
    </section>
  );
};

export default CarreraEditPage;
