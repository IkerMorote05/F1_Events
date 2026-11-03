import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoriaCircuitosForm } from '../../features/categorias-circuitos/CategoriaCircuitosForm';
import { useCategoriasCircuitos } from '../../hooks/useCategoriasCircuitos';
import { showApiError, showSuccess } from '../../utils/sweetAlert';

export const CategoriaCircuitosCreatePage = () => {
  const navigate = useNavigate();
  const { createItem } = useCategoriasCircuitos();
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (payload) => {
    setSubmitting(true);
    try {
      await createItem(payload);
      await showSuccess('Categoría creada correctamente');
      navigate('/categorias-circuitos');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo guardar la categoría');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-container piloto-form-page">
      <header>
        <p className="piloto-eyebrow">Administración</p>
        <h1>Nueva categoría de circuito</h1>
      </header>
      <CategoriaCircuitosForm
        submitting={submitting}
        onSubmit={handleCreate}
        onCancel={() => navigate('/categorias-circuitos')}
      />
    </section>
  );
};

export default CategoriaCircuitosCreatePage;
