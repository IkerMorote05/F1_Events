import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PilotoError } from '../../components/PilotoError';
import { CircuitoForm } from '../../features/circuitos/CircuitoForm';
import { useCategoriasCircuitos } from '../../hooks/useCategoriasCircuitos';
import { useCategoriasGlobales } from '../../hooks/useCategoriasGlobales';
import { useCircuitos } from '../../hooks/useCircuitos';
import { useLocations } from '../../hooks/useLocations';
import { syncCircuitoImages } from '../../services/circuitoService';
import { showApiError, showSuccess } from '../../utils/sweetAlert';

export const CircuitoCreatePage = () => {
  const navigate = useNavigate();
  const { createItem } = useCircuitos();
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
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (payload, images) => {
    setSubmitting(true);
    try {
      const circuito = await createItem(payload);
      try {
        await syncCircuitoImages(circuito._id, images);
      } catch (imageError) {
        await showApiError(imageError, 'El circuito se creó, pero no se pudieron guardar todas las imágenes');
        navigate(circuito._id ? `/circuitos/${circuito._id}/editar` : '/circuitos');
        return;
      }
      await showSuccess('Circuito creado correctamente');
      navigate('/circuitos');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo guardar el circuito');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingLocations || loadingCategorias || loadingCategoriasCircuitos) {
    return <p className="page-container">Cargando datos del circuito...</p>;
  }
  if (errorLocations) return <PilotoError message={errorLocations} onRetry={reloadLocations} />;
  if (errorCategorias) return <PilotoError message={errorCategorias} onRetry={reloadCategorias} />;
  if (errorCategoriasCircuitos) {
    return <PilotoError message={errorCategoriasCircuitos} onRetry={reloadCategoriasCircuitos} />;
  }

  return (
    <section className="page-container piloto-form-page">
      <header><p className="piloto-eyebrow">Administración</p><h1>Nuevo circuito</h1></header>
      <CircuitoForm locations={locations} categoriasGlobales={categoriasGlobales}
        categoriasCircuitos={categoriasCircuitos} submitting={submitting}
        onSubmit={handleCreate} onCancel={() => navigate('/circuitos')} />
    </section>
  );
};

export default CircuitoCreatePage;
