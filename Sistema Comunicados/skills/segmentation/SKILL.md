# Segmentation

## Objetivo

Seleccionar automáticamente destinatarios según sus datos.

## Ejemplos

Tipo = Voluntario
Estado = Aceptado

Tipo = Participante
Estado = Aceptado

Grupo = Tecnología

Grupo = Diseño

Tipo = Participante
Estado = Aceptado
Grupo = Tecnología

## Filtros

El sistema debe permitir filtros simples.

Idealmente:

Campo
Operador
Valor

Ejemplo:

Estado | igual | Aceptado

## Operadores iniciales

- igual
- diferente
- contiene
- vacío
- no vacío

No implementar un lenguaje de consultas complejo.

## Resultado

Antes del envío mostrar:

"137 destinatarios encontrados"

## Validación

Si no existen destinatarios:

"No se encontraron personas que cumplan las condiciones."

## Extensibilidad

Los filtros deben funcionar con nuevas columnas sin necesidad de reescribir toda la lógica.