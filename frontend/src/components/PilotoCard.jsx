import React from 'react';
import { TEAM_COLORS } from './teamColors';
import { getNationalityDisplay } from '../utils/nationality';

export const PilotoCard = ({ piloto, onEdit, onDelete }) => {
  if (!piloto) return null;

  const teamColor = TEAM_COLORS[piloto.escuderia?.siglas]?.primary || '#e10600';
  const nationalityDisplay = getNationalityDisplay(piloto.nacionalidad);

  return (
    <div className="f1-card" >
      <div
        className="f1-card-header f1-pilot-header"
        style={{ background: `linear-gradient(135deg, ${teamColor} 0%, #111827 80%)` }}
      >
        <h3>{piloto.nombre} {piloto.apellidos}</h3>
        <span className="f1-number">#{piloto.numero}</span>
      </div>
      <div className="f1-card-body " >
        <p><strong>Escudería:</strong> {piloto.escuderia?.nombre || 'Sin asignar'}</p>
        <p><strong>Edad: </strong> {piloto.fecha_nacimiento ? Math.floor((new Date() - new Date(piloto.fecha_nacimiento)) / (365.25 * 24 * 60 * 60 * 1000)) : 'Desconocida'}</p>
        <p>
          <strong>Nacionalidad:</strong>{' '}
          {nationalityDisplay.length > 0 ? (
            <span aria-label={`Nacionalidad: ${piloto.nacionalidad}`} title={piloto.nacionalidad}>
              {nationalityDisplay.map(({ flag, code }, index) => (
                <React.Fragment key={`${flag}-${code}`}>
                  {index > 0 && ' / '}
                  <span className={`fi fi-${flag}`} aria-hidden="true" /> {code}
                </React.Fragment>
              ))}
            </span>
          ) : (
            piloto.nacionalidad || 'Sin asignar'
          )}
        </p>
        <p><strong>Puntos:</strong> <span className="f1-pts">{piloto.puntos || 0} PTS</span></p>
      </div>
      <div className="f1-card-actions">
        <button className="btn-edit" onClick={() => onEdit(piloto)}>Editar</button>
        <button className="btn-delete" onClick={() => onDelete(piloto._id)}>Eliminar</button>
      </div>
    </div>
  );
};