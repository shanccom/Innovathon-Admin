# Innovathon Manager - Innovathon Mollendo 2026

Panel administrativo frontend para la gestión operativa del evento **Innovathon Mollendo 2026**.

## 🚀 Módulos principales

1. **Panel Principal (Dashboard)**: Métricas globales y accesos directos a los módulos.
2. **Control de Asistencia** (`#/asistencias`): Registro de participantes y control por sesiones (preparado para conectar con la hoja `Asistencias` y `Registros`).
3. **Gestión de Certificados** (`#/certificados`): Supervisión de estados del ciclo de certificación (pendiente de generación, pendiente de firma, firmado y entregado; preparado para Google Drive y Google Docs).
4. **Gestión de Comunicados** (`#/comunicados`): Redacción, filtros de destinatarios y registros de envíos masivos (preparado para Gmail API).
5. **Configuración** (`#/configuracion`): Gestión de parámetros y variables del evento.

---

## 🛠️ Stack Tecnológico

- **Vite & Vanilla JavaScript / ES Modules**: Ligero, ultrarrápido y sin sobrecarga innecesaria.
- **CSS Tokens & Design System**: Estructura visual sobria con colores institucionales (verde oscuro `#0f3d2e`, acentos esmeralda, fondo cálido, y badges de estado).
- **Client-Side Hash Routing (`#/`)**: Compatible de forma nativa tanto con **GitHub Pages** como con despliegues en **Google Apps Script HTML Service**.

---

## 💻 Ejecución en Desarrollo Local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar el servidor local de desarrollo:
   ```bash
   npm run dev
   ```
3. Abrir la URL mostrada en terminal (usualmente `http://localhost:5173/`).

---

## 📦 Compilación para Producción

Para compilar los recursos estáticos optimizados:

```bash
npm run build
```

Los archivos generados se ubicarán en la carpeta `dist/`. Puedes previsualizarlos localmente con:

```bash
npm run preview
```

---

## 🌐 Despliegue en GitHub Pages

Este repositorio incluye un flujo automatizado de CI/CD con **GitHub Actions** en `.github/workflows/deploy.yml`. 

Cada vez que se realiza un push a la rama `main`, la acción compila el frontend y lo despliega automáticamente a GitHub Pages.

Para habilitarlo en el repositorio de GitHub:
1. Dirígete a **Settings > Pages** en tu repositorio de GitHub.
2. En **Build and deployment > Source**, selecciona **GitHub Actions**.

---

## 📋 Estado del Proyecto

- **Fase 1 (Actual)**: Estructura visual, layout administrativo, navegación reactiva, diseño responsive, tarjetas de módulos y estados vacíos informativos.
- **Fase 2 (Próxima)**: Conexión con Google Apps Script backend (`google.script.run`), lectura de hoja de cálculo `Registros` y escritura en `Asistencias`, generación de PDF en Google Drive y envíos automáticos vía Gmail.
