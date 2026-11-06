import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { TicketTypeForm } from '../../features/ticket-types/TicketTypeForm';
import { useCarreras } from '../../hooks/useCarreras';
import { useCircuitos } from '../../hooks/useCircuitos';
import { useTicketTypes } from '../../hooks/useTicketTypes';
import { useVariants } from '../../hooks/useVariants';
import { showApiError, showSuccess } from '../../utils/sweetAlert';

export const TicketTypeCreatePage = () => {
  const navigate = useNavigate();
  const { createItem } = useTicketTypes();
  const { items: circuitos, loading: loadingCircuitos, error: errorCircuitos, load: loadCircuitos } = useCircuitos();
  const { items: carreras, loading: loadingCarreras, error: errorCarreras, load: loadCarreras } = useCarreras();
  const { items: variants, loading: loadingVariants, error: errorVariants, load: loadVariants } = useVariants();
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (payload) => {
    setSubmitting(true);
    try {
      await createItem(payload);
      await showSuccess('Tipo de entrada creado correctamente');
      navigate('/ticket-types');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo guardar el tipo de entrada');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCircuitos || loadingCarreras || loadingVariants) {
    return <PilotoSkeleton resourceName="referencias de tipos de entrada" />;
  }
  if (errorCircuitos) return <PilotoError resourceName="circuitos" message={errorCircuitos} onRetry={loadCircuitos} />;
  if (errorCarreras) return <PilotoError resourceName="carreras" message={errorCarreras} onRetry={loadCarreras} />;
  if (errorVariants) return <PilotoError resourceName="variantes" message={errorVariants} onRetry={loadVariants} />;

  return (
    <section className="page-container piloto-form-page">
      <header>
        <p className="piloto-eyebrow">Administración</p>
        <h1>Nuevo tipo de entrada</h1>
      </header>
      <TicketTypeForm
        circuitos={circuitos.filter((circuito) => !circuito.deletedAt)}
        carreras={carreras}
        variants={variants.filter((variant) => !variant.deletedAt)}
        submitting={submitting}
        onSubmit={handleCreate}
        onCancel={() => navigate('/ticket-types')}
      />
    </section>
  );
};

export default TicketTypeCreatePage;
