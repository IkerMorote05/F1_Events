import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { CircuitoForm } from '../../features/circuitos/CircuitoForm';
import { useCategoriasCircuitos } from '../../hooks/useCategoriasCircuitos';
import { useCategoriasGlobales } from '../../hooks/useCategoriasGlobales';
import { useCircuitos } from '../../hooks/useCircuitos';
import { useLocations } from '../../hooks/useLocations';
import { syncCircuitoImages } from '../../services/circuitoService';
import { normalizeApiError } from '../../utils/errorHandler';
import { showApiError, showSuccess } from '../../utils/sweetAlert';

export const CircuitoEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateItem, getById: getCircuitoById } = useCircuitos();
  const {
    items: locations,
    loading: loadingLocations,
    error: errorLocations,
    load: reloadLocations
  } = useLocations();
  const {
    items: categoriasGlobales,
    loading: loadingCategorias,
    error: errorCategorias,
    load: reloadCategorias
  } = useCategoriasGlobales();
  const {
    items: categoriasCircuitos,
    loading: loadingCategoriasCircuitos,
    error: errorCategoriasCircuitos,
    load: reloadCategoriasCircuitos
  } = useCategoriasCircuitos();
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

  const handleUpdate = async (payload, images) => {
    setSubmitting(true);
    try {
      await updateItem(id, payload);
      try {
        await syncCircuitoImages(id, images, circuito.images || []);
      } catch (imageError) {
        await loadCircuito();
        await showApiError(imageError, 'El circuito se actualizó, pero no se pudieron guardar todas las imágenes');
        return;
      }
      await showSuccess('Circuito actualizado correctamente');
      navigate('/circuitos');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo actualizar el circuito');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingLocations || loadingCategorias || loadingCategoriasCircuitos) {
    return <PilotoSkeleton resourceName="circuitos" />;
  }
  if (error) return <PilotoError resourceName="circuitos" message={error} onRetry={loadCircuito} />;
  if (errorLocations) return <PilotoError message={errorLocations} onRetry={reloadLocations} />;
  if (errorCategorias) return <PilotoError message={errorCategorias} onRetry={reloadCategorias} />;
  if (errorCategoriasCircuitos) {
    return <PilotoError message={errorCategoriasCircuitos} onRetry={reloadCategoriasCircuitos} />;
  }
  if (!circuito) return <PilotoError resourceName="circuitos" message="No se encontró el circuito solicitado." />;

  return (
    <section className="page-container piloto-form-page">
      <header><p className="piloto-eyebrow">Administración</p><h1>Editar circuito</h1></header>
      <CircuitoForm initialData={circuito} locations={locations} categoriasGlobales={categoriasGlobales}
        categoriasCircuitos={categoriasCircuitos} submitting={submitting} onSubmit={handleUpdate}
        onCancel={() => navigate('/circuitos')} />
    </section>
  );
};

export default CircuitoEditPage;
