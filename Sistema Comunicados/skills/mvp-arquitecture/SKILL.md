# MVP Architecture

## Objetivo

Diseñar una arquitectura mínima para automatizar comunicaciones masivas.

## Arquitectura preferida

Google Sheets
↓
Google Apps Script
↓
Gmail

Opcional:

Google Apps Script
↓
HTML Service

para interfaces más amigables.

## Componentes

### Data Layer

Google Sheets contiene los destinatarios.

### Logic Layer

Apps Script procesa:

- filtros
- variables
- validaciones
- envíos
- registros

### Presentation Layer

Puede utilizar:

- menú personalizado
- sidebar
- modal
- HTML Service

## No introducir backend externo

Solo introducirlo si Apps Script no puede cumplir un requisito fundamental.

## Flujo

1. Usuario selecciona campaña.
2. Sistema obtiene destinatarios.
3. Sistema aplica filtros.
4. Sistema valida datos.
5. Sistema calcula cantidad.
6. Usuario escribe mensaje.
7. Sistema reemplaza variables para una vista previa.
8. Usuario confirma.
9. Sistema envía.
10. Sistema registra resultado.

## Arquitectura extensible

Las funcionalidades deben estar separadas en módulos.

Ejemplo:

DataService
FilterService
TemplateService
EmailService
LogService
ValidationService
UIService

Los nombres pueden cambiar, pero las responsabilidades deben permanecer separadas.