import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Permite que index.html en la raíz del repositorio se mantenga compilado para GitHub Pages
 * (resolviendo el despliegue directo de la rama main), mientras que en desarrollo local (vite dev)
 * y en el proceso de compilación (vite build) se inyecta dinámicamente src/main.tsx sin requerir cambios manuales.
 */
function htmlEntryPlugin(): Plugin {
  return {
    name: 'html-entry-plugin',
    transformIndexHtml: {
      order: 'pre',
      handler(html: string) {
        if (!html.includes('src/main.tsx')) {
          let updated = html.replace(
            /<script\s+type="module"\s+crossorigin\s+src="[^"]+"><\/script>/i,
            '<script type="module" src="/src/main.tsx"></script>'
          );
          updated = updated.replace(
            /<link\s+rel="stylesheet"\s+crossorigin\s+href="[^"]+">/i,
            ''
          );
          return updated;
        }
        return html;
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), htmlEntryPlugin()],
  // Use relative base so assets load correctly on GitHub Pages (e.g. /Innovathon-Admin/) and GAS
  base: './',
});

