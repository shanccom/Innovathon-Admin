# Guía de Instalación — Sistema de Comunicaciones Masivas

Guía paso a paso para instalar el sistema en Google Sheets. **No requiere costo ni programación.**

Tiempo estimado: 15–20 minutos.

---

## Requisitos previos

- Una cuenta de **Google** (Gmail o Google Workspace).
- Un archivo de **Google Sheets** con la pestaña **`Registros`** y sus datos.
- Acceso al editor de Google Apps Script.

---

## Paso 1 — Verificar la hoja Registros

1. Abre tu Google Sheet.
2. Comprueba que exista una pestaña llamada exactamente **`Registros`**.
3. Verifica que la **fila 1** contenga estos encabezados (mínimo obligatorios):

   | Código | Nombres y apellidos | Correo institucional |

4. Recomendado: las 21 columnas estándar completas:

   ```
   Código | Fecha de registro | Nombres y apellidos | DNI | Correo institucional |
   Correo personal | Institución de procedencia | Otra institución | Nivel académico |
   Sede | Otra sede | Carrera / Especialidad | Otra carrera | Habilidades principales |
   Áreas de aporte | Eje temático / Reto | Compañero / Recomendación | LinkedIn / Portafolio |
   Disponibilidad presencial | Aceptó términos | Origen
   ```

> Si tu hoja tiene columnas adicionales, no hay problema: el sistema las detecta.

> **¿El Sheet ya tiene otro Apps Script (web app de postulaciones)?** Pueden convivir en el mismo proyecto: este sistema no define `doGet`/`doPost` y usa nombres propios (`CONFIG_SISTEMA`, `getHojaPorNombre`) que no chocan con los del otro script. Considera que, mientras dura un envío masivo (hasta 6 min), el lock de ejecución puede hacer que una postulación tome hasta 15 s extra o se rechace — evita enviar en horarios pico de registro. Nunca insertes columnas dentro de `Registros` (el otro script lee posiciones fijas): agrega columnas solo al final. Detalle en `CONFIGURACION.md`.

---

## Paso 2 — Abrir el editor de Apps Script

1. En Google Sheets, ve a **Extensiones** → **Apps Script**.
2. Se abre el editor en una pestaña nueva.

---

## Paso 3 — Copiar el código

Crea cada archivo en el editor y pega su contenido:

| Archivo a crear | Contenido |
|---|---|
| `Config.gs` | Pegar el contenido de `Config.gs` |
| `DataService.gs` | Pegar el contenido de `DataService.gs` |
| `FilterService.gs` | Pegar el contenido de `FilterService.gs` |
| `TemplateService.gs` | Pegar el contenido de `TemplateService.gs` |
| `EmailService.gs` | Pegar el contenido de `EmailService.gs` |
| `LogService.gs` | Pegar el contenido de `LogService.gs` |
| `CampaignController.gs` | Pegar el contenido de `CampaignController.gs` |
| `UIService.gs` | Pegar el contenido de `UIService.gs` |
| `Main.gs` | Pegar el contenido de `Main.gs` |

Para crear un archivo nuevo: **+** → **Script** → renómbralo (sin `.gs`, el editor lo agrega).

Luego crea la interfaz:

1. **+** → **HTML**.
2. Nómbralo exactamente **`Sidebar`**.
3. Pega el contenido de `Sidebar.html`.
4. **Guardar** (Ctrl+S).

---

## Paso 4 — Ejecutar la configuración inicial

1. En la barra de herramientas del editor, en el selector de funciones, elige **`setupInicial`**.
2. Haz clic en **▶ Ejecutar**.
3. Aparecerá el diálogo de permisos: **Revisar permisos** → elige tu cuenta → **Permitir**.
4. Espera a que aparezca el aviso:

   > ✅ Configuración completada.
   > Hoja "Registros" encontrada con N registros.

Si aparece un aviso de problema con `Registros`, sigue su indicación y vuelve a ejecutar.

---

## Paso 5 — Recargar la hoja

1. Vuelve a la pestaña del Google Sheet.
2. Recarga la página (F5).
3. Aparecerá el menú **📧 Comunicaciones** en la barra superior.

---

## Paso 6 — Probar la conexión

1. Menú **📧 Comunicaciones** → **🧪 Probar conexión Gmail**.
2. Debes ver:

   > ✅ Conexión OK
   > Cuenta: tu-correo@...
   > Cuota disponible: N de 100 (o 1500) correos/día

---

## Paso 7 — Primer envío de prueba

1. Menú **📧 Comunicaciones** → **🚀 Crear mensaje**.
2. Verifica que el panel diga **📋 Hoja de datos: Registros** con el total de registros.
3. Elige el **correo** (institucional o personal) y agrega una condición.
4. Comprueba el recuadro **"Se encontraron X personas"**.
5. Escribe asunto y mensaje (usa los botones de campos para insertar variables).
6. **Ver mensaje →** y revisa la vista previa.
7. **📧 Enviar prueba** → escribe un nombre → marca la casilla → enviar.
8. Revisa tu correo.

> Haz un envío real solo cuando la prueba se vea correcta.

---

## Problemas comunes durante la instalación

| Problema | Solución |
|---|---|
| No aparece el menú 📧 Comunicaciones | Recarga la hoja (F5); ejecuta `onOpen()` desde el editor |
| "La hoja Registros no existe" | Renombra tu pestaña a exactamente `Registros` |
| "Faltan columnas obligatorias" | Revisa la fila 1: `Código`, `Nombres y apellidos`, `Correo institucional` |
| Error de permisos | Ejecuta cualquier función desde el editor y acepta los permisos |
| No se envían correos | Ejecuta **🧪 Probar conexión Gmail** y revisa la cuota |

---

## Siguiente paso

Consulta `GUIA_RAPIDA.md` para el flujo de envío de un página, o `MANUAL_DE_USO.md` para la guía completa.
