# Google Sheets

## Objetivo

Utilizar Google Sheets como fuente de datos y configuración.

## Principios

No asumir columnas completamente fijas.

El sistema debe identificar las columnas mediante sus encabezados.

Ejemplo:

nombre
apellido
correo
grupo
tipo
estado

Pero deben poder agregarse:

telefono
equipo
horario
fecha
ponencia
sala
link

## Hojas recomendadas

### Personas

Contiene los destinatarios.

### Configuración

Contiene parámetros generales del sistema.

### Historial

Contiene los resultados de los envíos.

### Pruebas

Contiene datos utilizados para validar el sistema.

## Encabezados

Los encabezados deben utilizarse para identificar dinámicamente los campos.

Evitar depender de:

"columna C = correo"

cuando sea posible.

Preferir:

"buscar columna cuyo encabezado sea correo".

## Validaciones

Comprobar:

- encabezados requeridos
- correos vacíos
- duplicados
- filas incompletas

## Extensibilidad

Agregar una nueva columna no debería requerir modificar todo el sistema.