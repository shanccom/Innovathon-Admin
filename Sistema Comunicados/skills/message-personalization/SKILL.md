# Message Personalization

## Objetivo

Permitir escribir mensajes utilizando variables dinámicas.

## Variables del proyecto

La hoja de datos es `Registros`. Las variables corresponden a sus encabezados reales, por ejemplo:

{{Nombres y apellidos}}

{{Correo institucional}}

{{Sede}}

{{Carrera / Especialidad}}

{{Aceptó términos}}

## Ejemplo

Hola {{Nombres y apellidos}},

Nos complace informarte que has sido aceptado como voluntario.

## Resolución dinámica

Si existe una columna:

horario

debe ser posible utilizar:

{{horario}}

sin modificar la lógica principal.

La sintaxis debe soportar espacios, barras y tildes: `{{Carrera / Especialidad}}`.

Si un campo está vacío, renderizar vacío (sin `{{campo}}`, `null` ni `undefined`).

## Variables inexistentes

Si el mensaje contiene:

{{campoInexistente}}

el sistema debe detectarlo antes del envío.

No enviar silenciosamente un mensaje incorrecto.

## Vista previa

Antes del envío mostrar ejemplos reales.

Ejemplo:

Hola Juan Pérez,

Nos complace informarte...

## HTML

Si se implementa HTML en los correos, mantener inicialmente una solución sencilla.

No construir un editor visual complejo para el MVP.
