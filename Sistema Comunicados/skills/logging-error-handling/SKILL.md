# Logging and Error Handling

## Objetivo

Permitir saber qué ocurrió con cada envío.

## Historial mínimo

Registrar:

- fecha
- destinatario
- tipo de campaña
- asunto
- canal
- estado
- error

## Estados

PENDIENTE
ENVIADO
ERROR
OMITIDO

## Errores

Los errores técnicos deben transformarse en mensajes comprensibles.

Ejemplo:

Técnico:
"Service invoked too many times"

Usuario:
"Se alcanzó temporalmente el límite de envíos. El proceso puede continuar posteriormente."

## Reintentos

Los envíos fallidos deben poder identificarse.

No reintentar automáticamente de forma indefinida.

## Duplicados

Antes de enviar:

comprobar si el destinatario ya recibió correctamente la misma campaña.

## Auditoría

Mantener historial suficiente para responder:

- qué se envió
- a quién
- cuándo
- desde qué canal
- resultado