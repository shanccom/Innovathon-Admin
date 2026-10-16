# Manual de Uso — Sistema de Comunicaciones Masivas

## ¿Qué es el sistema?

Es una herramienta que te permite **enviar correos personalizados a muchas personas a la vez** desde Google Sheets.

Cada persona recibe un correo con su nombre y otros datos de la hoja, sin que tengas que escribir uno por uno.

---

## ¿Para qué sirve?

| Situación | Ejemplo |
|---|---|
| Aceptación de voluntarios | "Hola Juan, fuiste aceptado como voluntario" |
| Aceptación de participantes | "Hola María, fuiste aceptada en el hackatón" |
| Recordatorios de reuniones | "Hola Carlos, te recordamos la reunión del viernes" |
| Recordatorios de ponencias | "Hola Ana, tu ponencia es el martes a las 10am" |
| Comunicaciones por sede o carrera | "Hola equipo de la sede X, les compartimos..." |

---

## ¿Qué necesito antes de comenzar?

1. Una cuenta de **Google** (Gmail o Google Workspace).
2. Una **hoja de Google Sheets** con la pestaña **`Registros`** cargada.
3. Que alguien del equipo técnico haya configurado el sistema una sola vez (ver `CONFIGURACION.md`).

---

## ¿Cómo deben estar los datos?

Tu hoja de Google Sheets debe tener una pestaña llamada **`Registros`** con estos encabezados en la primera fila:

| Columna | Ejemplo |
|---|---|
| Código | V-001 |
| Fecha de registro | 2026-10-01 |
| Nombres y apellidos | Juan Pérez |
| DNI | 12345678 |
| Correo institucional | juan@unsa.edu.pe |
| Correo personal | juanperez@gmail.com |
| Institución de procedencia | UNSA |
| Otra institución | — |
| Nivel académico | Universitario |
| Sede | Arequipa |
| Otra sede | — |
| Carrera / Especialidad | Ingeniería de Sistemas |
| Otra carrera | — |
| Habilidades principales | JavaScript, Excel |
| Áreas de aporte | Tecnología |
| Eje temático / Reto | Reto 1 |
| Compañero / Recomendación | María García |
| LinkedIn / Portafolio | linkedin.com/in/juan |
| Disponibilidad presencial | Sí |
| Aceptó términos | Sí |
| Origen | Formulario web |

**Puedes agregar más columnas** si lo necesitas. El sistema las detecta automáticamente y podrás usarlas como filtro o dato personalizado.

> **Obligatorias:** `Código`, `Nombres y apellidos` y `Correo institucional`. Las demás son recomendadas.
>
> Si la hoja la llena otro sistema (por ejemplo, un formulario de postulaciones), no te preocupes: el sistema lee las columnas **por nombre**, así que detecta cualquier columna adicional automáticamente.

---

## ¿Cómo crear un mensaje?

1. Abre tu hoja de Google Sheets.
2. En el menú superior, haz clic en **📧 Comunicaciones**.
3. Selecciona **🚀 Crear mensaje**.
4. Se abrirá un panel lateral a la derecha.

---

## ¿Cómo seleccionar personas?

En el paso **"¿A quién quieres enviar?"**:

1. Revisa que aparezca **📋 Hoja de datos: Registros** con el total de registros.
2. Haz clic en **+ Agregar otra condición**.
3. Elige el **campo** (por ejemplo: `Sede`).
4. Elige el **operador** (por ejemplo: `es igual a`).
5. Escribe el **valor** (por ejemplo: `Arequipa`).

### Ejemplo práctico

> Quiero enviar un mensaje solamente a los voluntarios de la sede Arequipa que aceptaron los términos.

Agrega **3 condiciones**:

| Campo | Operador | Valor |
|---|---|---|
| Sede | es igual a | Arequipa |
| Aceptó términos | es igual a | Sí |
| Origen | contiene | Formulario |

Verás un recuadro verde que dice: **"Se encontraron X personas"**.

> Todas las condiciones se cumplen a la vez (son filtros combinados).

---

## ¿Cómo elegir qué correo se usa?

Antes de agregar condiciones, verás el recuadro **"📧 ¿Qué correo utilizar?"** con dos opciones:

- **Correo institucional** — el que está en esa columna de la hoja.
- **Correo personal** — el que está en esa columna de la hoja.

Elige uno. El sistema calculará cuántas personas tienen un correo válido en esa columna.

### Avisos de exclusión

Si algunas personas **no tienen correo** o tienen un **correo inválido** en la columna elegida, verás un aviso naranja:

> ⚠️ Se excluyen 3: 2 sin correo en "Correo institucional", 1 con correo inválido

Esas personas **no recibirán el mensaje**. Puedes corregir sus datos en la hoja o elegir la otra columna de correo.

---

## ¿Cómo personalizar un mensaje?

En el paso **"Escribe tu mensaje"** puedes usar **datos personalizados** entre llaves dobles:

| Escribes | Cada persona recibe |
|---|---|
| `Hola {{Nombres y apellidos}},` | Hola Juan Pérez, |
| `Sede: {{Sede}}` | Sede: Arequipa |
| `Carrera: {{Carrera / Especialidad}}` | Carrera: Ingeniería de Sistemas |

**No necesitas escribir las variables a mano:** en el recuadro **📋 Campos disponibles** verás todos los campos de la hoja. **Haz clic en uno y se insertará** donde tengas el cursor.

**Datos disponibles** (los que tengas en tu hoja):

- `{{Nombres y apellidos}}`
- `{{Correo institucional}}`
- `{{Correo personal}}`
- `{{Sede}}`
- `{{Carrera / Especialidad}}`
- `{{Institución de procedencia}}`
- `{{Nivel académico}}`
- `{{Aceptó términos}}`
- Cualquier columna extra que hayas agregado

> Si un dato está vacío, queda **en blanco** (no se muestra `{{campo}}` ni `null`).

---

## ¿Cómo agregar una imagen?

1. En el paso **"Escribe tu mensaje"**, busca la sección **🖼️ Agregar imagen (opcional)**.
2. Haz clic en **"Haz clic para elegir una imagen"**.
3. Selecciona una imagen **JPG, PNG o GIF** (máximo 2 MB).
4. Verás la miniatura de la imagen.
5. Puedes:
   - **Cambiar imagen** — elegir otra.
   - **Quitar imagen** — eliminarla.

> La imagen aparecerá **al final del mensaje** del correo.

---

## ¿Cómo ver el mensaje?

1. Después de escribir el mensaje, haz clic en **Ver mensaje →**.
2. Verás **tarjetas con registros reales** de tu hoja (nombre, correo, asunto y cuerpo ya personalizados), más la imagen si agregaste una.

> Si algo no se ve bien, haz clic en **← Volver** para corregir.

---

## ¿Cómo enviar una prueba?

**Se recomienda SIEMPRE enviar una prueba primero.**

1. En el paso **"¿Cómo quieres enviar?"**, selecciona **📧 Enviar prueba**.
2. Escribe un **nombre para este envío** (ej: "Bienvenida Voluntarios Octubre").
3. Marca la casilla de confirmación.
4. Haz clic en **📧 Enviar prueba**.
5. Abre tu correo y revisa cómo quedó el mensaje.

> La prueba **solo llega a tu correo**. Nadie más la recibe.

---

## ¿Cómo realizar el envío?

**Solo después de haber revisado la prueba:**

1. Selecciona **🚀 Enviar mensaje**.
2. Escribe el nombre del envío.
3. Marca la casilla de confirmación.
4. Haz clic en **🚀 Enviar mensaje**.
5. Aparecerá una ventana de confirmación:

   > **Vas a enviar este mensaje a 24 personas**
   > Esta acción no se puede deshacer.

6. Haz clic en **Sí, enviar mensaje**.

> Espera a que termine. Verás una pantalla de resultado con el resumen (enviados, errores, omitidos y excluidos por correo).

---

## ¿Cómo revisar los mensajes enviados?

1. El resumen se muestra en la **pantalla de resultado** de la sidebar al terminar
   el envío: enviados, errores, omitidos y pendientes.
2. Debajo encontrarás el **detalle por destinatario** (correo, nombre y estado).
3. Para auditar de forma histórica, revisa la **bandeja de la cuenta emisora**
   (los correos salen desde esa cuenta).

> El sistema **no guarda** este registro en el Sheet: no existe la hoja `HISTORIAL`.
> Si necesitas conservar el resultado, haz captura o copia el detalle antes de cerrar.

---

## ¿Qué hacer si aparece un error?

| Mensaje que ves | Qué significa | Qué hacer |
|---|---|---|
| "Hay una persona con un correo incorrecto" | Algún correo no tiene formato válido | Revisa la columna de correo elegida en tu hoja |
| "Se excluyen X por correo vacío/inválido" | Personas sin correo utilizable | Corrige sus datos o elige la otra columna de correo |
| "Se agotó el límite diario de correos" | Enviaste todos los correos permitidos hoy | Espera 24 horas o envía menos mensajes |
| "Otro envío está en curso" | Ya hay un envío ejecutándose | Espera unos segundos y vuelve a intentar |
| "No se encontraron personas con esas condiciones" | Los filtros no coinciden con ningún dato | Revisa los filtros o los datos en la hoja |
| "Hay datos personalizados incorrectos" | Usaste `{{campo}}` que no existe | Usa los botones de campos disponibles |
| "Faltan columnas obligatorias" | La hoja Registros no tiene las columnas mínimas | Pide ayuda al equipo técnico |
| "No se pudo conectar" | No hay permisos o la hoja no está bien configurada | Pide ayuda al equipo técnico |

---

## Preguntas frecuentes

### ¿Puedo agregar nuevas columnas?
**Sí.** Agrega una columna nueva en la hoja Registros. El sistema la detectará automáticamente y podrás usarla como filtro o dato personalizado.

### ¿Puedo enviar a un grupo específico?
**Sí.** Agrega una condición de filtro, por ejemplo: `Sede es igual a Arequipa`.
Cuando la hoja tenga la columna **`Grupo`** (tras el sorteo), también podrás usar
`Grupo es igual a A` aunque esa columna todavía no exista: verás un aviso
indicando que el filtro se habilitará en cuanto se cree.

### ¿Puedo usar el correo personal en vez del institucional?
**Sí.** En el paso 1 elige **Correo personal** en el recuadro "¿Qué correo utilizar?". El conteo se recalculará.

### ¿Qué pasa si un correo es incorrecto?
El sistema lo excluye del envío y lo muestra en el aviso de exclusiones (antes de enviar) o lo marca como `ERROR` en el resultado. El resto de los mensajes se envían normalmente.

### ¿Qué pasa si algunos mensajes no se envían?
Si se agotó el límite diario, los mensajes restantes quedan como `PENDIENTE` y se te mostrarán al finalizar. Vuelve a crear la campaña al día siguiente para completar el envío.

### ¿Cómo continúo un envío pendiente?
No hay continuidad automática: vuelve a crear el mismo mensaje con los mismos filtros. Los destinatarios ya contactados recibirán el correo otra vez, así que ajusta los filtros si no quieres repetir.

### ¿Cómo sé qué personas recibieron el mensaje?
En la pantalla de resultado, el estado `ENVIADO` de cada destinatario. También puedes comprobarlo en la bandeja de la cuenta emisora.

### ¿Puedo enviar más de una vez a la misma persona?
**Sí.** Cada campaña es independiente: no hay control de duplicados. Si no quieres repetir, ajusta los filtros o cambia la columna de correo.

---

## Resumen del flujo

```
Crear mensaje
     ↓
Elegir correo (institucional / personal) + filtros
     ↓
Escribir mensaje + agregar imagen (opcional)
     ↓
Ver mensaje (vista previa con registros reales)
     ↓
Enviar prueba
     ↓
Comprobar correo
     ↓
Enviar mensaje
     ↓
Revisar mensajes enviados
```
