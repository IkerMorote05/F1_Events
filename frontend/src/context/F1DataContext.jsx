import { createContext, useCallback } from 'react';
import {
  createEscuderia,
  deleteEscuderia,
  getEscuderiasAdmin,
  updateEscuderia
} from '../services/escuderiaService';
import {
  createCircuito,
  deleteCircuito,
  getCircuitosAdmin,
  updateCircuito
} from '../services/circuitoService';
import {
  createCarrera,
  deleteCarrera,
  getCarrerasAdmin,
  updateCarrera
} from '../services/carreraService';
import {
  createPiloto,
  deletePiloto,
  getPilotosAdmin,
  updatePiloto
} from '../services/pilotoService';
import { useCollection } from '../hooks/useCollection';

export const F1DataContext = createContext(null);

export const F1DataProvider = ({ children }) => {
  const pilotos = useCollection({
    fetchAll: getPilotosAdmin,
    create: createPiloto,
    update: updatePiloto,
    remove: deletePiloto,
    resourceName: 'pilotos',
    listKey: 'pilotos',
    errorMessage: 'No se pudieron cargar los datos.'
  });
  const escuderias = useCollection({
    fetchAll: getEscuderiasAdmin,
    create: createEscuderia,
    update: updateEscuderia,
    remove: deleteEscuderia,
    resourceName: 'escuderías',
    listKey: 'escuderias',
    errorMessage: 'No se pudieron cargar las escuderías.'
  });
  const circuitos = useCollection({
    fetchAll: getCircuitosAdmin,
    create: createCircuito,
    update: updateCircuito,
    remove: deleteCircuito,
    resourceName: 'circuitos',
    listKey: 'circuitos',
    errorMessage: 'No se pudieron cargar los circuitos.'
  });
  const carreras = useCollection({
    fetchAll: getCarrerasAdmin,
    create: createCarrera,
    update: updateCarrera,
    remove: deleteCarrera,
    resourceName: 'carreras',
    listKey: 'carreras',
    errorMessage: 'No se pudieron cargar las carreras.'
  });
  const loadPilotos = useCallback(() => pilotos.reload(), [pilotos.reload]);
  const loadEscuderias = useCallback(() => escuderias.reload(), [escuderias.reload]);
  const loadCircuitos = useCallback(() => circuitos.reload(), [circuitos.reload]);
  const loadCarreras = useCallback(() => carreras.reload(), [carreras.reload]);
  const pilotosContext = { ...pilotos, load: loadPilotos };
  const escuderiasContext = { ...escuderias, load: loadEscuderias };
  const circuitosContext = { ...circuitos, load: loadCircuitos };
  const carrerasContext = { ...carreras, load: loadCarreras };

  return (
    <F1DataContext.Provider value={{
      pilotos: pilotosContext,
      escuderias: escuderiasContext,
      circuitos: circuitosContext,
      carreras: carrerasContext
    }}>
      {children}
    </F1DataContext.Provider>
  );
};