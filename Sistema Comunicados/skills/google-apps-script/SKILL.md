# Google Apps Script

## Objetivo

Implementar la lógica del sistema utilizando Google Apps Script.

## Prioridad

Preferir APIs nativas de Google.

Utilizar:

- SpreadsheetApp
- GmailApp
- MailApp
- HtmlService
- PropertiesService
- LockService
- Utilities
- ScriptApp

cuando sean apropiadas.

## Organización

Separar responsabilidades.

Ejemplo:

Code.gs
Config.gs
DataService.gs
FilterService.gs
TemplateService.gs
EmailService.gs
LogService.gs
ValidationService.gs
UI.gs

La estructura final puede ser diferente si existe una razón.

## Buenas prácticas

Evitar:

- funciones gigantes
- código duplicado
- valores mágicos
- credenciales hardcodeadas
- procesamiento innecesario

## Cuotas

Las cuotas y límites de Apps Script deben verificarse antes de diseñar un envío masivo.

No asumir que un script puede enviar 1000 mensajes sin restricciones.

## Envíos

Para grandes volúmenes:

- procesar en lotes
- registrar progreso
- controlar errores
- evitar duplicados
- permitir continuar posteriormente

## Estado

Si se necesita conservar progreso entre ejecuciones, evaluar:

PropertiesService
o
una hoja de estado.

## Concurrencia

Si existe riesgo de que dos usuarios ejecuten el envío simultáneamente, evaluar LockService.

## Autorización

No almacenar contraseñas.

Utilizar OAuth/autorización nativa de Apps Script.