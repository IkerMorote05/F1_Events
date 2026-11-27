import React, { useState } from 'react';
import { NationalityBadge } from '../../components/NationalityBadge';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { useClasificacion } from '../../hooks/useClasificacion';
import { calculateEscuderiaPoints } from '../../utils/escuderiaPoints';
import { getPilotFullName } from '../../utils/formatters';

export const ClasificacionPage = () => {
  const { pilotos, escuderias, loading, error, reload } = useClasificacion();
  const [view, setView] = useState('pilotos');

  const pilotosActivos = pilotos.filter((piloto) => !piloto.deletedAt && piloto.isActive !== false);
  const escuderiasActivas = escuderias.filter(
    (escuderia) => !escuderia.deletedAt && escuderia.isActive !== false
  );
  if (loading) return <PilotoSkeleton resourceName="clasificación" />;
  if (error) {
    return (
      <PilotoError
        resourceName="clasificación"
        message="No se pudieron obtener los datos. Asegúrate de que el backend esté encendido."
        onRetry={reload}
      />
    );
  }

  const puntosPorEscuderia = calculateEscuderiaPoints(pilotos);
  const escuderiasOrdenadas = escuderiasActivas
    .map((escuderia) => ({
      ...escuderia,
      puntos: puntosPorEscuderia.get(String(escuderia._id)) || 0
    }))
    .sort((a, b) => b.puntos - a.puntos);
  const pilotosOrdenados = [...pilotosActivos].sort((a, b) => (Number(b.puntos) || 0) - (Number(a.puntos) || 0));

  return (
    <section className="page-container clasificacion-page">
      <header className="page-header">
        <div>
          <p className="piloto-eyebrow">Campeonato</p>
          <h1>Clasificación general</h1>
          <p>Tabla oficial del mundial de pilotos y constructores.</p>
        </div>
      </header>

      <div className="classification-view-switch" role="tablist" aria-label="Tipo de clasificación">
        <button
          type="button"
          role="tab"
          aria-selected={view === 'pilotos'}
          className={view === 'pilotos' ? 'is-active' : ''}
          onClick={() => setView('pilotos')}
        >
          Mundial de pilotos
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'escuderias'}
          className={view === 'escuderias' ? 'is-active' : ''}
          onClick={() => setView('escuderias')}
        >
          Mundial de escuderías
        </button>
      </div>

      {view === 'pilotos' ? <>
      <div className="classification-section-heading">
        <div>
          <p className="piloto-eyebrow">Clasificación individual</p>
          <h2>Mundial de Pilotos</h2>
        </div>
        <span className="classification-result-count">{pilotosOrdenados.length} pilotos</span>
      </div>
      {pilotosOrdenados.length === 0 ? (
        <p>No hay pilotos registrados en la base de datos.</p>
      ) : (
        <div className="piloto-table-container">
          <table className="f1-table">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Número</th>
                <th>Piloto</th>
                <th>Nacionalidad</th>
                <th>Escudería / Estado</th>
                <th>Puntos</th>
              </tr>
            </thead>
            <tbody>
              {pilotosOrdenados.map((piloto, index) => (
                <tr key={piloto._id || index} className={index < 3 ? `classification-podium-${index + 1}` : ''}>
                  <td>{index + 1}</td>
                  <td>#{piloto.numero}</td>
                  <td>{getPilotFullName(piloto)}</td>
                  <td><NationalityBadge nationality={piloto.nacionalidad} /></td>
                  <td>
                    {piloto.estado === 'compitiendo'
                      ? piloto.escuderia?.nombre || 'Sin Escudería'
                      : piloto.estado || 'compitiendo'}
                  </td>
                  <td><strong>{piloto.puntos || 0} PTS</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      </> : <>
      <div className="classification-section-heading">
        <div>
          <p className="piloto-eyebrow">Clasificación por constructor</p>
          <h2>Mundial de Escuderías</h2>
        </div>
        <span className="classification-result-count">{escuderiasOrdenadas.length} escuderías</span>
      </div>
      {escuderiasOrdenadas.length === 0 ? (
        <p>No hay escuderías registradas en la base de datos.</p>
      ) : (
        <div className="piloto-table-container">
          <table className="f1-table">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Escudería</th>
                <th>País</th>
                <th>Motor</th>
                <th>Jefe de equipo</th>
                <th>Puntos</th>
              </tr>
            </thead>
            <tbody>
              {escuderiasOrdenadas.map((escuderia, index) => (
                <tr key={escuderia._id || index} className={index < 3 ? `classification-podium-${index + 1}` : ''}>
                  <td>{index + 1}</td>
                  <td>{escuderia.nombre}</td>
                  <td>{escuderia.pais}</td>
                  <td>{escuderia.motor || escuderia.motores || 'N/A'}</td>
                  <td>{escuderia.jefe || 'N/A'}</td>
                  <td><strong>{escuderia.puntos} PTS</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </>}
    </section>
  );
};

export default ClasificacionPage;
