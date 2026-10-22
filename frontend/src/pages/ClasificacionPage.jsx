import React from 'react';
import { useEscuderias, usePilotos } from '../hooks/useF1Data';
import { getNationalityDisplay } from '../utils/nationality';
import { calculateEscuderiaPoints } from '../utils/escuderiaPoints';

export const ClasificacionPage = () => {
  const { items: pilotos, loading: pilotosLoading, error: pilotosError } = usePilotos();
  const { items: escuderias, loading: escuderiasLoading, error: escuderiasError } = useEscuderias();
  const loading = pilotosLoading || escuderiasLoading;
  const error = pilotosError || escuderiasError;
  const pilotosActivos = pilotos.filter((piloto) => !piloto.deletedAt && piloto.isActive !== false);
  const escuderiasActivas = escuderias.filter((escuderia) => !escuderia.deletedAt && escuderia.isActive !== false);
  const puntosPorEscuderia = calculateEscuderiaPoints(pilotos);
  const escuderiasConPuntos = escuderiasActivas.map((escuderia) => ({
    ...escuderia,
    puntos: puntosPorEscuderia.get(String(escuderia._id)) || 0
  }));
  const pilotosOrdenados = [...pilotosActivos].sort((a, b) => (b.puntos || 0) - (a.puntos || 0));
  const escuderiasOrdenadas = escuderiasConPuntos.sort((a, b) => b.puntos - a.puntos);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando clasificación...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>No se pudieron obtener los datos. Asegúrate de que el backend (http://localhost:3000) esté encendido.</div>;

  return (
    <div className="clasificacion-page" style={{ padding: '2rem' }}>
      <h2>Mundial de Pilotos</h2>
      {pilotosActivos.length === 0 ? (
        <p>No hay pilotos registrados en la base de datos.</p>
      ) : (
        <table className="f1-table" style={{ width: '100%', marginBottom: '3rem' }}>
          <thead>
            <tr>
              <th>Pos</th>
              <th>Número</th>
              <th>Piloto</th>
              <th>Nacionalidad</th>
              <th>Escudería</th>
              <th>Puntos</th>
            </tr>
          </thead>
          <tbody>
            {pilotosOrdenados.map((piloto, index) => {
              const nationalityDisplay = getNationalityDisplay(piloto.nacionalidad);
              return (
              <tr key={piloto._id || index}>
                <td>{index + 1}</td>
                <td>#{piloto.numero}</td>
                <td>{piloto.nombre} {piloto.apellidos}</td>
                <td>
                  {nationalityDisplay.length > 0 ? (
                    <span title={piloto.nacionalidad}>
                      {nationalityDisplay.map(({ flag, code }, flagIndex) => (
                        <React.Fragment key={`${flag}-${code}`}>
                          {flagIndex > 0 && ' / '}
                          <span className={`fi fi-${flag}`} aria-hidden="true" /> {code}
                        </React.Fragment>
                      ))}
                    </span>
                  ) : (
                    piloto.nacionalidad || 'Sin asignar'
                  )}
                </td>
                <td>{piloto.escuderia?.nombre || 'Sin Escudería'}</td>
                <td><strong>{piloto.puntos || 0} PTS</strong></td>
              </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <h2>Mundial de Escuderías</h2>
      {escuderiasActivas.length === 0 ? (
        <p>No hay escuderías registradas en la base de datos.</p>
      ) : (
        <table className="f1-table" style={{ width: '100%' }}>
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
      )}
    </div>
  );
};