import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PilotoError } from '../components/PilotoError';
import { PilotoSkeleton } from '../components/PilotoSkeleton';
import { CarreraForm } from '../features/carreras/CarreraForm';
import { useCarreras, useCircuitos } from '../hooks/useF1Data';
import { showApiError, showSuccess } from '../utils/sweetAlert';

export const CarreraCreatePage = () => {
  const navigate = useNavigate();
  const { createItem } = useCarreras();
  const { items: circuitos, loading, error, load } = useCircuitos();
  const [submitting, setSubmitting] = useState(false);
  const circuitosDisponibles = circuitos.filter((circuito) => !circuito.deletedAt);

  const handleCreate = async (payload) => {
    setSubmitting(true);
    try {
      await createItem(payload);
      await showSuccess('Carrera creada correctamente');
      navigate('/carreras');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo guardar la carrera');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PilotoSkeleton resourceName="circuitos" />;
  if (error) return <PilotoError resourceName="circuitos" message={error} onRetry={load} />;

  return (
    <section className="page-container piloto-form-page">
      <header><p className="piloto-eyebrow">Administración</p><h1>Nueva carrera</h1></header>
      <CarreraForm circuitos={circuitosDisponibles} submitting={submitting} onSubmit={handleCreate}
        onCancel={() => navigate('/carreras')} />
    </section>
  );
};

export default CarreraCreatePage;
