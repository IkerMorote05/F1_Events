import { useContext } from 'react';
import { F1DataContext } from '../context/F1DataContext';

const useF1Data = () => {
  const context = useContext(F1DataContext);

  if (!context) {
    throw new Error('Los hooks de datos F1 deben usarse dentro de F1DataProvider.');
  }

  return context;
};

export const usePilotos = () => useF1Data().pilotos;
export const useEscuderias = () => useF1Data().escuderias;
export const useCircuitos = () => useF1Data().circuitos;
export const useCarreras = () => useF1Data().carreras;