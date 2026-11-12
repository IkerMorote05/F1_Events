import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Flag,
  Layers,
  Route,
  Users,
  Trophy,
  CalendarDays,
  Tags,
  Shield,
  MapPin,
  Package,
  Ticket,
  LogIn,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { normalizeApiError } from '../utils/errorHandler';

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const [logoutError, setLogoutError] = useState('');
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const routeIsActive = (path) => pathname === path || pathname.startsWith(`${path}/`);
  const categoriesActive = routeIsActive('/categorias-circuitos') || routeIsActive('/categorias-globales');
  const eventsActive = ['/carreras', '/circuitos', '/locations'].some(routeIsActive);
  const usersRolesActive = ['/usuarios', '/roles'].some(routeIsActive);
  const ticketsActive = ['/variants', '/ticket-types'].some(routeIsActive);
  const displayName = user?.profile?.nombre || user?.email || 'Usuario';
  const avatarUrl = user?.profile?.avatar?.image_url;
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || 'U';

  const handleLogout = async () => {
    setLogoutError('');
    try {
      await logout();
      navigate('/');
    } catch (error) {
      setLogoutError(normalizeApiError(error).message);
    }
  };

  return (
    <header className="f1-navbar">
      <nav className="f1-navbar-inner" aria-label="Navegación principal">
        <NavLink to="/" end className="f1-brand" aria-label="F1 Classification, inicio">
          <span className="f1-brand-kicker">FIA Formula One</span>
          <span className="f1-brand-title"><Flag size={19} aria-hidden="true" /> F1 Classification</span>
        </NavLink>
        <div className="f1-nav-auth">
          {user ? (
            <div className="f1-nav-account">
              {avatarUrl ? (
                <img className="f1-nav-avatar" src={avatarUrl} alt={`Avatar de ${displayName}`} />
              ) : (
                <span className="f1-nav-avatar f1-nav-avatar-fallback" aria-hidden="true">
                  {avatarInitial}
                </span>
              )}
              <div className="f1-nav-account-details">
                <span className="f1-nav-user">{displayName}</span>
                <button className="f1-nav-link f1-nav-auth-button" type="button" onClick={handleLogout}>
                  <LogOut size={17} aria-hidden="true" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          ) : (
            <NavLink to="/login" className={({ isActive }) => `f1-nav-link${isActive ? ' active' : ''}`}>
              <LogIn size={17} aria-hidden="true" />
              <span>Iniciar sesión</span>
            </NavLink>
          )}
          {logoutError ? <p className="f1-nav-auth-error" role="alert">{logoutError}</p> : null}
        </div>
        <div className="f1-nav-links">
          <NavLink to="/" end className={({ isActive }) => `f1-nav-link${isActive ? ' active' : ''}`}>
            <Trophy size={17} aria-hidden="true" />
            <span>Clasificación</span>
          </NavLink>
          {isAdmin ? (
            <>
              <NavLink to="/pilotos" className={({ isActive }) => `f1-nav-link${isActive ? ' active' : ''}`}>
                <Users size={17} aria-hidden="true" />
                <span>Pilotos</span>
              </NavLink>
              <NavLink to="/escuderias" className={({ isActive }) => `f1-nav-link${isActive ? ' active' : ''}`}>
                <Flag size={17} aria-hidden="true" />
                <span>Escuderías</span>
              </NavLink>
              <details className="f1-nav-group" open={categoriesActive || undefined}>
                <summary className={`f1-nav-link f1-nav-group-trigger${categoriesActive ? ' active' : ''}`}>
                  <Layers size={17} aria-hidden="true" />
                  <span>Categorías</span>
                  <ChevronDown className="f1-nav-chevron" size={15} aria-hidden="true" />
                </summary>
                <div className="f1-nav-sub-links">
                  <NavLink to="/categorias-circuitos" className={({ isActive }) => `f1-nav-link${isActive ? ' active' : ''}`}>
                    <Layers size={16} aria-hidden="true" />
                    <span>De circuitos</span>
                  </NavLink>
                  <NavLink to="/categorias-globales" className={({ isActive }) => `f1-nav-link${isActive ? ' active' : ''}`}>
                    <Tags size={16} aria-hidden="true" />
                    <span>Globales</span>
                  </NavLink>
                </div>
              </details>
              <details className="f1-nav-group" open={eventsActive || undefined}>
                <summary className={`f1-nav-link f1-nav-group-trigger${eventsActive ? ' active' : ''}`}>
                  <Route size={17} aria-hidden="true" />
                  <span>Circuitos y eventos</span>
                  <ChevronDown className="f1-nav-chevron" size={15} aria-hidden="true" />
                </summary>
                <div className="f1-nav-sub-links">
                  <NavLink to="/carreras" className={({ isActive }) => `f1-nav-link${isActive ? ' active' : ''}`}>
                    <CalendarDays size={16} aria-hidden="true" />
                    <span>Carreras</span>
                  </NavLink>
                  <NavLink to="/circuitos" className={({ isActive }) => `f1-nav-link${isActive ? ' active' : ''}`}>
                    <Route size={16} aria-hidden="true" />
                    <span>Circuitos</span>
                  </NavLink>
                  <NavLink to="/locations" className={({ isActive }) => `f1-nav-link${isActive ? ' active' : ''}`}>
                    <MapPin size={16} aria-hidden="true" />
                    <span>Ubicaciones</span>
                  </NavLink>
                </div>
              </details>
              <details className="f1-nav-group" open={usersRolesActive || undefined}>
                <summary className={`f1-nav-link f1-nav-group-trigger${usersRolesActive ? ' active' : ''}`}>
                  <Users size={17} aria-hidden="true" />
                  <span>Usuarios y roles</span>
                  <ChevronDown className="f1-nav-chevron" size={15} aria-hidden="true" />
                </summary>
                <div className="f1-nav-sub-links">
                  <NavLink to="/usuarios" className={({ isActive }) => `f1-nav-link${isActive ? ' active' : ''}`}>
                    <Users size={16} aria-hidden="true" />
                    <span>Usuarios</span>
                  </NavLink>
                  <NavLink to="/roles" className={({ isActive }) => `f1-nav-link${isActive ? ' active' : ''}`}>
                    <Shield size={16} aria-hidden="true" />
                    <span>Roles</span>
                  </NavLink>
                </div>
              </details>
              <details className="f1-nav-group" open={ticketsActive || undefined}>
                <summary className={`f1-nav-link f1-nav-group-trigger${ticketsActive ? ' active' : ''}`}>
                  <Ticket size={17} aria-hidden="true" />
                  <span>Entradas y variantes</span>
                  <ChevronDown className="f1-nav-chevron" size={15} aria-hidden="true" />
                </summary>
                <div className="f1-nav-sub-links">
                  <NavLink to="/variants" className={({ isActive }) => `f1-nav-link${isActive ? ' active' : ''}`}>
                    <Package size={16} aria-hidden="true" />
                    <span>Variantes</span>
                  </NavLink>
                  <NavLink to="/ticket-types" className={({ isActive }) => `f1-nav-link${isActive ? ' active' : ''}`}>
                    <Ticket size={16} aria-hidden="true" />
                    <span>Tipos de entrada</span>
                  </NavLink>
                </div>
              </details>
            </>
          ) : null}
        </div>
      </nav>
    </header>
  );
};