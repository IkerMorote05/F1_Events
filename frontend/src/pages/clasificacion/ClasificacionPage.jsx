import React from 'react';
import { NationalityBadge } from '../../components/NationalityBadge';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { useClasificacion } from '../../hooks/useClasificacion';
import { calculateEscuderiaPoints } from '../../utils/escuderiaPoints';
import { getPilotFullName } from '../../utils/formatters';

export const ClasificacionPage = () => {
  const { pilotos, escuderias, loading, error, reload } = useClasificacion();

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

  const pilotosActivos = pilotos.filter((piloto) => !piloto.deletedAt && piloto.isActive !== false);
  const escuderiasActivas = escuderias.filter(
    (escuderia) => !escuderia.deletedAt && escuderia.isActive !== false
  );
  const puntosPorEscuderia = calculateEscuderiaPoints(pilotos);
  const escuderiasOrdenadas = escuderiasActivas
    .map((escuderia) => ({
      ...escuderia,
      puntos: puntosPorEscuderia.get(String(escuderia._id)) || 0
    }))
    .sort((a, b) => b.puntos - a.puntos);
  const pilotosOrdenados = [...pilotosActivos].sort((a, b) => (b.puntos || 0) - (a.puntos || 0));

  return (
    <section className="page-container clasificacion-page">
      <header className="page-header">
        <div>
          <p className="piloto-eyebrow">Campeonato</p>
          <h1>Clasificación general</h1>
          <p>Tabla oficial del mundial de pilotos y constructores.</p>
        </div>
      </header>

      <h2>Mundial de Pilotos</h2>
      {pilotosActivos.length === 0 ? (
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
                <tr key={piloto._id || index}>
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

      <h2>Mundial de Escuderías</h2>
      {escuderiasActivas.length === 0 ? (
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
                <tr key={escuderia._id || index}>
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
    </section>
  );
};

export default ClasificacionPage;
