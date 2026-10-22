import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ClasificacionPage } from './../pages/ClasificacionPage';
import { PilotoSkeleton } from '../components/PilotoSkeleton';

const PilotosListPage = lazy(() => import('../pages/PilotosListPage'));
const PilotoCreatePage = lazy(() => import('../pages/PilotoCreatePage'));
const PilotoEditPage = lazy(() => import('../pages/PilotoEditPage'));
const EscuderiasListPage = lazy(() => import('../pages/EscuderiasListPage'));
const EscuderiaCreatePage = lazy(() => import('../pages/EscuderiaCreatePage'));
const EscuderiaEditPage = lazy(() => import('../pages/EscuderiaEditPage'));
const CircuitosListPage = lazy(() => import('../pages/CircuitosListPage'));
const CircuitoCreatePage = lazy(() => import('../pages/CircuitoCreatePage'));
const CircuitoEditPage = lazy(() => import('../pages/CircuitoEditPage'));
const CarrerasListPage = lazy(() => import('../pages/CarrerasListPage'));
const CarreraCreatePage = lazy(() => import('../pages/CarreraCreatePage'));
const CarreraEditPage = lazy(() => import('../pages/CarreraEditPage'));

export const AppRouter = () => {
  return (
    <Suspense fallback={<PilotoSkeleton />}>
      <Routes>
        <Route path="/" element={<ClasificacionPage />} />
        <Route path="/pilotos" element={<PilotosListPage />} />
        <Route path="/pilotos/nuevo" element={<PilotoCreatePage />} />
        <Route path="/pilotos/:id/editar" element={<PilotoEditPage />} />
        <Route path="/escuderias" element={<EscuderiasListPage />} />
        <Route path="/escuderias/nueva" element={<EscuderiaCreatePage />} />
        <Route path="/escuderias/:id/editar" element={<EscuderiaEditPage />} />
        <Route path="/circuitos" element={<CircuitosListPage />} />
        <Route path="/circuitos/nuevo" element={<CircuitoCreatePage />} />
        <Route path="/circuitos/:id/editar" element={<CircuitoEditPage />} />
        <Route path="/carreras" element={<CarrerasListPage />} />
        <Route path="/carreras/nueva" element={<CarreraCreatePage />} />
        <Route path="/carreras/:id/editar" element={<CarreraEditPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};