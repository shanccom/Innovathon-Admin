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
│   ├── repositories/        # Google Sheets GViz, localStorage, etc.
│   └── state/               # Estado inicial y datos demostrativos
├── application/             # Casos de uso y hooks de React
│   ├── use-cases/           # GetParticipants, ManageAttendance, ManageConfig
│   └── hooks/               # useParticipants, useAttendance, useConfig
├── presentation/            # Capa visual (UI components y páginas)
│   ├── components/          # Layout, Sidebar, Header, Icon, DesktopGate
│   └── pages/               # Dashboard, Asistencias, Certificados, Comunicados, Configuración
└── assets/                  # Recursos estáticos centralizados
    ├── images/              # Logotipos e imágenes consolidadas
    ├── icons/               # Iconos y favicons en SVG
    └── styles/              # Design System CSS (style.css)
```

---

## Módulos principales

1. **Panel Principal (Dashboard)**: Métricas operativas, sincronización en vivo con Google Sheets («Registros») y accesos directos.
2. **Control de Asistencia** (`#/asistencias`): Registro de participantes, filtro en tiempo real, selector de jornada y conmutador de asistencia persistido.
3. **Gestión de Certificados** (`#/certificados`): Supervisión de estados del ciclo de certificación (pendiente de generación, firma digital, firmado y entregado).
4. **Gestión de Comunicados** (`#/comunicados`): Redacción, filtros de destinatarios y registros de envíos masivos.
5. **Configuración** (`#/configuracion`): Conexión con hoja de cálculo de Google Sheets, probador de conexión en vivo y guía para Google Apps Script.

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
