/**
 * LogService (versión sin hoja HISTORIAL)
 *
 * Este sistema ya NO crea ni escribe en la hoja "HISTORIAL": los envíos no se
 * persisten en el Sheet. Los totales de cada campaña se calculan aquí, en
 * memoria, a partir del objeto `resultados` que devuelven enviarLote() y
 * enviarLotePrueba().
 */

/**
 * Construye el resumen de una campaña a partir de los resultados en memoria.
 * Mantiene la misma forma que devolvía la versión con hoja:
 * { total, enviados, errores, omitidos, pendientes }
 */
function construirResumen(resultados) {
  const r = resultados || {};
  const enviados = r.enviados || 0;
  const errores = r.errores || 0;
  const omitidos = r.omitidos || 0;
  const pendientes = r.pendientes || 0;
  return {
    total: enviados + errores + omitidos + pendientes,
    enviados,
    errores,
    omitidos,
    pendientes
  };
}

/**
 * Detalle de los correos que fallaron, leído de los detalles en memoria.
 * Forma: [{ correo, nombre, error, fecha }]
 */
function construirDetalleErrores(resultados) {
  const detalles = (resultados && resultados.detalles) || [];
  return detalles
    .filter(d => d && typeof d.estado === 'string' && d.estado.indexOf('ERROR') === 0)
    .map(d => ({
      correo: d.correo || '',
      nombre: d.nombre || '',
      error: d.error || '',
      fecha: d.fecha || ''
    }));
}
