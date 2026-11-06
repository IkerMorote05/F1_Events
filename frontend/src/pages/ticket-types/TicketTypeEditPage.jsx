import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { TicketTypeForm } from '../../features/ticket-types/TicketTypeForm';
import { useCarreras } from '../../hooks/useCarreras';
import { useCircuitos } from '../../hooks/useCircuitos';
import { useTicketTypes } from '../../hooks/useTicketTypes';
import { useVariants } from '../../hooks/useVariants';
import { normalizeApiError } from '../../utils/errorHandler';
import { showApiError, showSuccess } from '../../utils/sweetAlert';

export const TicketTypeEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, updateItem } = useTicketTypes();
  const { items: circuitos, loading: loadingCircuitos, error: errorCircuitos, load: loadCircuitos } = useCircuitos();
  const { items: carreras, loading: loadingCarreras, error: errorCarreras, load: loadCarreras } = useCarreras();
  const { items: variants, loading: loadingVariants, error: errorVariants, load: loadVariants } = useVariants();
  const [ticketType, setTicketType] = useState(null);
  const [loadingTicket, setLoadingTicket] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorTicket, setErrorTicket] = useState(null);

  const loadTicketType = useCallback(async () => {
    setLoadingTicket(true);
    setErrorTicket(null);
    try {
      setTicketType(await getById(id));
    } catch (requestError) {
      setErrorTicket(normalizeApiError(requestError).message);
    } finally {
      setLoadingTicket(false);
    }
  }, [getById, id]);

  useEffect(() => {
    loadTicketType();
  }, [loadTicketType]);

  const handleUpdate = async (payload) => {
    setSubmitting(true);
    try {
      await updateItem(id, payload);
      await showSuccess('Tipo de entrada actualizado correctamente');
      navigate('/ticket-types');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo actualizar el tipo de entrada');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTicket || loadingCircuitos || loadingCarreras || loadingVariants) {
    return <PilotoSkeleton resourceName="tipos de entrada" />;
  }
  if (errorTicket) return <PilotoError resourceName="tipos de entrada" message={errorTicket} onRetry={loadTicketType} />;
  if (errorCircuitos) return <PilotoError resourceName="circuitos" message={errorCircuitos} onRetry={loadCircuitos} />;
  if (errorCarreras) return <PilotoError resourceName="carreras" message={errorCarreras} onRetry={loadCarreras} />;
  if (errorVariants) return <PilotoError resourceName="variantes" message={errorVariants} onRetry={loadVariants} />;
  if (!ticketType) {
    return <PilotoError resourceName="tipos de entrada" message="No se encontró el tipo de entrada solicitado." />;
  }
  if (ticketType.deletedAt) {
    return <PilotoError resourceName="tipos de entrada" message="No se puede editar un tipo de entrada eliminado." />;
  }

  const circuitId = ticketType.circuit?._id || ticketType.circuit;
  const raceId = ticketType.race?._id || ticketType.race;
  const categoryId = ticketType.category?._id || ticketType.category;

  return (
    <section className="page-container piloto-form-page">
      <header>
        <p className="piloto-eyebrow">Administración</p>
        <h1>Editar tipo de entrada</h1>
      </header>
      <TicketTypeForm
        initialData={ticketType}
        circuitos={circuitos.filter((circuito) => (
          !circuito.deletedAt || String(circuito._id) === String(circuitId)
        ))}
        carreras={carreras.filter((carrera) => (
          !carrera.deletedAt || String(carrera._id) === String(raceId)
        ))}
        variants={variants.filter((variant) => (
          !variant.deletedAt || String(variant._id) === String(categoryId)
        ))}
        submitting={submitting}
        onSubmit={handleUpdate}
        onCancel={() => navigate('/ticket-types')}
      />
    </section>
  );
};

export default TicketTypeEditPage;
