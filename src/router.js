import { renderLayout } from './components/Layout.js';
import { renderDashboard } from './pages/Dashboard.js';
import { renderAttendance } from './pages/Attendance.js';
import { renderCertificates } from './pages/Certificates.js';
import { renderAnnouncements } from './pages/Announcements.js';
import { renderSettings } from './pages/Settings.js';

const routes = {
  '#/': {
    title: 'Panel principal - Innovathon Manager',
    pageTitle: 'Panel principal',
    breadcrumbs: [{ label: 'Inicio', path: '#/' }],
    render: renderDashboard,
  },
  '#/asistencias': {
    title: 'Control de Asistencias - Innovathon Manager',
    pageTitle: 'Control de asistencia',
    breadcrumbs: [
      { label: 'Inicio', path: '#/' },
      { label: 'Asistencias', path: '#/asistencias' },
    ],
    render: renderAttendance,
  },
  '#/certificados': {
    title: 'Gestión de Certificados - Innovathon Manager',
    pageTitle: 'Gestión de certificados',
    breadcrumbs: [
      { label: 'Inicio', path: '#/' },
      { label: 'Certificados', path: '#/certificados' },
    ],
    render: renderCertificates,
  },
  '#/comunicados': {
    title: 'Gestión de Comunicados - Innovathon Manager',
    pageTitle: 'Gestión de comunicados',
    breadcrumbs: [
      { label: 'Inicio', path: '#/' },
      { label: 'Comunicados', path: '#/comunicados' },
    ],
    render: renderAnnouncements,
  },
  '#/configuracion': {
    title: 'Configuración - Innovathon Manager',
    pageTitle: 'Configuración',
    breadcrumbs: [
      { label: 'Inicio', path: '#/' },
      { label: 'Configuración', path: '#/configuracion' },
    ],
    render: renderSettings,
  },
};

export function initRouter(appElement) {
  function handleRoute() {
    let hash = window.location.hash || '#/';
    if (!hash.startsWith('#/')) {
      hash = '#/';
    }

    const routeConfig = routes[hash] || routes['#/'];
    document.title = routeConfig.title;

    const contentHtml = routeConfig.render();
    appElement.innerHTML = renderLayout({
      currentPath: hash,
      pageTitle: routeConfig.pageTitle,
      breadcrumbs: routeConfig.breadcrumbs,
      contentHtml,
    });
  }

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
