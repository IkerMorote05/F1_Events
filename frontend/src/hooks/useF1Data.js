import { useContext } from 'react';
import { F1DataContext } from '../context/F1DataContext';

export const useF1Data = () => {
  const context = useContext(F1DataContext);

  if (!context) {
    throw new Error('Los hooks de datos F1 deben usarse dentro de F1DataProvider.');
  }

  return context;
};
