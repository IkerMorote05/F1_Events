import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { VariantForm } from '../../features/variants/VariantForm';
import { useVariants } from '../../hooks/useVariants';
import { normalizeApiError } from '../../utils/errorHandler';
import { showApiError, showSuccess } from '../../utils/sweetAlert';

export const VariantEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, updateItem } = useVariants();
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadVariant = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setVariant(await getById(id));
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, [getById, id]);

  useEffect(() => {
    loadVariant();
  }, [loadVariant]);

  const handleUpdate = async (payload) => {
    setSubmitting(true);
    try {
      await updateItem(id, payload);
      await showSuccess('Variante actualizada correctamente');
      navigate('/variants');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo actualizar la variante');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PilotoSkeleton resourceName="variantes" />;
  if (error) return <PilotoError resourceName="variantes" message={error} onRetry={loadVariant} />;
  if (!variant) {
    return <PilotoError resourceName="variantes" message="No se encontró la variante solicitada." />;
  }
  if (variant.deletedAt) {
    return <PilotoError resourceName="variantes" message="No se puede editar una variante eliminada." />;
  }

  return (
    <section className="page-container piloto-form-page">
      <header>
        <p className="piloto-eyebrow">Administración</p>
        <h1>Editar variante</h1>
      </header>
      <VariantForm
        initialData={variant}
        submitting={submitting}
        onSubmit={handleUpdate}
        onCancel={() => navigate('/variants')}
      />
    </section>
  );
};

export default VariantEditPage;
