import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ClasificacionPage } from '../pages/clasificacion/ClasificacionPage';
import { PilotoSkeleton } from '../components/PilotoSkeleton';

const PilotosListPage = lazy(() => import('../pages/pilotos/PilotosListPage'));
const PilotoCreatePage = lazy(() => import('../pages/pilotos/PilotoCreatePage'));
const PilotoEditPage = lazy(() => import('../pages/pilotos/PilotoEditPage'));
const EscuderiasListPage = lazy(() => import('../pages/escuderias/EscuderiasListPage'));
const EscuderiaCreatePage = lazy(() => import('../pages/escuderias/EscuderiaCreatePage'));
const EscuderiaEditPage = lazy(() => import('../pages/escuderias/EscuderiaEditPage'));
const CircuitosListPage = lazy(() => import('../pages/circuitos/CircuitosListPage'));
const CircuitoCreatePage = lazy(() => import('../pages/circuitos/CircuitoCreatePage'));
const CircuitoEditPage = lazy(() => import('../pages/circuitos/CircuitoEditPage'));
const CategoriasCircuitosListPage = lazy(
  () => import('../pages/categorias-circuitos/CategoriasCircuitosListPage')
);
const CategoriaCircuitosCreatePage = lazy(
  () => import('../pages/categorias-circuitos/CategoriaCircuitosCreatePage')
);
const CategoriaCircuitosEditPage = lazy(
  () => import('../pages/categorias-circuitos/CategoriaCircuitosEditPage')
);
const CategoriasGlobalesListPage = lazy(
  () => import('../pages/categorias-globales/CategoriasGlobalesListPage')
);
const CategoriaGlobalCreatePage = lazy(
  () => import('../pages/categorias-globales/CategoriaGlobalCreatePage')
);
const CategoriaGlobalEditPage = lazy(
  () => import('../pages/categorias-globales/CategoriaGlobalEditPage')
);
const CarrerasListPage = lazy(() => import('../pages/carreras/CarrerasListPage'));
const CarreraCreatePage = lazy(() => import('../pages/carreras/CarreraCreatePage'));
const CarreraEditPage = lazy(() => import('../pages/carreras/CarreraEditPage'));
const UsuariosListPage = lazy(() => import('../pages/usuarios/UsuariosListPage'));
const UsuarioCreatePage = lazy(() => import('../pages/usuarios/UsuarioCreatePage'));
const UsuarioEditPage = lazy(() => import('../pages/usuarios/UsuarioEditPage'));
const RolesListPage = lazy(() => import('../pages/roles/RolesListPage'));
const RolCreatePage = lazy(() => import('../pages/roles/RolCreatePage'));
const RolEditPage = lazy(() => import('../pages/roles/RolEditPage'));
const VariantsListPage = lazy(() => import('../pages/variants/VariantsListPage'));
const VariantCreatePage = lazy(() => import('../pages/variants/VariantCreatePage'));
const VariantEditPage = lazy(() => import('../pages/variants/VariantEditPage'));
const TicketTypesListPage = lazy(() => import('../pages/ticket-types/TicketTypesListPage'));
const TicketTypeCreatePage = lazy(() => import('../pages/ticket-types/TicketTypeCreatePage'));
const TicketTypeEditPage = lazy(() => import('../pages/ticket-types/TicketTypeEditPage'));
const LocationsListPage = lazy(() => import('../pages/locations/LocationsListPage'));
const LocationCreatePage = lazy(() => import('../pages/locations/LocationCreatePage'));
const LocationEditPage = lazy(() => import('../pages/locations/LocationEditPage'));

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
        <Route path="/categorias-circuitos" element={<CategoriasCircuitosListPage />} />
        <Route path="/categorias-circuitos/nueva" element={<CategoriaCircuitosCreatePage />} />
        <Route path="/categorias-circuitos/:id/editar" element={<CategoriaCircuitosEditPage />} />
        <Route path="/categorias-globales" element={<CategoriasGlobalesListPage />} />
        <Route path="/categorias-globales/nueva" element={<CategoriaGlobalCreatePage />} />
        <Route path="/categorias-globales/:id/editar" element={<CategoriaGlobalEditPage />} />
        <Route path="/carreras" element={<CarrerasListPage />} />
        <Route path="/carreras/nueva" element={<CarreraCreatePage />} />
        <Route path="/carreras/:id/editar" element={<CarreraEditPage />} />
        <Route path="/usuarios" element={<UsuariosListPage />} />
        <Route path="/usuarios/nuevo" element={<UsuarioCreatePage />} />
        <Route path="/usuarios/:id/editar" element={<UsuarioEditPage />} />
        <Route path="/roles" element={<RolesListPage />} />
        <Route path="/roles/nuevo" element={<RolCreatePage />} />
        <Route path="/roles/:id/editar" element={<RolEditPage />} />
        <Route path="/variants" element={<VariantsListPage />} />
        <Route path="/variants/nueva" element={<VariantCreatePage />} />
        <Route path="/variants/:id/editar" element={<VariantEditPage />} />
        <Route path="/ticket-types" element={<TicketTypesListPage />} />
        <Route path="/ticket-types/nuevo" element={<TicketTypeCreatePage />} />
        <Route path="/ticket-types/:id/editar" element={<TicketTypeEditPage />} />
        <Route path="/locations" element={<LocationsListPage />} />
        <Route path="/locations/nueva" element={<LocationCreatePage />} />
        <Route path="/locations/:id/editar" element={<LocationEditPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};