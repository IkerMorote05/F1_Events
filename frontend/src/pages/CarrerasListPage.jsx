import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Power, RotateCcw, Trash2 } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { PilotoError } from '../components/PilotoError';
import { PilotoSkeleton } from '../components/PilotoSkeleton';
import { useCarreras } from '../hooks/useF1Data';
import { restoreCarrera, setCarreraActive } from '../services/carreraService';
import { confirmDeletion, showApiError, showSuccess } from '../utils/sweetAlert';

const formatDate = (value) => value
  ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(value))
  : 'N/A';

export const CarrerasListPage = () => {
  const navigate = useNavigate();
  const { items: carreras, loading, error, load, removeItem } = useCarreras();

  const handleToggleActive = async (carrera) => {
    const isActive = carrera.isActive === false;
    try {
      await setCarreraActive(carrera.slug, isActive);
      await load();
      await showSuccess(isActive ? 'Carrera activada correctamente' : 'Carrera desactivada correctamente');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo cambiar el estado de la carrera');
    }
  };

  const handleRestore = async (carrera) => {
    try {
      if (carrera.deletedAt) await restoreCarrera(carrera.slug);
      if (carrera.isActive === false) await setCarreraActive(carrera.slug, true);
      await load();
      await showSuccess('Carrera reinstaurada correctamente');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo reinstaurar la carrera');
    }
  };

  const handleDelete = async (carrera) => {
    if (!await confirmDeletion(`la carrera ${carrera.nombre}`)) return;

    try {
      await removeItem(carrera.slug);
      await showSuccess('Carrera eliminada correctamente');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo eliminar la carrera');
    }
  };

  if (loading) return <PilotoSkeleton resourceName="carreras" />;
  if (error) return <PilotoError resourceName="carreras" message={error} onRetry={load} />;

  const columns = [
    { key: 'nombre', label: 'Carrera' },
    { key: 'fecha', label: 'Fecha', render: (carrera) => formatDate(carrera.fecha) },
    { key: 'circuito', label: 'Circuito', render: (carrera) => carrera.circuito?.nombre || 'Sin circuito' },
    { key: 'capacidad', label: 'Capacidad', render: (carrera) => Number(carrera.capacidad).toLocaleString('es-ES') },
    {
      key: 'estado',
      label: 'Estado',
      render: (carrera) => {
        const deleted = Boolean(carrera.deletedAt);
        const active = carrera.isActive !== false;
        return (
          <button
            type="button"
            className={`team-status-button ${deleted ? 'is-deleted' : active ? 'is-active' : 'is-inactive'}`}
            onClick={() => !deleted && handleToggleActive(carrera)}
            disabled={deleted}
            aria-pressed={!deleted && active}
            aria-label={deleted
              ? `Carrera ${carrera.nombre} eliminada`
              : `${active ? 'Desactivar' : 'Activar'} carrera ${carrera.nombre}`}
            title={deleted ? 'Carrera eliminada' : active ? 'Desactivar carrera' : 'Activar carrera'}
          >
            <Power size={15} aria-hidden="true" />
            {deleted ? 'Eliminada' : active ? 'Activa' : 'Inactiva'}
          </button>
        );
      }
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (carrera) => (
        <div className="piloto-row-actions">
          {carrera.deletedAt || carrera.isActive === false ? (
            <button type="button" className="btn-restore team-action-button" onClick={() => handleRestore(carrera)}
              aria-label={`Reinstaurar carrera ${carrera.nombre}`} title="Reinstaurar">
              <RotateCcw size={16} aria-hidden="true" />
            </button>
          ) : null}
          {!carrera.deletedAt ? (
            <>
              <button type="button" className="btn-edit team-action-button"
                onClick={() => navigate(`/carreras/${carrera._id}/editar`)}
                aria-label={`Editar carrera ${carrera.nombre}`} title="Editar">
                <Pencil size={16} aria-hidden="true" />
              </button>
              <button type="button" className="btn-delete team-action-button" onClick={() => handleDelete(carrera)}
                aria-label={`Eliminar carrera ${carrera.nombre}`} title="Eliminar">
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </>
          ) : null}
        </div>
      )
    }
  ];

  const circuitos = new Set(carreras.map((carrera) => carrera.circuito?._id).filter(Boolean)).size;
  const capacidadTotal = carreras.reduce((total, carrera) => total + (Number(carrera.capacidad) || 0), 0);

  return (
    <section className="page-container piloto-dashboard">
      <header className="page-header">
        <div>
          <p className="piloto-eyebrow">Administración</p>
          <h1>Panel de carreras</h1>
          <p>Gestiona las carreras del calendario y sus circuitos.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => navigate('/carreras/nueva')}>
          + Nueva carrera
        </button>
      </header>

      <div className="piloto-dashboard-stats" aria-label="Resumen de carreras">
        <article className="piloto-stat"><span>Carreras registradas</span><strong>{carreras.length}</strong></article>
        <article className="piloto-stat"><span>Circuitos utilizados</span><strong>{circuitos}</strong></article>
        <article className="piloto-stat"><span>Capacidad total</span><strong>{capacidadTotal.toLocaleString('es-ES')}</strong></article>
      </div>

      <h2>Gestión de carreras</h2>
      <DataTable columns={columns} rows={carreras} rowKey={(carrera) => carrera._id}
        emptyMessage="No hay carreras registradas." />
    </section>
  );
};

export default CarrerasListPage;
