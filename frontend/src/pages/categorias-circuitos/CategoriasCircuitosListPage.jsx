import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Power, Trash2 } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { useCategoriasCircuitos } from '../../hooks/useCategoriasCircuitos';
import { confirmDeletion, showApiError, showSuccess } from '../../utils/sweetAlert';

export const CategoriasCircuitosListPage = () => {
  const navigate = useNavigate();
  const {
    items: categorias,
    loading,
    error,
    load,
    updateItem,
    removeItem
  } = useCategoriasCircuitos();

  const handleToggleActive = async (categoria) => {
    try {
      await updateItem(categoria._id, { isActive: categoria.isActive === false });
      await showSuccess(categoria.isActive === false
        ? 'Categoría activada correctamente'
        : 'Categoría desactivada correctamente');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo cambiar el estado de la categoría');
    }
  };

  const handleDelete = async (categoria) => {
    const categoryName = categoria.tipo || categoria.desgaste || categoria.categoriaEntrada || categoria.categoriaGrada;
    if (!await confirmDeletion(`la categoría "${categoryName}"`)) return;

    try {
      await removeItem(categoria._id);
      await showSuccess('Categoría eliminada correctamente');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo eliminar la categoría');
    }
  };

  if (loading) return <PilotoSkeleton resourceName="categorías de circuitos" />;
  if (error) {
    return <PilotoError resourceName="categorías de circuitos" message={error} onRetry={load} />;
  }

  const columns = [
    {
      key: 'category',
      label: 'Categoría',
      render: (categoria) => (
        categoria.tipo || categoria.desgaste || categoria.categoriaEntrada || categoria.categoriaGrada || 'Sin nombre'
      )
    },
    {
      key: 'field',
      label: 'Clase',
      render: (categoria) => categoria.tipo
        ? 'Tipo de circuito'
        : categoria.desgaste
          ? 'Desgaste'
          : categoria.categoriaEntrada
            ? 'Categoría de entrada'
            : 'Categoría de grada'
    },
    {
      key: 'status',
      label: 'Estado',
      render: (categoria) => {
        const deleted = Boolean(categoria.deletedAt);
        const active = categoria.isActive !== false;
        return (
          <button
            type="button"
            className={`team-status-button ${deleted ? 'is-deleted' : active ? 'is-active' : 'is-inactive'}`}
            onClick={() => !deleted && handleToggleActive(categoria)}
            disabled={deleted}
            aria-pressed={!deleted && active}
            aria-label={deleted
              ? `Categoría ${categoria.tipo || categoria.desgaste || categoria.categoriaEntrada || categoria.categoriaGrada} eliminada`
              : `${active ? 'Desactivar' : 'Activar'} categoría ${categoria.tipo || categoria.desgaste || categoria.categoriaEntrada || categoria.categoriaGrada}`}
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
      render: (categoria) => (
        categoria.deletedAt ? '—' : (
          <div className="piloto-row-actions">
            <button
              type="button"
              className="btn-edit team-action-button"
              onClick={() => navigate(`/categorias-circuitos/${categoria._id}/editar`)}
              aria-label={`Editar categoría ${categoria.tipo || categoria.desgaste || categoria.categoriaEntrada || categoria.categoriaGrada}`}
              title="Editar"
            >
              <Pencil size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="btn-delete team-action-button"
              onClick={() => handleDelete(categoria)}
              aria-label={`Eliminar categoría ${categoria.tipo || categoria.desgaste || categoria.categoriaEntrada || categoria.categoriaGrada}`}
              title="Eliminar"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>
        )
      )
    }
  ];

  const activas = categorias.filter((categoria) => !categoria.deletedAt && categoria.isActive !== false).length;
  const eliminadas = categorias.filter((categoria) => categoria.deletedAt).length;

  return (
    <section className="page-container piloto-dashboard">
      <header className="page-header">
        <div>
          <p className="piloto-eyebrow">Administración</p>
          <h1>Categorías de circuitos</h1>
          <p>Gestiona tipos de circuito, niveles de desgaste y categorías de entrada y grada.</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate('/categorias-circuitos/nueva')}
        >
          + Nueva categoría
        </button>
      </header>

      <div className="piloto-dashboard-stats" aria-label="Resumen de categorías de circuitos">
        <article className="piloto-stat">
          <span>Categorías registradas</span>
          <strong>{categorias.length}</strong>
        </article>
        <article className="piloto-stat">
          <span>Categorías activas</span>
          <strong>{activas}</strong>
        </article>
        <article className="piloto-stat">
          <span>Eliminadas</span>
          <strong>{eliminadas}</strong>
        </article>
      </div>

      <h2>Gestión de categorías</h2>
      <DataTable
        columns={columns}
        rows={categorias}
        rowKey={(categoria) => categoria._id}
        emptyMessage="No hay categorías de circuitos registradas."
      />
    </section>
  );
};

export default CategoriasCircuitosListPage;
