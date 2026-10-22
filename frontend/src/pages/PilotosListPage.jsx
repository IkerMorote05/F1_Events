import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { PilotoError } from '../components/PilotoError';
import { PilotoSkeleton } from '../components/PilotoSkeleton';
import { usePilotos } from '../hooks/useF1Data';
import { getNationalityDisplay } from '../utils/nationality';
import { restorePiloto, setPilotoActive } from '../services/pilotoService';
import { confirmPilotoDeletion, showPilotoError, showPilotoSuccess } from '../utils/sweetAlert';
import { Pencil, Power, RotateCcw, Trash2 } from 'lucide-react';

const getAge = (date) => (date
  ? Math.floor((Date.now() - new Date(date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  : 'Desconocida');

export const PilotosListPage = () => {
  const navigate = useNavigate();
  const { items: pilotos, loading, error, load, removeItem } = usePilotos();

  const handleDelete = async (slug) => {
    if (!await confirmPilotoDeletion()) return;

    try {
      await removeItem(slug);
      await showPilotoSuccess('Piloto eliminado correctamente');
    } catch (requestError) {
      await showPilotoError(requestError, 'Error al eliminar el piloto');
    }
  };

  const handleToggleActive = async (piloto) => {
    try {
      await setPilotoActive(piloto.slug, piloto.isActive === false);
      await load();
      await showPilotoSuccess(piloto.isActive === false
        ? 'Piloto activado correctamente'
        : 'Piloto desactivado correctamente');
    } catch (requestError) {
      await showPilotoError(requestError, 'Error al cambiar el estado del piloto');
    }
  };

  const handleRestore = async (piloto) => {
    try {
      if (piloto.deletedAt) {
        await restorePiloto(piloto.slug);
      }
      if (piloto.isActive === false) {
        await setPilotoActive(piloto.slug, true);
      }
      await load();
      await showPilotoSuccess('Piloto reinstaurado correctamente');
    } catch (requestError) {
      await showPilotoError(requestError, 'Error al reinstaurar el piloto');
    }
  };

  if (loading) return <PilotoSkeleton />;
  if (error) return <PilotoError message={error} onRetry={load} />;

  const columns = [
    { key: 'numero', label: 'Número', render: (piloto) => `#${piloto.numero}` },
    {
      key: 'piloto',
      label: 'Piloto',
      render: (piloto) => `${piloto.nombre} ${piloto.apellidos || ''}`.trim()
    },
    {
      key: 'nacionalidad',
      label: 'Nacionalidad',
      render: (piloto) => {
        const display = getNationalityDisplay(piloto.nacionalidad);
        return display.length
          ? <span title={piloto.nacionalidad}>{display.map(({ flag, code }) => (
              <span key={`${flag}-${code}`}><span className={`fi fi-${flag}`} aria-hidden="true" /> {code} </span>
            ))}</span>
          : piloto.nacionalidad || 'Sin asignar';
      }
    },
    { key: 'escuderia', label: 'Escudería', render: (piloto) => piloto.escuderia?.nombre || 'Sin asignar' },
    { key: 'edad', label: 'Edad', render: (piloto) => getAge(piloto.fecha_nacimiento) },
    { key: 'puntos', label: 'Puntos', render: (piloto) => `${piloto.puntos || 0} PTS` },
    {
      key: 'estado',
      label: 'Estado',
      render: (piloto) => {
        const deleted = Boolean(piloto.deletedAt);
        const active = piloto.isActive !== false;
        return (
          <button
            type="button"
            className={`team-status-button ${deleted ? 'is-deleted' : active ? 'is-active' : 'is-inactive'}`}
            onClick={() => !deleted && handleToggleActive(piloto)}
            disabled={deleted}
            aria-pressed={!deleted && active}
            aria-label={deleted
              ? 'Piloto eliminado'
              : `${active ? 'Desactivar' : 'Activar'} piloto ${piloto.nombre}`}
            title={deleted ? 'Piloto eliminado' : active ? 'Desactivar piloto' : 'Activar piloto'}
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
      render: (piloto) => (
        <div className="piloto-row-actions">
          {piloto.deletedAt || piloto.isActive === false ? (
            <button
              type="button"
              className="btn-restore team-action-button"
              onClick={() => handleRestore(piloto)}
              aria-label={`Reinstaurar piloto ${piloto.nombre}`}
              title="Reinstaurar"
            >
              <RotateCcw size={16} aria-hidden="true" />
            </button>
          ) : null}
          {!piloto.deletedAt ? (
            <>
              <button
                type="button"
                className="btn-edit team-action-button"
                onClick={() => navigate(`/pilotos/${piloto._id}/editar`)}
                aria-label={`Editar piloto ${piloto.nombre}`}
                title="Editar"
              >
                <Pencil size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="btn-delete team-action-button"
                onClick={() => handleDelete(piloto.slug)}
                aria-label={`Eliminar piloto ${piloto.nombre}`}
                title="Eliminar"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </>
          ) : null}
        </div>
      )
    }
  ];

  const totalPuntos = pilotos.reduce((total, piloto) => total + (Number(piloto.puntos) || 0), 0);
  const equiposRepresentados = new Set(pilotos.map((piloto) => piloto.escuderia?._id || piloto.escuderia).filter(Boolean)).size;

  return (
    <section className="page-container piloto-dashboard">
      <header className="page-header">
        <div>
          <p className="piloto-eyebrow">Administración</p>
          <h1>Panel de pilotos</h1>
          <p>Gestiona los pilotos, sus datos y su escudería.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => navigate('/pilotos/nuevo')}>
          + Nuevo piloto
        </button>
      </header>

      <div className="piloto-dashboard-stats" aria-label="Resumen de pilotos">
        <article className="piloto-stat">
          <span>Pilotos registrados</span>
          <strong>{pilotos.length}</strong>
        </article>
        <article className="piloto-stat">
          <span>Escuderías representadas</span>
          <strong>{equiposRepresentados}</strong>
        </article>
        <article className="piloto-stat">
          <span>Puntos acumulados</span>
          <strong>{totalPuntos}</strong>
        </article>
      </div>

      <h2>Gestión de pilotos</h2>
      <DataTable
        columns={columns}
        rows={pilotos}
        rowKey={(piloto) => piloto._id}
        emptyMessage="No hay pilotos registrados."
      />
    </section>
  );
};

export default PilotosListPage;
