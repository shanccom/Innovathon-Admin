# Sistema de Comunicaciones Masivas

## Objetivo

Construir un MVP de bajo costo para facilitar el envío masivo y personalizado de comunicaciones a voluntarios y participantes.

El sistema debe permitir:

Datos → segmentación → mensaje personalizado → vista previa → confirmación → envío → resultado.

## Tecnología objetivo

Priorizar:

- Google Sheets
- Google Apps Script
- Gmail

Presupuesto actual:

- S/ 0

## Prioridad

El MVP debe priorizar:

1. Funcionamiento real.
2. Simplicidad.
3. Costo cero.
4. Facilidad de uso para personas no técnicas.
5. Mantenibilidad.
6. Capacidad de ampliación.

## No sobrediseñar

No crear inicialmente:

- Backend independiente.
- Base de datos externa.
- Microservicios.
- Aplicación móvil.
- Infraestructura cloud compleja.
- Sistema de autenticación propio.

Solo introducir componentes adicionales si existe una justificación técnica clara.

## Alcance inicial

El sistema debe permitir:

- Importar o utilizar datos desde Google Sheets.
- Trabajar con aproximadamente hasta 1000 personas.
- Filtrar destinatarios.
- Redactar mensajes.
- Utilizar variables como {{nombre}}.
- Mostrar vista previa.
- Confirmar cantidad de destinatarios.
- Enviar mediante Gmail.
- Registrar el resultado de cada campaña en memoria (sin hoja de historial).
- Detectar errores.
- Detectar columnas de filtro pendientes (campo extendido `Grupo`).

## Datos

Como mínimo pueden existir:

- nombre
- apellido
- correo
- grupo
- tipo
- estado

Pero el sistema debe permitir columnas adicionales.

No asumir que la estructura de datos será permanentemente fija.

## Casos principales

- Voluntarios aceptados.
- Voluntarios no aceptados.
- Participantes aceptados.
- Participantes no aceptados.
- Recordatorios de reuniones.
- Recordatorios de ponencias.
- Recordatorios de hackatón.

## Usuarios

El sistema será utilizado por:

- Equipo de Tecnología.
- Personas de otros equipos sin conocimientos de programación.

Por ello la interfaz debe ser sencilla.

## WhatsApp

WhatsApp NO es una prioridad del MVP.

Primero debe funcionar correctamente Gmail.

Cualquier solución de WhatsApp debe respetar las políticas oficiales y evitar mecanismos de evasión, scraping o automatizaciones que puedan provocar bloqueos.

## Límites

Nunca asumir límites actuales de Google.

Cuando una decisión dependa de cuotas o límites actuales, consultar documentación oficial.

## Forma de trabajo

Trabajar por fases.

No implementar todo de una vez.

Primero:

1. Arquitectura.
2. Estructura de datos.
3. MVP de Gmail.
4. Segmentación.
5. Personalización.
6. Historial.
7. Pruebas.
8. Mejoras.

## Regla fundamental

Si una solución sencilla resuelve correctamente el problema, elegir la solución sencilla.

## Carga de skills

No leer todas las skills para cada tarea.

Cargar únicamente las skills relacionadas con la tarea actual.

Ejemplos:

Si trabaja con Sheets:
→ google-sheets

Si trabaja con Gmail:
→ gmail-automation

Si trabaja con filtros:
→ segmentation

Si trabaja con variables:
→ message-personalization

Si trabaja con errores:
→ logging-error-handling

Si trabaja con pruebas:
→ testing

Si trabaja con WhatsApp:
→ whatsapp

Siempre cargar:
→ project-rules

Para decisiones arquitectónicas:
→ mvp-architecture