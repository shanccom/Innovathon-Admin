# Project Rules

## Propósito

Mantener todas las decisiones del proyecto alineadas con el objetivo del MVP.

## Reglas

### Regla 1 — Simplicidad

Antes de introducir una tecnología nueva, comprobar si Google Sheets o Apps Script ya pueden resolver el problema.

### Regla 2 — Costo

La solución actual debe intentar mantenerse en S/ 0.

### Regla 3 — MVP

Diferenciar siempre:

- Necesario para MVP.
- Mejora posterior.
- Funcionalidad experimental.

No implementar mejoras futuras durante el desarrollo del núcleo.

### Regla 4 — Usuarios no técnicos

Toda funcionalidad utilizada por usuarios finales debe poder utilizarse sin editar código.

### Regla 5 — Extensibilidad

Evitar estructuras rígidas que dificulten agregar nuevas columnas, grupos o tipos de mensajes.

### Regla 6 — Seguridad

No almacenar credenciales directamente en el código.

No pedir contraseñas de Gmail.

Utilizar los mecanismos de autorización proporcionados por Google.

### Regla 7 — Cambios

Antes de modificar una parte importante de la arquitectura, explicar:

- Problema.
- Alternativas.
- Decisión.
- Motivo.

### Regla 8 — No repetir trabajo

Antes de implementar algo, revisar la estructura y código existente.

No crear una segunda solución para resolver exactamente el mismo problema.

## Resultado esperado

Código pequeño, modular, comprensible y fácil de mantener.