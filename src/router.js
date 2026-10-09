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

    // Attach event listeners for mobile drawer & interactions
    setupInteractions();
  }

  function setupInteractions() {
    const menuBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.getElementById('appSidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (menuBtn && sidebar && overlay) {
      menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
      });

      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
      });

      // Close sidebar when clicking a nav item on mobile
      const navLinks = sidebar.querySelectorAll('.nav-item');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          sidebar.classList.remove('open');
          overlay.classList.remove('open');
        });
      });
    }

    // Notifications demo button
    const notificationsBtn = document.getElementById('notificationsBtn');
    if (notificationsBtn) {
      notificationsBtn.addEventListener('click', () => {
        alert('Notificaciones: En esta fase inicial no hay alertas activas.');
      });
    }
  }

  window.addEventListener('hashchange', handleRoute);
  // Initial load
  handleRoute();
}
