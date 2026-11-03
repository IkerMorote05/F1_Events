import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { CategoriaCircuitosForm } from '../../features/categorias-circuitos/CategoriaCircuitosForm';
import { useCategoriasCircuitos } from '../../hooks/useCategoriasCircuitos';
import { normalizeApiError } from '../../utils/errorHandler';
import { showApiError, showSuccess } from '../../utils/sweetAlert';

export const CategoriaCircuitosEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, updateItem } = useCategoriasCircuitos();
  const [categoria, setCategoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadCategoria = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCategoria(await getById(id));
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, [getById, id]);

  useEffect(() => {
    loadCategoria();
  }, [loadCategoria]);

  const handleUpdate = async (payload) => {
    setSubmitting(true);
    try {
      await updateItem(id, payload);
      await showSuccess('Categoría actualizada correctamente');
      navigate('/categorias-circuitos');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo actualizar la categoría');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PilotoSkeleton resourceName="categorías de circuitos" />;
  if (error) {
    return <PilotoError resourceName="categorías de circuitos" message={error} onRetry={loadCategoria} />;
  }
  if (!categoria) {
    return <PilotoError resourceName="categorías de circuitos" message="No se encontró la categoría solicitada." />;
  }
  if (categoria.deletedAt) {
    return (
      <PilotoError
        resourceName="categorías de circuitos"
        message="No se puede editar una categoría eliminada."
      />
    );
  }

  return (
    <section className="page-container piloto-form-page">
      <header>
        <p className="piloto-eyebrow">Administración</p>
        <h1>Editar categoría de circuito</h1>
      </header>
      <CategoriaCircuitosForm
        initialData={categoria}
        submitting={submitting}
        onSubmit={handleUpdate}
        onCancel={() => navigate('/categorias-circuitos')}
      />
    </section>
  );
};

export default CategoriaCircuitosEditPage;
