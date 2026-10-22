import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { PilotoError } from '../components/PilotoError';
import { PilotoSkeleton } from '../components/PilotoSkeleton';
import { useEscuderias, usePilotos } from '../hooks/useF1Data';
import { TEAM_COLORS } from '../components/teamColors';
import { confirmDeletion, showApiError, showSuccess } from '../utils/sweetAlert';
import { restoreEscuderia, setEscuderiaActive } from '../services/escuderiaService';
import { Pencil, Power, RotateCcw, Trash2 } from 'lucide-react';
import { calculateEscuderiaPoints } from '../utils/escuderiaPoints';

export const EscuderiasListPage = () => {
  const navigate = useNavigate();
  const { items: escuderias, loading, error, load, removeItem } = useEscuderias();
  const {
    items: pilotos,
    loading: pilotosLoading,
    error: pilotosError,
    load: loadPilotos
  } = usePilotos();
  const puntosPorEscuderia = calculateEscuderiaPoints(pilotos);
  const handleRetry = () => Promise.all([load(), loadPilotos()]);

  const handleToggleActive = async (escuderia) => {
    const isActive = escuderia.isActive === false;
    try {
      await setEscuderiaActive(escuderia.slug, isActive);
      await load();
      await showSuccess(isActive ? 'Escudería activada correctamente' : 'Escudería desactivada correctamente');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo cambiar el estado de la escudería');
    }
  };

  const handleRestore = async (escuderia) => {
    try {
      await restoreEscuderia(escuderia.slug);
      await load();
      await showSuccess('Escudería reinstaurada correctamente');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo reinstaurar la escudería');
    }
  };

  const handleDelete = async (escuderia) => {
    if (!await confirmDeletion(`la escudería ${escuderia.nombre}`)) return;

    try {
      await removeItem(escuderia.slug);
      await showSuccess('Escudería eliminada correctamente');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo eliminar la escudería');
    }
  };

  if (loading || pilotosLoading) return <PilotoSkeleton resourceName="escuderías" />;
  if (error || pilotosError) {
    return <PilotoError resourceName="escuderías" message={error || pilotosError} onRetry={handleRetry} />;
  }

  const columns = [
    {
      key: 'nombre',
      label: 'Escudería',
      render: (escuderia) => (
        <span className="team-table-name">
          <span
            className="team-table-color"
            style={{ backgroundColor: TEAM_COLORS[escuderia.siglas]?.primary || '#e10600' }}
            aria-hidden="true"
          />
          {escuderia.nombre}
        </span>
      )
    },
    { key: 'pais', label: 'País' },
    { key: 'motor', label: 'Motor', render: (escuderia) => escuderia.motor || 'N/A' },
    { key: 'jefe', label: 'Jefe de equipo', render: (escuderia) => escuderia.jefe || 'N/A' },
    { key: 'año', label: 'Fundación', render: (escuderia) => escuderia.año || 'N/A' },
    {
      key: 'puntos',
      label: 'Puntos',
      render: (escuderia) => `${puntosPorEscuderia.get(String(escuderia._id)) || 0} PTS`
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (escuderia) => {
        const deleted = Boolean(escuderia.deletedAt);
        const isActive = escuderia.isActive !== false;
        return (
          <button
            type="button"
            className={`team-status-button ${deleted ? 'is-deleted' : isActive ? 'is-active' : 'is-inactive'}`}
            onClick={() => !deleted && handleToggleActive(escuderia)}
            disabled={deleted}
            aria-pressed={!deleted && isActive}
            aria-label={deleted
              ? `Escudería ${escuderia.nombre} eliminada`
              : `${isActive ? 'Desactivar' : 'Activar'} escudería ${escuderia.nombre}`}
            title={deleted ? 'Escudería eliminada' : isActive ? 'Desactivar escudería' : 'Activar escudería'}
          >
            <Power size={15} aria-hidden="true" />
            {deleted ? 'Eliminada' : isActive ? 'Activa' : 'Inactiva'}
          </button>
        );
      }
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (escuderia) => (
        <div className="piloto-row-actions">
          {escuderia.deletedAt ? (
            <button
              type="button"
              className="btn-restore team-action-button"
              onClick={() => handleRestore(escuderia)}
              aria-label={`Reinstaurar escudería ${escuderia.nombre}`}
              title="Reinstaurar"
            >
              <RotateCcw size={16} aria-hidden="true" />
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn-edit team-action-button"
                onClick={() => navigate(`/escuderias/${escuderia._id}/editar`)}
                aria-label={`Editar escudería ${escuderia.nombre}`}
                title="Editar"
              >
                <Pencil size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="btn-delete team-action-button"
                onClick={() => handleDelete(escuderia)}
                aria-label={`Eliminar escudería ${escuderia.nombre}`}
                title="Eliminar"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  const puntosTotales = escuderias.reduce(
    (total, escuderia) => total + (puntosPorEscuderia.get(String(escuderia._id)) || 0),
    0
  );

  return (
    <section className="page-container piloto-dashboard">
      <header className="page-header">
        <div>
          <p className="piloto-eyebrow">Administración</p>
          <h1>Panel de escuderías</h1>
          <p>Gestiona las escuderías, sus datos y puntos.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => navigate('/escuderias/nueva')}>
          + Nueva escudería
        </button>
      </header>

      <div className="piloto-dashboard-stats" aria-label="Resumen de escuderías">
        <article className="piloto-stat">
          <span>Escuderías registradas</span>
          <strong>{escuderias.length}</strong>
        </article>
        <article className="piloto-stat">
          <span>Puntos acumulados</span>
          <strong>{puntosTotales}</strong>
        </article>
      </div>

      <h2>Gestión de escuderías</h2>
      <DataTable
        columns={columns}
        rows={escuderias}
        rowKey={(escuderia) => escuderia._id}
        emptyMessage="No hay escuderías registradas."
      />
    </section>
  );
};

export default EscuderiasListPage;
