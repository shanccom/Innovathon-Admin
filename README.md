# Innovathon Manager - Innovathon Mollendo 2026

Panel administrativo frontend para la gestión operativa del evento **Innovathon Mollendo 2026**.

## Arquitectura del Proyecto (Clean Architecture)

El proyecto está organizado siguiendo principios de **Clean Architecture**, dividiendo responsabilidades en capas desacopladas y tipadas con **React + TypeScript (.tsx)**:

```
src/
├── app/                     # Inicialización de la aplicación y enrutador
│   └── App.tsx              # HashRouter y definición de rutas
├── domain/                  # Núcleo de negocio: entidades y contratos
│   ├── models/              # Modelos (Participant, Attendance, Config, Stats)
│   └── repositories/        # Interfaces/contratos de repositorios
├── infrastructure/          # Adaptadores e implementaciones externas
│   ├── config/              # Configuración centralizada de endpoints (endpoints.config.ts)
│   ├── repositories/        # Google Sheets GViz, localStorage, etc.
│   └── state/               # Estado inicial y datos demostrativos
├── application/             # Casos de uso y hooks de React
│   ├── use-cases/           # GetParticipants, ManageAttendance, ManageConfig
│   └── hooks/               # useParticipants, useAttendance, useConfig
├── presentation/            # Capa visual (UI components y páginas)
│   ├── components/          # Layout, Sidebar, Header, Icon, DesktopGate
│   └── pages/               # Dashboard, Asistencias, Certificados, Comunicados
└── assets/                  # Recursos estáticos centralizados
    ├── images/              # Logotipos e imágenes consolidadas
    ├── icons/               # Iconos y favicons en SVG
    └── styles/              # Design System CSS (style.css)
```

---

## Integración con Google Workspace (Apps Script & Sheets)

Todos los endpoints y enlaces de Google Apps Script se configuran de manera centralizada en un único archivo:

📁 **[`src/infrastructure/config/endpoints.config.ts`](file:///Users/sdhm/UNSA/trabajos/Innovathon-Admin/src/infrastructure/config/endpoints.config.ts)**

En este archivo encontrarás:

```typescript
export const APPS_SCRIPT_ENDPOINTS = {
  // 1. Asistencias: Lectura de «Registros» y marcado en matriz «Asistencias»
  attendance: 'https://script.google.com/macros/s/AKfycbxCgXARqnJo7bVajPOLbDTbWhrjSDhlj4PBcV3b1xd8jF1jOBP4aERkpRRhC4IJMvsU4w/exec',

  // 2. Certificados: Generación de PDFs en Google Drive y firmas
  certificates: '',

  // 3. Comunicados: Envíos masivos por correo vía Gmail API / MailApp
  announcements: '',
};

export const GOOGLE_SHEETS_CONFIG = {
  spreadsheetId: '1U48ftJJns3-4waJrt4A4uaI4OBNQoeyg1sOzzvXllI8',
  sheetName: 'Registros',
};
```

---

## Módulos principales

1. **Panel Principal (Dashboard)**: Métricas operativas, sincronización en vivo con Google Sheets («Registros») y accesos directos.
2. **Control de Asistencia** (`#/asistencias`): Panel de solo lectura sobre la matriz «Matriz Asistencia», alimentada por el formulario de Google + Apps Script. Muestra sesiones, totales por participante y filtros de presentes/pendientes.
3. **Gestión de Certificados** (`#/certificados`): Supervisión de estados del ciclo de certificación (pendiente de generación, firma digital, firmado y entregado).
4. **Gestión de Comunicados** (`#/comunicados`): Redacción, filtros de destinatarios y registros de envíos masivos.

---

## Stack Tecnológico

- **React 19 & TypeScript (.tsx)**: Tipado estricto, componentes funcionales y hooks reactivos.
- **Vite 8**: Servidor de desarrollo instantáneo y empaquetador ultrarrápido.
- **React Router (HashRouter `#/`)**: Enrutamiento client-side 100% compatible con **GitHub Pages** sin problemas de recarga 404.
- **Clean Architecture**: Separación estricta entre Dominio, Infraestructura, Aplicación y Presentación.
- **Vitest**: Suite de pruebas unitarias automatizadas.

---

## Comandos Disponibles

1. **Instalar dependencias:**
   ```bash
   npm install
   ```
2. **Ejecutar servidor local:**
   ```bash
   npm run dev
   ```
3. **Ejecutar pruebas unitarias:**
   ```bash
   npm test
   ```
4. **Compilar para producción (TypeScript check + Vite):**
   ```bash
   npm run build
   ```
5. **Previsualizar compilación:**
   ```bash
   npm run preview
   ```

---

## Despliegue en GitHub Pages

El proyecto incluye el flujo automatizado `.github/workflows/deploy.yml` que compila (`npm run build`) y despliega la carpeta `dist/` a GitHub Pages en cada push a la rama `main`.
