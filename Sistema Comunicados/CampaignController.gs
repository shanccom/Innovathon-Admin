function obtenerDestinatariosFiltrados(filtros) {
  validarHeadersRegistros();
  const erroresFiltros = validarFiltros(filtros);
  if (erroresFiltros.length > 0) {
    throw new Error('Hay un problema con los filtros de búsqueda: ' + erroresFiltros.join('; '));
  }
  return filtrarRegistros(filtros);
}

function previsualizarCampana(filtros, asunto, cuerpo, imagenBase64, imagenTipo, columnaCorreo) {
  columnaCorreo = columnaCorreo || getCampoCorreoDefecto();
  const todos = obtenerDestinatariosFiltrados(filtros);
  if (todos.length === 0) {
    return { ok: false, error: 'No se encontraron registros con esas condiciones. Prueba con otro filtro.', previas: [] };
  }
  const headers = getHeaders(getSheetName('REGISTROS'));
  const variables = extraerVariables(asunto + ' ' + cuerpo);
  const erroresVars = validarVariables(variables, headers);
  if (erroresVars.length > 0) {
    return { ok: false, error: 'Hay datos personalizados incorrectos en el mensaje: ' + erroresVars.join('; '), previas: [] };
  }
  const analisis = analizarCorreos(todos, columnaCorreo);
  const destinatarios = analisis.validos;
  if (destinatarios.length === 0) {
    return {
      ok: false,
      error: `Ninguna persona tiene un correo válido en la columna "${columnaCorreo}".`,
      previas: [],
      excluidos: { sinCorreo: analisis.sinCorreo.length, invalidos: analisis.invalidos.length }
    };
  }
  const vistaPrevia = generarVistaPrevia(cuerpo, destinatarios, 5, imagenBase64, imagenTipo, asunto, columnaCorreo);
  if (vistaPrevia.error) {
    return { ok: false, error: vistaPrevia.error, previas: [] };
  }
  return {
    ok: true,
    totalDestinatarios: destinatarios.length,
    totalFiltrados: todos.length,
    excluidos: {
      sinCorreo: analisis.sinCorreo.length,
      invalidos: analisis.invalidos.length
    },
    previas: vistaPrevia.previas,
    variablesDetectadas: variables,
    advertencias: [...advertenciasFiltros(filtros), ...(vistaPrevia.advertencias || [])]
  };
}

function generarCampanaIdDeterminista(tipoCampana, filtros, columnaCorreo) {
  const base = tipoCampana + '|' + JSON.stringify(filtros) + '|' + (columnaCorreo || '');
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, base);
  const hex = hash.map(b => (b + 256).toString(16).slice(-2)).join('').slice(0, 8);
  return 'CMP_' + hex;
}

/**
 * Ejecuta la campaña completa en una sola pasada.
 * No persiste nada en el Sheet: el resumen y los detalles salen en memoria.
 * Si se corta por cuota o tiempo, devuelve ok=true con incompleto=true,
 * los enviados hasta ese momento y el resto como PENDIENTE.
 */
function ejecutarCampana(filtros, asunto, cuerpo, tipoCampana, opciones = {}) {
  const columnaCorreo = opciones.columnaCorreo || getCampoCorreoDefecto();
  const campanaId = opciones.campanaId || generarCampanaIdDeterminista(tipoCampana, filtros, columnaCorreo);
  const todos = obtenerDestinatariosFiltrados(filtros);
  if (todos.length === 0) {
    return { ok: false, error: 'No hay registros seleccionados para enviar', campanaId };
  }
  const analisis = analizarCorreos(todos, columnaCorreo);
  const destinatarios = analisis.validos;
  if (destinatarios.length === 0) {
    return {
      ok: false,
      error: `Ninguna persona tiene un correo válido en la columna "${columnaCorreo}".`,
      campanaId,
      excluidos: { sinCorreo: analisis.sinCorreo.length, invalidos: analisis.invalidos.length }
    };
  }
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (e) {
    return { ok: false, error: 'Otro envío está en curso. Espera unos segundos y vuelve a intentar.', campanaId };
  }
  try {
    const emailOptions = {
      modoPrueba: opciones.modoPrueba,
      imagenBase64: opciones.imagenBase64,
      imagenTipo: opciones.imagenTipo,
      columnaCorreo: columnaCorreo
    };
    const resultado = opciones.modoPrueba
      ? enviarLotePrueba(destinatarios, cuerpo, asunto, campanaId, tipoCampana, Session.getActiveUser().getEmail(), emailOptions)
      : enviarLote(destinatarios, cuerpo, asunto, campanaId, tipoCampana, emailOptions);

    const resumen = construirResumen(resultado);
    return {
      ok: true,
      campanaId,
      ...resultado,
      resumen,
      incompleto: !!(resultado.cuotaAgotada || resultado.tiempoAgotado),
      advertencias: advertenciasFiltros(filtros),
      excluidos: {
        sinCorreo: analisis.sinCorreo.length,
        invalidos: analisis.invalidos.length
      }
    };
  } catch (e) {
    return { ok: false, error: e.toString(), campanaId };
  } finally {
    lock.releaseLock();
  }
}

function testConexion() {
  try {
    const cuota = getCuotaRestante();
    const usuario = Session.getActiveUser().getEmail();
    const esPersonal = usuario && usuario.endsWith('@gmail.com');
    return {
      ok: true,
      cuotaRestante: cuota,
      usuario: usuario,
      tipoCuenta: esPersonal ? 'Cuenta personal Gmail' : 'Cuenta Workspace/Organización',
      esCuentaPersonal: esPersonal,
      limiteDiario: esPersonal ? 100 : 1500
    };
  } catch (e) {
    return { ok: false, error: e.toString() };
  }
}
