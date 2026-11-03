import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoriaGlobalForm } from '../../features/categorias-globales/CategoriaGlobalForm';
import { useCategoriasGlobales } from '../../hooks/useCategoriasGlobales';
import { showApiError, showSuccess } from '../../utils/sweetAlert';

export const CategoriaGlobalCreatePage = () => {
  const navigate = useNavigate();
  const { createItem } = useCategoriasGlobales();
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (payload) => {
    setSubmitting(true);
    try {
      await createItem(payload);
      await showSuccess('Categoría creada correctamente');
      navigate('/categorias-globales');
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
        <h1>Nueva categoría global</h1>
      </header>
      <CategoriaGlobalForm
        submitting={submitting}
        onSubmit={handleCreate}
        onCancel={() => navigate('/categorias-globales')}
      />
    </section>
  );
};

export default CategoriaGlobalCreatePage;
