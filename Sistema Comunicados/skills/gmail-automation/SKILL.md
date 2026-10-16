# Gmail Automation

## Objetivo

Gestionar el envío de comunicaciones mediante Gmail.

## Requisitos

El sistema debe permitir:

- asunto
- cuerpo del mensaje
- destinatarios
- personalización
- vista previa
- envío
- registro

## Seguridad

No solicitar ni almacenar contraseñas.

Utilizar la cuenta autorizada por Google.

## Envío

Antes del envío mostrar:

- cantidad de destinatarios
- asunto
- ejemplo del mensaje
- advertencia sobre envío masivo

## Errores

Registrar:

- destinatario
- fecha
- mensaje
- estado
- error

Estados sugeridos:

PENDIENTE
ENVIADO
ERROR
OMITIDO

## Duplicados

Evitar enviar nuevamente una misma campaña al mismo destinatario si ya existe un registro exitoso.

## Límites

Consultar documentación oficial actualizada sobre:

- Gmail
- Apps Script
- MailApp
- GmailApp

No inventar límites.

## Múltiples cuentas

El MVP debe funcionar primero con una cuenta.

La posibilidad de múltiples cuentas debe tratarse como una extensión futura.

No implementar mecanismos para evadir límites.