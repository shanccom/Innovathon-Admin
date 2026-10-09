import { renderSidebar } from './Sidebar.js';
import { renderHeader } from './Header.js';

export function renderLayout({ currentPath, pageTitle, breadcrumbs, contentHtml }) {
  return `
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    ${renderSidebar(currentPath)}
    <div class="app-main-wrapper">
      ${renderHeader({ title: pageTitle, breadcrumbs })}
      <main class="app-content">
        ${contentHtml}
      </main>
    </div>
  `;
}
