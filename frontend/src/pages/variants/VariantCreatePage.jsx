import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VariantForm } from '../../features/variants/VariantForm';
import { useVariants } from '../../hooks/useVariants';
import { showApiError, showSuccess } from '../../utils/sweetAlert';

export const VariantCreatePage = () => {
  const navigate = useNavigate();
  const { createItem } = useVariants();
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (payload) => {
    setSubmitting(true);
    try {
      await createItem(payload);
      await showSuccess('Variante creada correctamente');
      navigate('/variants');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo guardar la variante');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-container piloto-form-page">
      <header>
        <p className="piloto-eyebrow">Administración</p>
        <h1>Nueva variante</h1>
      </header>
      <VariantForm
        submitting={submitting}
        onSubmit={handleCreate}
        onCancel={() => navigate('/variants')}
      />
    </section>
  );
};

export default VariantCreatePage;
