import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { PilotoForm } from '../../features/pilotos/PilotoForm';
import { useCategoriasGlobales } from '../../hooks/useCategoriasGlobales';
import { useEscuderias } from '../../hooks/useEscuderias';
import { usePilotos } from '../../hooks/usePilotos';
import { normalizeApiError } from '../../utils/errorHandler';
import { showPilotoError, showPilotoSuccess } from '../../utils/sweetAlert';

export const PilotoEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateItem, getById: getPilotoById } = usePilotos();
  const { items: escuderias, loading: loadingEscuderias, error: errorEscuderias, reload } = useEscuderias();
  const {
    items: categorias,
    loading: loadingCategorias,
    error: errorCategorias,
    load: reloadCategorias
  } = useCategoriasGlobales();
  const [piloto, setPiloto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadPiloto = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPiloto(await getPilotoById(id));
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPiloto();
  }, [loadPiloto]);

  const handleUpdate = async (payload) => {
    setSubmitting(true);
    try {
      await updateItem(id, payload);
      await showPilotoSuccess('Piloto actualizado correctamente');
      navigate('/pilotos');
    } catch (requestError) {
      await showPilotoError(requestError, 'Error al actualizar el piloto');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingEscuderias || loadingCategorias) return <PilotoSkeleton />;
  if (error) return <PilotoError message={error} onRetry={loadPiloto} />;
  if (errorEscuderias) return <PilotoError message={errorEscuderias} onRetry={reload} />;
  if (errorCategorias) return <PilotoError message={errorCategorias} onRetry={reloadCategorias} />;
  if (!piloto) return <PilotoError message="No se encontró el piloto solicitado." />;

  return (
    <section className="page-container piloto-form-page">
      <header>
        <p className="piloto-eyebrow">Administración</p>
        <h1>Editar piloto</h1>
      </header>
      <PilotoForm
        initialData={piloto}
        escuderias={escuderias}
        categorias={categorias}
        submitting={submitting}
        onSubmit={handleUpdate}
        onCancel={() => navigate('/pilotos')}
      />
    </section>
  );
};

export default PilotoEditPage;
