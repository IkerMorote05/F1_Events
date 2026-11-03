import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Power, Trash2 } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { useLocations } from '../../hooks/useLocations';
import { confirmDeletion, showApiError, showSuccess } from '../../utils/sweetAlert';

export const LocationsListPage = () => {
  const navigate = useNavigate();
  const {
    items: locations,
    loading,
    error,
    load,
    updateItem,
    removeItem
  } = useLocations({ includeDeleted: true });

  const handleToggleActive = async (location) => {
    try {
      await updateItem(location._id, { isActive: location.isActive === false });
      await showSuccess(location.isActive === false
        ? 'Ubicación activada correctamente'
        : 'Ubicación desactivada correctamente');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo cambiar el estado de la ubicación');
    }
  };

  const handleDelete = async (location) => {
    if (!await confirmDeletion(`la ubicación "${location.ciudad}, ${location.pais}"`)) return;
    try {
      await removeItem(location._id);
      await showSuccess('Ubicación eliminada correctamente');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo eliminar la ubicación');
    }
  };

  if (loading) return <PilotoSkeleton resourceName="ubicaciones" />;
  if (error) return <PilotoError resourceName="ubicaciones" message={error} onRetry={load} />;

  const columns = [
    { key: 'ciudad', label: 'Ciudad', render: (location) => location.ciudad || '—' },
    { key: 'pais', label: 'País', render: (location) => location.pais || '—' },
    { key: 'capital', label: 'Capital', render: (location) => location.capital || '—' },
    {
      key: 'status',
      label: 'Estado',
      render: (location) => {
        const deleted = Boolean(location.deletedAt);
        const active = location.isActive !== false;
        return (
          <button
            type="button"
            className={`team-status-button ${deleted ? 'is-deleted' : active ? 'is-active' : 'is-inactive'}`}
            onClick={() => !deleted && handleToggleActive(location)}
            disabled={deleted}
            aria-pressed={!deleted && active}
            aria-label={deleted
              ? `Ubicación ${location.ciudad} eliminada`
              : `${active ? 'Desactivar' : 'Activar'} ubicación ${location.ciudad}`}
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
      render: (location) => location.deletedAt ? '—' : (
        <div className="piloto-row-actions">
          <button
            type="button"
            className="btn-edit team-action-button"
            onClick={() => navigate(`/locations/${location._id}/editar`)}
            aria-label={`Editar ubicación ${location.ciudad}`}
            title="Editar"
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="btn-delete team-action-button"
            onClick={() => handleDelete(location)}
            aria-label={`Eliminar ubicación ${location.ciudad}`}
            title="Eliminar"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      )
    }
  ];

  const activeLocations = locations.filter(
    (location) => !location.deletedAt && location.isActive !== false
  ).length;
  const deletedLocations = locations.filter((location) => location.deletedAt).length;

  return (
    <section className="page-container piloto-dashboard">
      <header className="page-header">
        <div>
          <p className="piloto-eyebrow">Administración</p>
          <h1>Ubicaciones</h1>
          <p>Gestiona las ciudades y países de los circuitos.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => navigate('/locations/nueva')}>
          + Nueva ubicación
        </button>
      </header>

      <div className="piloto-dashboard-stats" aria-label="Resumen de ubicaciones">
        <article className="piloto-stat">
          <span>Ubicaciones registradas</span>
          <strong>{locations.length}</strong>
        </article>
        <article className="piloto-stat">
          <span>Ubicaciones activas</span>
          <strong>{activeLocations}</strong>
        </article>
        <article className="piloto-stat">
          <span>Eliminadas</span>
          <strong>{deletedLocations}</strong>
        </article>
      </div>

      <h2>Gestión de ubicaciones</h2>
      <DataTable
        columns={columns}
        rows={locations}
        rowKey={(location) => location._id}
        emptyMessage="No hay ubicaciones registradas."
      />
    </section>
  );
};

export default LocationsListPage;
