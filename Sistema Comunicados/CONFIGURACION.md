# Configuración Técnica — Sistema de Comunicaciones Masivas

Documento para la **persona encargada técnicamente** del sistema.

Para uso general, ver `MANUAL_DE_USO.md`.

---

## Estructura del proyecto

### Archivos de código (Google Apps Script)

| Archivo | Función |
|---|---|
| `Config.gs` | Constantes: hoja `Registros`, 21 encabezados, campos de correo, campos extendidos |
| `DataService.gs` | Lectura de Google Sheets, setup inicial, análisis de correos |
| `FilterService.gs` | Filtros con 5 operadores (AND combinado) + campos extendidos |
| `TemplateService.gs` | Variables `{{campo}}`, vista previa, imagen en cuerpo |
| `EmailService.gs` | Envío por MailApp, control de cuota, lotes, estados en memoria |
| `LogService.gs` | Resumen y detalle de errores calculados en memoria |
| `CampaignController.gs` | Orquestación: previsualizar, ejecutar, conexión |
| `UIService.gs` | Funciones expuestas a la sidebar, menú de Google Sheets |
| `Main.gs` | Tests automatizados |
| `Sidebar.html` | Interfaz de usuario completa (HTML + CSS + JS) |

### Hojas de Google Sheets

| Hoja | Contenido |
|---|---|
| `Registros` | Datos de destinatarios (21 columnas estándar + adicionales). **No la crea el sistema: debe existir.** |

> El sistema **no crea ni usa ninguna otra hoja**: no hay hojas `HISTORIAL`
> ni `CONFIGURACION`. Los resultados de cada campaña se devuelven en memoria
> (la sidebar los muestra al terminar) y no quedan registrados en el Sheet.

---

## Instalación

### 1. Crear la hoja

1. Abrir (o crear) un Google Sheet que tenga la pestaña **`Registros`** con datos.
2. En **Extensiones** → **Apps Script**.
3. Pegar cada archivo `.gs` y `Sidebar.html` en el editor.
4. Guardar.

### 2. Ejecutar setup inicial

1. En el editor de Apps Script, seleccionar `setupInicial`.
2. Clic en **▶ Ejecutar**.
3. Aceptar permisos cuando lo solicite.
4. Se validará la hoja `Registros` (ya no se crea ninguna hoja auxiliar).

> Si `Registros` no existe o le faltan columnas, aparecerá un aviso explicando el problema.
>
> **Nota:** si en tu Sheet aún existen las hojas `HISTORIAL` y `CONFIGURACION`
> de una versión anterior, puedes borrarlas sin problema: el código ya no las usa.

### 3. Recargar el Google Sheet

1. Cerrar y volver a abrir la hoja.
2. Aparecerá el menú **📧 Comunicaciones**.
3. Verificar con **🧪 Probar conexión Gmail**.

---

## Estructura de datos

### Hoja Registros (obligatoria)

Encabezados estándar (21 columnas, en este orden):

```
Código | Fecha de registro | Nombres y apellidos | DNI | Correo institucional |
Correo personal | Institución de procedencia | Otra institución | Nivel académico |
Sede | Otra sede | Carrera / Especialidad | Otra carrera | Habilidades principales |
Áreas de aporte | Eje temático / Reto | Compañero / Recomendación | LinkedIn / Portafolio |
Disponibilidad presencial | Aceptó términos | Origen
```

Encabezados mínimos requeridos (`CONFIG_SISTEMA.HEADERS_OBLIGATORIOS`):

```
Código | Nombres y apellidos | Correo institucional
```

**Columnas adicionales** son opcionales y se detectan automáticamente por nombre (se respeta tilde, espacio y barra).

### Selección de correo

| Constante | Valor |
|---|---|
| `CONFIG_SISTEMA.CAMPOS_CORREO` | `['Correo institucional', 'Correo personal']` |
| `CONFIG_SISTEMA.CAMPO_CORREO_DEFECTO` | `'Correo institucional'` |
| `CONFIG_SISTEMA.CAMPO_NOMBRE` | `'Nombres y apellidos'` |
| `CONFIG_SISTEMA.CAMPO_ID` | `'Código'` |

La columna elegida se propaga por todo el flujo: conteo, vista previa y envío.

### Campos extendidos (futuro filtro «Grupo»)

| Constante | Valor |
|---|---|
| `CONFIG_SISTEMA.CAMPOS_EXTENDIDOS` | `['Grupo']` |

Son campos de filtro disponibles **aunque su columna aún no exista** en `Registros`:

- Aparecen en el desplegable de filtros de la sidebar siempre.
- `validarFiltros()` los acepta sin error.
- Mientras la columna no exista, el filtro **no selecciona registros** (el valor se
  trata como vacío) y se muestra un aviso no bloqueante tanto en la vista previa
  como en el resultado.
- `{{Grupo}}` en el mensaje también se acepta y se envía vacío hasta que exista la columna.

**Cuando agregues la columna `Grupo` a `Registros`** (tras el sorteo), el filtro
empieza a funcionar **sin tocar código**. Si la columna se llamará distinto,
cambia `'Grupo'` por ese nombre en `CONFIG_SISTEMA.CAMPOS_EXTENDIDOS`.

### Histórico de envíos

No existe: el sistema no guarda en el Sheet quién recibió qué. El resumen
(`enviados`, `errores`, `omitidos`, `pendientes`) y el detalle por destinatario
se devuelven en la respuesta de `ejecutarCampana()` y los muestra la sidebar
al terminar. Para auditar envíos, revisa la bandeja de la cuenta emisora.

---

## Permisos

Al ejecutar `setupInicial` por primera vez, Google pedirá autorizar:

- **Lectura/escritura** de Google Sheets.
- **Envío de correos** vía Gmail (MailApp).
- **Almacenamiento** de propiedades (PropertiesService).
- **Bloqueo de ejecución** (LockService).

> Todos los permisos son estándar de Apps Script. No se envían datos a servicios externos.

---

## Límites de Google (consultar documentación oficial actual)

| Límite | Valor aproximado | Nota |
|---|---|---|
| Correos/día (personal @gmail.com) | 100 | MailApp.getRemainingDailyQuota() |
| Correos/día (Workspace) | 1500 | Variable según organización |
| Tiempo de ejecución | 6 minutos | Si se alcanza, el envío se detiene y el resto queda como PENDIENTE |

> **Nunca asumir límites actuales.** Consultar siempre: https://developers.google.com/apps-script/guides/services/quotas

---

## Configuración

### Parámetros de comportamiento

Están solo en el código (`Config.gs`), ya no existen como hoja:

| Constante | Valor | Descripción |
|---|---|---|
| `LOTE_TAMANO` | `50` | Registros por lote antes de una pausa |
| `CAMPANA_ID_PREFIX` | `CMP_` | Prefijo de IDs de campaña |

### Config.gs (código)

```javascript
const CONFIG_SISTEMA = {
  SHEETS: { REGISTROS: 'Registros' },
  HEADERS_REGISTROS: ['Código', 'Fecha de registro', 'Nombres y apellidos', /* ... 21 columnas ... */],
  HEADERS_OBLIGATORIOS: ['Código', 'Nombres y apellidos', 'Correo institucional'],
  CAMPOS_CORREO: ['Correo institucional', 'Correo personal'],
  CAMPO_CORREO_DEFECTO: 'Correo institucional',
  CAMPO_NOMBRE: 'Nombres y apellidos',
  CAMPO_ID: 'Código',
  CAMPOS_EXTENDIDOS: ['Grupo'],
  ESTADOS_ENVIO: { ENVIADO, ERROR, OMITIDO, PENDIENTE },
  LOTE_TAMANO: 50,
  CAMPANA_ID_PREFIX: 'CMP_'
};
```

> El prefijo `CONFIG_SISTEMA` (y no `CONFIG`) evita colisiones si el mismo proyecto de Apps Script ya tiene otro script con una constante `CONFIG`. Igual motivo tiene el nombre `getHojaPorNombre` (en vez de `getSheet`) en `DataService.gs`.

---

## Convivencia con otro Apps Script en el mismo Sheet

Si el archivo ya contiene otro script (por ejemplo, una web app que recibe postulaciones en `Registros`), este sistema está preparado para coexistir:

| Tema | Comportamiento |
|---|---|
| Nombres de funciones/constantes | Sin colisiones: `CONFIG_SISTEMA`, `getHojaPorNombre`, `setupInicial` frente a `CONFIG`, `getSheet`, `setup` del otro script |
| `doGet`/`doPost` | No definidos por este sistema; la web app sigue funcionando |
| `onOpen` | Solo la define este sistema; el menú 📧 Comunicaciones aparece siempre |
| Columnas extra | Cualquier columna adicional en `Registros` se detecta sola (se lee por nombre de encabezado, nunca por posición) |
| Lock de ejecución | Ambos usan `LockService` del mismo proyecto: mientras dure un envío masivo (hasta 6 min), una postulación podría rechazarse tras esperar 15 s. Evitar enviar en horarios pico de registro |
| Cuota de correos | Los correos de confirmación del otro script y los envíos masivos salen de la misma cuenta y consumen el mismo límite diario (verificar en la documentación oficial de Google) |
| Insertar columnas | **Prohibido insertar columnas en `Registros`**: el otro script lee posiciones fijas (columnas 1–6) y se rompería. Agregar columnas solo al final |

---

## Mantenimiento

### Diario
- Ninguno. El sistema es autocontenido.

### Semanal
- Revisar la bandeja de la cuenta emisora y los resultados mostrados en la sidebar para detectar errores recurrentes.
- Verificar que la cuota diaria no se agote constantemente.

### Cuando cambien los datos
- Nuevas columnas: no requiere cambio (se detectan automáticamente).
- Cambiar nombres de hojas: actualizar `Config.gs` → `CONFIG_SISTEMA.SHEETS`.
- Cambiar headers obligatorios: actualizar `CONFIG_SISTEMA.HEADERS_OBLIGATORIOS`.
- Cambiar columnas de correo: actualizar `CONFIG_SISTEMA.CAMPOS_CORREO`.
- Renombrar el campo del filtro de grupos: actualizar `CONFIG_SISTEMA.CAMPOS_EXTENDIDOS`.

---

## Solución de problemas

### El menú 📧 Comunicaciones no aparece
1. Recargar la hoja (F5).
2. Verificar que `onOpen()` existe en `UIService.gs`.
3. Ejecutar `onOpen()` manualmente desde el editor.

### Error "La hoja Registros no existe"
1. Verificar que la pestaña se llame exactamente `Registros`.
2. Ejecutar `setupInicial()` desde el editor de Apps Script.

### Error "Faltan columnas obligatorias en Registros"
1. Verificar que la fila 1 tenga: `Código`, `Nombres y apellidos`, `Correo institucional`.
2. Revisar que no haya encabezados duplicados.

### Error de permisos
1. Ejecutar cualquier función desde el editor.
2. Aceptar el diálogo de permisos de Google.

### Los correos no llegan
1. Ejecutar **🧪 Probar conexión Gmail** desde el menú.
2. Verificar la cuota con `MailApp.getRemainingDailyQuota()`.
3. Revisar el detalle por destinatario que muestra la sidebar al terminar (estados `ERROR`) y la bandeja de la cuenta emisora.

### El envío se interrumpe a los 6 minutos
- **Es normal.** Google limita la ejecución a 6 minutos.
- Lo enviado hasta ese momento sí llegó; el resto queda como `PENDIENTE`.
- No hay reanudación: vuelve a crear la campaña cuando la cuota lo permita
  (el resto de destinatarios se enviará en el nuevo envío).

### Un filtro no selecciona a nadie
- Si el filtro usa un campo extendido (p. ej. `Grupo`) y la columna todavía no
  existe en `Registros`, no seleccionará registros: aparecerá un aviso en la
  vista previa y en el resultado.
- Verificar también el operador (`igual`, `contiene`, `vacío`...) y el valor.

---

## Tests

Ejecutar desde el editor de Apps Script:

| Función | Qué prueba |
|---|---|
| `runTestCompleto()` | Flujo completo en modo prueba |
| `testCasosExtremos()` | 15 casos: filtros, variables, emails, cuota, headers, columna de correo |
| `testCuota()` | Cuota, vista previa y resumen en memoria |
| `testFiltroGrupo()` | Campo extendido `Grupo`: disponibilidad, validación y avisos |
| `testErrores()` | Correo inválido en datos |
| `testSeleccionCorreo()` | Selección institucional/personal y exclusiones |
| `testModoRealPequeno()` | ⚠️ Envío REAL (pocos destinatarios) |
| `runAllTests()` | Ejecuta todos los tests (excepto modo real) |

> Los tests se ejecutan manualmente desde el editor. No hay framework de testing.
> **Estos tests deben ejecutarse en el editor de Apps Script** para confirmar el funcionamiento real; la verificación sin ejecutar solo comprueba sintaxis y trazado lógico.

---

## Seguridad

- **No hay backend propio.** Todo corre en Google Apps Script.
- **No hay base de datos externa.** Solo Google Sheets.
- **No hay autenticación propia.** Se usa la cuenta de Google del usuario.
- **No se envían datos a terceros.**
- Los correos se envían desde la cuenta del usuario actual.
