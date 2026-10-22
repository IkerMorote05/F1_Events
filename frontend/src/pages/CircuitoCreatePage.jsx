import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PilotoError } from '../components/PilotoError';
import { CircuitoForm } from '../features/circuitos/CircuitoForm';
import { useCircuitos } from '../hooks/useF1Data';
import { showApiError, showSuccess } from '../utils/sweetAlert';

export const CircuitoCreatePage = () => {
  const navigate = useNavigate();
  const { createItem } = useCircuitos();
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (payload) => {
    setSubmitting(true);
    try {
      await createItem(payload);
      await showSuccess('Circuito creado correctamente');
      navigate('/circuitos');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo guardar el circuito');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-container piloto-form-page">
      <header><p className="piloto-eyebrow">Administración</p><h1>Nuevo circuito</h1></header>
      <CircuitoForm submitting={submitting} onSubmit={handleCreate} onCancel={() => navigate('/circuitos')} />
    </section>
  );
};

export default CircuitoCreatePage;
