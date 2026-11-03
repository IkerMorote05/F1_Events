import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Power, Trash2 } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { useRoles } from '../../hooks/useRoles';
import { confirmDeletion, showApiError, showSuccess } from '../../utils/sweetAlert';

export const RolesListPage = () => {
  const navigate = useNavigate();
  const { items: roles, loading, error, load, updateItem, removeItem } = useRoles();

  const handleToggleActive = async (rol) => {
    try {
      await updateItem(rol._id, { isActive: rol.isActive === false });
      await showSuccess(rol.isActive === false
        ? 'Rol activado correctamente'
        : 'Rol desactivado correctamente');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo cambiar el estado del rol');
    }
  };

  const handleDelete = async (rol) => {
    if (!await confirmDeletion(`el rol "${rol.nombre}"`)) return;
    try {
      await removeItem(rol._id);
      await showSuccess('Rol eliminado correctamente');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo eliminar el rol');
    }
  };

  if (loading) return <PilotoSkeleton resourceName="roles" />;
  if (error) return <PilotoError resourceName="roles" message={error} onRetry={load} />;

  const columns = [
    { key: 'nombre', label: 'Nombre', render: (rol) => rol.nombre || 'Sin nombre' },
    { key: 'description', label: 'Descripción', render: (rol) => rol.description || '—' },
    {
      key: 'status',
      label: 'Estado',
      render: (rol) => {
        const deleted = Boolean(rol.deletedAt);
        const active = rol.isActive !== false;
        return (
          <button
            type="button"
            className={`team-status-button ${deleted ? 'is-deleted' : active ? 'is-active' : 'is-inactive'}`}
            onClick={() => !deleted && handleToggleActive(rol)}
            disabled={deleted}
            aria-pressed={!deleted && active}
            aria-label={deleted
              ? `Rol ${rol.nombre} eliminado`
              : `${active ? 'Desactivar' : 'Activar'} rol ${rol.nombre}`}
          >
            <Power size={15} aria-hidden="true" />
            {deleted ? 'Eliminado' : active ? 'Activo' : 'Inactivo'}
          </button>
        );
      }
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (rol) => rol.deletedAt ? '—' : (
        <div className="piloto-row-actions">
          <button
            type="button"
            className="btn-edit team-action-button"
            onClick={() => navigate(`/roles/${rol._id}/editar`)}
            aria-label={`Editar rol ${rol.nombre}`}
            title="Editar"
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="btn-delete team-action-button"
            onClick={() => handleDelete(rol)}
            aria-label={`Eliminar rol ${rol.nombre}`}
            title="Eliminar"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      )
    }
  ];

  const activeRoles = roles.filter((rol) => !rol.deletedAt && rol.isActive !== false).length;
  const deletedRoles = roles.filter((rol) => rol.deletedAt).length;

  return (
    <section className="page-container piloto-dashboard">
      <header className="page-header">
        <div>
          <p className="piloto-eyebrow">Administración</p>
          <h1>Roles</h1>
          <p>Gestiona los roles asignables a los usuarios.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => navigate('/roles/nuevo')}>
          + Nuevo rol
        </button>
      </header>

      <div className="piloto-dashboard-stats" aria-label="Resumen de roles">
        <article className="piloto-stat">
          <span>Roles registrados</span>
          <strong>{roles.length}</strong>
        </article>
        <article className="piloto-stat">
          <span>Roles activos</span>
          <strong>{activeRoles}</strong>
        </article>
        <article className="piloto-stat">
          <span>Eliminados</span>
          <strong>{deletedRoles}</strong>
        </article>
      </div>

      <h2>Gestión de roles</h2>
      <DataTable
        columns={columns}
        rows={roles}
        rowKey={(rol) => rol._id}
        emptyMessage="No hay roles registrados."
      />
    </section>
  );
};

export default RolesListPage;
