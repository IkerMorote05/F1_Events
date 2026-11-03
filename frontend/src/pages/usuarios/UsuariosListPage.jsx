import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Power, Trash2 } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { useUsuarios } from '../../hooks/useUsuarios';
import { confirmDeletion, showApiError, showSuccess } from '../../utils/sweetAlert';

export const UsuariosListPage = () => {
  const navigate = useNavigate();
  const { items: usuarios, loading, error, load, updateItem, removeItem } = useUsuarios();

  const handleToggleActive = async (usuario) => {
    try {
      await updateItem(usuario._id, { isActive: usuario.isActive === false });
      await showSuccess(usuario.isActive === false
        ? 'Usuario activado correctamente'
        : 'Usuario desactivado correctamente');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo cambiar el estado del usuario');
    }
  };

  const handleDelete = async (usuario) => {
    const name = `${usuario.nombre} ${usuario.apellidos || ''}`.trim();
    if (!await confirmDeletion(`al usuario "${name}"`)) return;
    try {
      await removeItem(usuario._id);
      await showSuccess('Usuario eliminado correctamente');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo eliminar el usuario');
    }
  };

  if (loading) return <PilotoSkeleton resourceName="usuarios" />;
  if (error) return <PilotoError resourceName="usuarios" message={error} onRetry={load} />;

  const columns = [
    {
      key: 'nombre',
      label: 'Usuario',
      render: (usuario) => `${usuario.nombre} ${usuario.apellidos || ''}`.trim()
    },
    { key: 'email', label: 'Correo electrónico' },
    { key: 'roles', label: 'Rol', render: (usuario) => usuario.roles?.nombre || 'Sin asignar' },
    {
      key: 'avatar',
      label: 'Avatar',
      render: (usuario) => usuario.avatar?.image_url
        ? <a href={usuario.avatar.image_url} target="_blank" rel="noreferrer">Ver imagen</a>
        : 'Sin avatar'
    },
    {
      key: 'status',
      label: 'Estado',
      render: (usuario) => {
        const deleted = Boolean(usuario.deletedAt);
        const active = usuario.isActive !== false;
        return (
          <button
            type="button"
            className={`team-status-button ${deleted ? 'is-deleted' : active ? 'is-active' : 'is-inactive'}`}
            onClick={() => !deleted && handleToggleActive(usuario)}
            disabled={deleted}
            aria-pressed={!deleted && active}
            aria-label={deleted
              ? `Usuario ${usuario.nombre} eliminado`
              : `${active ? 'Desactivar' : 'Activar'} usuario ${usuario.nombre}`}
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
      render: (usuario) => usuario.deletedAt ? '—' : (
        <div className="piloto-row-actions">
          <button
            type="button"
            className="btn-edit team-action-button"
            onClick={() => navigate(`/usuarios/${usuario._id}/editar`)}
            aria-label={`Editar usuario ${usuario.nombre}`}
            title="Editar"
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="btn-delete team-action-button"
            onClick={() => handleDelete(usuario)}
            aria-label={`Eliminar usuario ${usuario.nombre}`}
            title="Eliminar"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      )
    }
  ];

  const activeUsers = usuarios.filter((usuario) => !usuario.deletedAt && usuario.isActive !== false).length;
  const deletedUsers = usuarios.filter((usuario) => usuario.deletedAt).length;

  return (
    <section className="page-container piloto-dashboard">
      <header className="page-header">
        <div>
          <p className="piloto-eyebrow">Administración</p>
          <h1>Usuarios</h1>
          <p>Gestiona las cuentas y sus roles.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => navigate('/usuarios/nuevo')}>
          + Nuevo usuario
        </button>
      </header>

      <div className="piloto-dashboard-stats" aria-label="Resumen de usuarios">
        <article className="piloto-stat">
          <span>Usuarios registrados</span>
          <strong>{usuarios.length}</strong>
        </article>
        <article className="piloto-stat">
          <span>Usuarios activos</span>
          <strong>{activeUsers}</strong>
        </article>
        <article className="piloto-stat">
          <span>Eliminados</span>
          <strong>{deletedUsers}</strong>
        </article>
      </div>

      <h2>Gestión de usuarios</h2>
      <DataTable
        columns={columns}
        rows={usuarios}
        rowKey={(usuario) => usuario._id}
        emptyMessage="No hay usuarios registrados."
      />
    </section>
  );
};

export default UsuariosListPage;
