import React from 'react';
import { Outlet } from 'react-router-dom';
import { DesktopGate } from '../common/DesktopGate';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout: React.FC = () => {
  return (
    <>
      {/* Bloqueo y aviso exclusivo para dispositivos móviles/pantallas pequeñas */}
      <DesktopGate />

      {/* Estructura del panel administrativo */}
      <div className="desktop-app-shell">
        <Sidebar />
        <div className="app-main-wrapper">
          <Header />
          <main className="app-content">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};
