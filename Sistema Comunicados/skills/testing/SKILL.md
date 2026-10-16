# Testing

## Objetivo

Verificar que el sistema funcione antes de realizar envíos masivos.

## Nunca probar inicialmente con cientos de destinatarios.

Primero utilizar datos ficticios.

## Pruebas mínimas

### Datos

- nombre vacío
- correo vacío
- correo inválido
- destinatario duplicado
- fila incompleta

### Filtros

- filtro con resultados
- filtro sin resultados
- múltiples filtros

### Variables

- variable existente
- variable inexistente
- campo vacío

### Envío

- envío correcto
- error
- duplicado
- lote incompleto

### Seguridad

Comprobar que no existan:

- contraseñas
- tokens
- credenciales
- información sensible

hardcodeados.

## Prueba de envío

Debe existir una forma de realizar una prueba con pocos destinatarios antes de un envío masivo.

## Criterio de éxito

El sistema debe poder ejecutar:

Datos
→ filtro
→ preview
→ envío de prueba
→ registro

antes de habilitar campañas grandes.