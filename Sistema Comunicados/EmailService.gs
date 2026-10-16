function getCuotaRestante() {
  try {
    return MailApp.getRemainingDailyQuota();
  } catch (e) {
    return -1;
  }
}

function validarEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function getCorreoEnvio(registro, columnaCorreo) {
  return String(registro[columnaCorreo] || '').trim();
}

function getNombreEnvio(registro) {
  return String(registro[getCampoNombre()] || '').trim();
}

function fechaActual() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Marca como PENDIENTE a partir de un índice hasta el final de la lista.
 * Se usa cuando se corta el envío por cuota agotada o límite de tiempo.
 */
function marcarPendientes(resultados, destinatarios, desdeIndice, columnaCorreo, motivo) {
  for (let i = desdeIndice; i < destinatarios.length; i++) {
    const dest = destinatarios[i];
    resultados.pendientes++;
    resultados.detalles.push({
      correo: getCorreoEnvio(dest, columnaCorreo),
      nombre: getNombreEnvio(dest),
      estado: 'PENDIENTE',
      motivo: motivo,
      fecha: fechaActual()
    });
  }
}

function enviarCorreo(destinatario, asunto, cuerpo, opciones = {}) {
  if (!validarEmail(destinatario)) {
    return { ok: false, error: 'Correo incorrecto: ' + destinatario, errorOriginal: 'INVALID_EMAIL' };
  }
  try {
    const params = {
      to: destinatario.trim(),
      subject: asunto,
      htmlBody: cuerpo,
      name: opciones.nombreRemitente || 'Sistema de Comunicaciones'
    };
    if (opciones.imagenBase64 && opciones.imagenTipo) {
      const blob = Utilities.newBlob(
        Utilities.base64Decode(opciones.imagenBase64.split(',')[1] || opciones.imagenBase64),
        opciones.imagenTipo,
        'imagen'
      );
      params.inlineImages = { imagen: blob };
    }
    MailApp.sendEmail(params);
    return { ok: true };
  } catch (error) {
    const mensaje = transformarError(error);
    return { ok: false, error: mensaje, errorOriginal: error.toString() };
  }
}

function transformarError(error) {
  const msg = error.toString();
  if (msg.includes('quota') || msg.includes('limit') || msg.includes('Service invoked too many times') || msg.includes('Exceeded maximum')) {
    return 'Se agotó el límite diario de correos. Se reanuda mañana.';
  }
  if (msg.includes('Invalid email') || msg.includes('invalid address') || msg.includes('INVALID_EMAIL')) {
    return 'El correo de esta persona es incorrecto. Revisa sus datos en la hoja.';
  }
  if (msg.includes('unauthorized') || msg.includes('permission') || msg.includes('authorization')) {
    return 'No hay permisos para enviar desde esta cuenta.';
  }
  if (msg.includes('daily') || msg.includes('recipient')) {
    return 'Se agotó el límite diario de correos.';
  }
  return 'No se pudo enviar este correo. Intenta de nuevo más tarde.';
}

/**
 * Envía la campaña en un solo bloque de ejecución.
 * No escribe en hojas: todo queda en memoria dentro de `resultados`.
 * Se detiene (dejando los restantes como PENDIENTE) si se agota la cuota
 * diaria o se acerca al límite de 6 minutos de ejecución.
 */
function enviarLote(destinatarios, template, asuntoTemplate, campanaId, tipoCampana, opciones = {}) {
  const columnaCorreo = opciones.columnaCorreo || getCampoCorreoDefecto();
  const resultados = {
    enviados: 0,
    errores: 0,
    omitidos: 0,
    pendientes: 0,
    detalles: [],
    cuotaAgotada: false,
    tiempoAgotado: false
  };
  const loteTamano = getLoteTamano();

  for (let index = 0; index < destinatarios.length; index++) {
    const cuotaActual = getCuotaRestante();
    if (cuotaActual === 0) {
      resultados.cuotaAgotada = true;
      marcarPendientes(resultados, destinatarios, index, columnaCorreo, 'Cuota diaria agotada');
      break;
    }

    const dest = destinatarios[index];
    const correoDest = getCorreoEnvio(dest, columnaCorreo);
    const nombreDest = getNombreEnvio(dest);
    const asunto = renderizarTemplate(asuntoTemplate, dest);
    let cuerpo = renderizarTemplate(template, dest);
    cuerpo = agregarImagenAlCuerpo(cuerpo, opciones.imagenBase64);
    const variablesUsadas = extraerVariables(template + ' ' + asuntoTemplate).reduce((acc, v) => {
      acc[v] = dest[v];
      return acc;
    }, {});
    const resultado = enviarCorreo(correoDest, asunto, cuerpo, opciones);

    if (resultado.ok) {
      resultados.enviados++;
      resultados.detalles.push({
        correo: correoDest,
        nombre: nombreDest,
        estado: 'ENVIADO',
        fecha: fechaActual()
      });
    } else if (resultado.errorOriginal &&
        (resultado.errorOriginal.includes('quota') || resultado.errorOriginal.includes('limit') || resultado.errorOriginal.includes('daily'))) {
      // La cuota se agotó durante el intento: este y los restantes quedan pendientes.
      resultados.cuotaAgotada = true;
      marcarPendientes(resultados, destinatarios, index, columnaCorreo, 'Cuota diaria agotada');
      break;
    } else {
      resultados.errores++;
      resultados.detalles.push({
        correo: correoDest,
        nombre: nombreDest,
        estado: 'ERROR',
        error: resultado.error,
        fecha: fechaActual()
      });
    }

    if ((index + 1) % loteTamano === 0 && index < destinatarios.length - 1) {
      Utilities.sleep(1000);
    }

    const tiempoRestante = (6 * 60 * 1000) - (Date.now() - new Date().getTime());
    if (tiempoRestante < 30000 && index < destinatarios.length - 1) {
      resultados.tiempoAgotado = true;
      marcarPendientes(resultados, destinatarios, index + 1, columnaCorreo, 'Límite de tiempo de ejecución');
      break;
    }
  }

  return resultados;
}

/**
 * Envío en modo prueba: cada mensaje se envía a `correoPrueba`.
 * No escribe en hojas; los estados quedan en `resultados.detalles`.
 */
function enviarLotePrueba(destinatarios, template, asuntoTemplate, campanaId, tipoCampana, correoPrueba, opciones = {}) {
  const columnaCorreo = opciones.columnaCorreo || getCampoCorreoDefecto();
  const resultados = {
    enviados: 0,
    errores: 0,
    omitidos: 0,
    pendientes: 0,
    detalles: []
  };

  for (let index = 0; index < destinatarios.length; index++) {
    const dest = destinatarios[index];
    const correoDest = getCorreoEnvio(dest, columnaCorreo);
    const nombreDest = getNombreEnvio(dest);

    if (!validarEmail(correoDest)) {
      resultados.errores++;
      resultados.detalles.push({
        correo: correoDest,
        nombre: nombreDest,
        estado: 'ERROR (PRUEBA)',
        error: 'Correo incorrecto',
        fecha: fechaActual()
      });
      continue;
    }

    const asunto = renderizarTemplate(asuntoTemplate, dest);
    let cuerpo = renderizarTemplate(template, dest);
    cuerpo = agregarImagenAlCuerpo(cuerpo, opciones.imagenBase64);
    const variablesUsadas = extraerVariables(template + ' ' + asuntoTemplate).reduce((acc, v) => {
      acc[v] = dest[v];
      return acc;
    }, {});

    const resultado = enviarCorreo(correoPrueba, asunto, cuerpo, opciones);
    if (resultado.ok) {
      resultados.enviados++;
      resultados.detalles.push({
        correo: correoDest,
        nombre: nombreDest,
        estado: 'ENVIADO (PRUEBA)',
        enviadoA: correoPrueba,
        fecha: fechaActual()
      });
    } else {
      resultados.errores++;
      resultados.detalles.push({
        correo: correoDest,
        nombre: nombreDest,
        estado: 'ERROR (PRUEBA)',
        error: resultado.error,
        fecha: fechaActual()
      });
    }
    Utilities.sleep(500);
  }

  return resultados;
}
