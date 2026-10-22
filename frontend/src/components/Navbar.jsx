import React from 'react';
import { NavLink } from 'react-router-dom';
import { Flag, Route, Users, Trophy, CalendarDays } from 'lucide-react';

export const Navbar = () => {
  return (
    <header className="f1-navbar">
      <nav className="f1-navbar-inner" aria-label="Navegación principal">
        <NavLink to="/" end className="f1-brand" aria-label="F1 Classification, inicio">
          <span className="f1-brand-kicker">FIA Formula One</span>
          <span className="f1-brand-title"><Flag size={19} aria-hidden="true" /> F1 Classification</span>
        </NavLink>
        <div className="f1-nav-links">
          <NavLink to="/" end className={({ isActive }) => `f1-nav-link${isActive ? ' active' : ''}`}>
            <Trophy size={17} aria-hidden="true" />
            <span>Clasificación</span>
          </NavLink>
          <NavLink to="/pilotos" className={({ isActive }) => `f1-nav-link${isActive ? ' active' : ''}`}>
            <Users size={17} aria-hidden="true" />
            <span>Pilotos</span>
          </NavLink>
          <NavLink to="/escuderias" className={({ isActive }) => `f1-nav-link${isActive ? ' active' : ''}`}>
            <Flag size={17} aria-hidden="true" />
            <span>Escuderías</span>
          </NavLink>
          <NavLink to="/circuitos" className={({ isActive }) => `f1-nav-link${isActive ? ' active' : ''}`}>
            <Route size={17} aria-hidden="true" />
            <span>Circuitos</span>
          </NavLink>
          <NavLink to="/carreras" className={({ isActive }) => `f1-nav-link${isActive ? ' active' : ''}`}>
            <CalendarDays size={17} aria-hidden="true" />
            <span>Carreras</span>
          </NavLink>
        </div>
      </nav>
    </header>
  );
};