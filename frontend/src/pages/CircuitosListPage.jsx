import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Power, RotateCcw, Trash2 } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { PilotoError } from '../components/PilotoError';
import { PilotoSkeleton } from '../components/PilotoSkeleton';
import { useCircuitos } from '../hooks/useF1Data';
import { restoreCircuito, setCircuitoActive } from '../services/circuitoService';
import { confirmDeletion, showApiError, showSuccess } from '../utils/sweetAlert';

export const CircuitosListPage = () => {
  const navigate = useNavigate();
  const { items: circuitos, loading, error, load, removeItem } = useCircuitos();

  const handleToggleActive = async (circuito) => {
    const isActive = circuito.isActive === false;
    try {
      await setCircuitoActive(circuito.slug, isActive);
      await load();
      await showSuccess(isActive ? 'Circuito activado correctamente' : 'Circuito desactivado correctamente');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo cambiar el estado del circuito');
    }
  };

  const handleRestore = async (circuito) => {
    try {
      if (circuito.deletedAt) await restoreCircuito(circuito.slug);
      if (circuito.isActive === false) await setCircuitoActive(circuito.slug, true);
      await load();
      await showSuccess('Circuito reinstaurado correctamente');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo reinstaurar el circuito');
    }
  };

  const handleDelete = async (circuito) => {
    if (!await confirmDeletion(`el circuito ${circuito.nombre}`)) return;

    try {
      await removeItem(circuito.slug);
      await showSuccess('Circuito eliminado correctamente');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo eliminar el circuito');
    }
  };

  if (loading) return <PilotoSkeleton resourceName="circuitos" />;
  if (error) return <PilotoError resourceName="circuitos" message={error} onRetry={load} />;

  const columns = [
    { key: 'nombre', label: 'Circuito' },
    { key: 'pais', label: 'País' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'longitud', label: 'Longitud', render: (circuito) => `${circuito.longitud} km` },
    { key: 'ultimoGanador', label: 'Último ganador', render: (circuito) => circuito.ultimoGanador || 'N/A' },
    {
      key: 'estado',
      label: 'Estado',
      render: (circuito) => {
        const deleted = Boolean(circuito.deletedAt);
        const active = circuito.isActive !== false;
        return (
          <button
            type="button"
            className={`team-status-button ${deleted ? 'is-deleted' : active ? 'is-active' : 'is-inactive'}`}
            onClick={() => !deleted && handleToggleActive(circuito)}
            disabled={deleted}
            aria-pressed={!deleted && active}
            aria-label={deleted
              ? `Circuito ${circuito.nombre} eliminado`
              : `${active ? 'Desactivar' : 'Activar'} circuito ${circuito.nombre}`}
            title={deleted ? 'Circuito eliminado' : active ? 'Desactivar circuito' : 'Activar circuito'}
          >
            <Power size={15} aria-hidden="true" />
            {deleted ? 'Eliminado' : active ? 'Activo' : 'Inactivo'}
          </button>
        );
      }
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (circuito) => (
        <div className="piloto-row-actions">
          {circuito.deletedAt || circuito.isActive === false ? (
            <button type="button" className="btn-restore team-action-button" onClick={() => handleRestore(circuito)}
              aria-label={`Reinstaurar circuito ${circuito.nombre}`} title="Reinstaurar">
              <RotateCcw size={16} aria-hidden="true" />
            </button>
          ) : null}
          {!circuito.deletedAt ? (
            <>
              <button type="button" className="btn-edit team-action-button"
                onClick={() => navigate(`/circuitos/${circuito._id}/editar`)}
                aria-label={`Editar circuito ${circuito.nombre}`} title="Editar">
                <Pencil size={16} aria-hidden="true" />
              </button>
              <button type="button" className="btn-delete team-action-button" onClick={() => handleDelete(circuito)}
                aria-label={`Eliminar circuito ${circuito.nombre}`} title="Eliminar">
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </>
          ) : null}
        </div>
      )
    }
  ];

  const paises = new Set(circuitos.map((circuito) => circuito.pais).filter(Boolean)).size;
  const activos = circuitos.filter((circuito) => !circuito.deletedAt && circuito.isActive !== false).length;

  return (
    <section className="page-container piloto-dashboard">
      <header className="page-header">
        <div>
          <p className="piloto-eyebrow">Administración</p>
          <h1>Panel de circuitos</h1>
          <p>Gestiona los circuitos, sus datos y sus vueltas rápidas.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => navigate('/circuitos/nuevo')}>
          + Nuevo circuito
        </button>
      </header>

      <div className="piloto-dashboard-stats" aria-label="Resumen de circuitos">
        <article className="piloto-stat"><span>Circuitos registrados</span><strong>{circuitos.length}</strong></article>
        <article className="piloto-stat"><span>Países representados</span><strong>{paises}</strong></article>
        <article className="piloto-stat"><span>Circuitos activos</span><strong>{activos}</strong></article>
      </div>

      <h2>Gestión de circuitos</h2>
      <DataTable columns={columns} rows={circuitos} rowKey={(circuito) => circuito._id}
        emptyMessage="No hay circuitos registrados." />
    </section>
  );
};

export default CircuitosListPage;
