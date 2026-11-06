import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Power, Trash2 } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { useVariants } from '../../hooks/useVariants';
import { confirmDeletion, showApiError, showSuccess } from '../../utils/sweetAlert';

export const VariantsListPage = () => {
  const navigate = useNavigate();
  const { items: variants, loading, error, load, updateItem, removeItem } = useVariants();

  const handleToggleActive = async (variant) => {
    try {
      await updateItem(variant._id, { isActive: variant.isActive === false });
      await showSuccess(variant.isActive === false
        ? 'Variante activada correctamente'
        : 'Variante desactivada correctamente');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo cambiar el estado de la variante');
    }
  };

  const handleDelete = async (variant) => {
    if (!await confirmDeletion(`la variante "${variant.sku}"`)) return;
    try {
      await removeItem(variant._id);
      await showSuccess('Variante eliminada correctamente');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo eliminar la variante');
    }
  };

  if (loading) return <PilotoSkeleton resourceName="variantes" />;
  if (error) return <PilotoError resourceName="variantes" message={error} onRetry={load} />;

  const columns = [
    { key: 'sku', label: 'SKU', render: (variant) => variant.sku || 'Sin SKU' },
    { key: 'price', label: 'Precio', render: (variant) => variant.price ?? '—' },
    { key: 'descripcion', label: 'Descripción', render: (variant) => variant.descripcion || '—' },
    {
      key: 'percentage',
      label: 'Porcentaje',
      render: (variant) => Number.isFinite(Number(variant.percentage))
        ? `${Number(variant.percentage)} %`
        : 'Sin configurar'
    },
    {
      key: 'availability',
      label: 'Disponibles por circuito',
      render: (variant) => variant.availabilityByCircuit?.length
        ? (
            <ul className="piloto-availability-list">
              {variant.availabilityByCircuit.map((availability) => (
                <li key={availability.circuit._id}>
                  <strong>{availability.circuit.nombre}:</strong>{' '}
                  {availability.availableQuantity} entradas
                </li>
              ))}
            </ul>
          )
        : 'Sin carreras asignadas'
    },
    {
      key: 'categoriaEntrada',
      label: 'Categoría de entrada',
      render: (variant) => variant.categoriaEntrada?.categoriaEntrada || '—'
    },
    {
      key: 'categoriaGrada',
      label: 'Categoría de grada',
      render: (variant) => variant.categoriaGrada?.categoriaGrada || '—'
    },
    {
      key: 'status',
      label: 'Estado',
      render: (variant) => {
        const deleted = Boolean(variant.deletedAt);
        const active = variant.isActive !== false;
        return (
          <button
            type="button"
            className={`team-status-button ${deleted ? 'is-deleted' : active ? 'is-active' : 'is-inactive'}`}
            onClick={() => !deleted && handleToggleActive(variant)}
            disabled={deleted}
            aria-pressed={!deleted && active}
            aria-label={deleted
              ? `Variante ${variant.sku} eliminada`
              : `${active ? 'Desactivar' : 'Activar'} variante ${variant.sku}`}
          >
            <Power size={15} aria-hidden="true" />
            {deleted ? 'Eliminada' : active ? 'Activa' : 'Inactiva'}
          </button>
        );
      }
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (variant) => variant.deletedAt ? '—' : (
        <div className="piloto-row-actions">
          <button
            type="button"
            className="btn-edit team-action-button"
            onClick={() => navigate(`/variants/${variant._id}/editar`)}
            aria-label={`Editar variante ${variant.sku}`}
            title="Editar"
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="btn-delete team-action-button"
            onClick={() => handleDelete(variant)}
            aria-label={`Eliminar variante ${variant.sku}`}
            title="Eliminar"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      )
    }
  ];

  const activeVariants = variants.filter(
    (variant) => !variant.deletedAt && variant.isActive !== false
  ).length;
  const deletedVariants = variants.filter((variant) => variant.deletedAt).length;

  return (
    <section className="page-container piloto-dashboard">
      <header className="page-header">
        <div>
          <p className="piloto-eyebrow">Administración</p>
          <h1>Variantes</h1>
          <p>Gestiona descripción, precio, categorías, porcentaje y disponibilidad por circuito.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => navigate('/variants/nueva')}>
          + Nueva variante
        </button>
      </header>

      <div className="piloto-dashboard-stats" aria-label="Resumen de variantes">
        <article className="piloto-stat">
          <span>Variantes registradas</span>
          <strong>{variants.length}</strong>
        </article>
        <article className="piloto-stat">
          <span>Variantes activas</span>
          <strong>{activeVariants}</strong>
        </article>
        <article className="piloto-stat">
          <span>Eliminadas</span>
          <strong>{deletedVariants}</strong>
        </article>
      </div>

      <h2>Gestión de variantes</h2>
      <DataTable
        columns={columns}
        rows={variants}
        rowKey={(variant) => variant._id}
        emptyMessage="No hay variantes registradas."
      />
    </section>
  );
};

export default VariantsListPage;
