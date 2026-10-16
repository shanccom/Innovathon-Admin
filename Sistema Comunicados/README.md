# Sistema de Comunicaciones Masivas

Herramienta para **enviar correos personalizados en masa** desde Google Sheets, sin costo y sin programación.

---

## ¿Qué hace?

Permite enviar correos personalizados a muchas personas a la vez:

1. Seleccionar destinatarios con filtros combinados sobre la hoja **Registros**.
2. Elegir qué correo usar: **institucional** o **personal**.
3. Escribir un mensaje con datos personalizados (`{{Nombres y apellidos}}`, `{{Sede}}`, etc.).
4. Agregar una imagen opcional.
5. Ver una vista previa con registros reales.
6. Enviar una prueba a tu propio correo.
7. Enviar el mensaje a todas las personas.
8. Revisar el resultado del envío (enviados, errores y pendientes).

---

## Tecnologías

| Tecnología | Uso |
|---|---|
| Google Sheets | Almacenamiento de datos de destinatarios |
| Google Apps Script | Lógica del sistema (backend + interfaz) |
| Gmail (MailApp) | Envío de correos |

**Costo: S/ 0** — Todo funciona dentro de Google.

---

## Estructura

```
Sistema Comunicados/
├── Sidebar.html          ← Interfaz de usuario
├── Config.gs             ← Constantes y configuración
├── DataService.gs         ← Lectura/escritura de Sheets
├── FilterService.gs       ← Filtros de búsqueda
├── TemplateService.gs     ← Variables y vista previa
├── EmailService.gs        ← Envío de correos
├── LogService.gs          ← Historial de envíos
├── CampaignController.gs  ← Orquestación de envíos
├── UIService.gs           ← Funciones de la interfaz
├── Main.gs                ← Tests automatizados
├── INSTALACION.md         ← Guía de instalación paso a paso
├── MANUAL_DE_USO.md       ← Manual para usuarios
├── GUIA_RAPIDA.md         ← Guía de una página
├── CONFIGURACION.md       ← Documentación técnica
└── README.md              ← Este archivo
```

---

## Instalación

1. Crear (o abrir) un Google Sheet con la pestaña **`Registros`** ya cargada.
2. **Extensiones** → **Apps Script**.
3. Copiar cada archivo `.gs` y `Sidebar.html` al editor.
4. Ejecutar `setupInicial()` (acepta permisos).
5. Recargar la hoja. Aparecerá el menú **📧 Comunicaciones**.

Guía completa paso a paso: ver `INSTALACION.md`.

---

## Documentación

| Documento | Para quién |
|---|---|
| `INSTALACION.md` | Quien instala (paso a paso) |
| `GUIA_RAPIDA.md` | Cualquier persona (una página) |
| `MANUAL_DE_USO.md` | Usuario no técnico (guía completa) |
| `CONFIGURACION.md` | Persona técnica (instalación y mantenimiento) |

---

## Requisitos

- Cuenta de Google (Gmail o Workspace).
- Hoja de Google Sheets con pestaña **`Registros`**.
- Encabezados obligatorios: `Código`, `Nombres y apellidos`, `Correo institucional`.
- El sistema trabaja con las 21 columnas estándar y acepta columnas adicionales.

Detalle completo: ver `CONFIGURACION.md`.

---

## Limitaciones conocidas

- Límite diario de correos: ~100 (personal) o ~1500 (Workspace). Verificar siempre en la documentación oficial de Google.
- Ejecución máxima: 6 minutos por envío (permite continuar).
- No envía SMS ni WhatsApp (solo correo).
- No tiene autenticación propia (usa la cuenta Google del usuario).
