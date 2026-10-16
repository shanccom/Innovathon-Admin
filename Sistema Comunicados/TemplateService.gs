const VARIABLE_REGEX = /\{\{([\wáéíóúüñÁÉÍÓÚÜÑ\s\/-]+)\}\}/g;

function extraerVariables(texto) {
  if (!texto) return [];
  const matches = texto.match(VARIABLE_REGEX);
  if (!matches) return [];
  return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '').trim()))];
}

/**
 * Valida las variables {{...}} del mensaje. Además de las columnas reales
 * de "Registros" acepta los campos extendidos (p. ej. «Grupo»), aunque su
 * columna todavía no exista: en ese caso se renderizarán vacíos.
 */
function validarVariables(variables, headersDisponibles) {
  const disponibles = [...headersDisponibles];
  getCamposExtendidos().forEach(campo => {
    if (!disponibles.includes(campo)) disponibles.push(campo);
  });
  const errores = [];
  variables.forEach(v => {
    if (!disponibles.includes(v)) {
      errores.push(`"{{${v}}}" no corresponde a ningún campo disponible`);
    }
  });
  return errores;
}

/**
 * Avisos no bloqueantes de variables usadas que aún no tienen columna.
 */
function advertenciasVariables(variables) {
  const advertencias = [];
  variables.forEach(v => {
    if (campoEsExtendido(v) && !campoExisteEnHoja(v)) {
      advertencias.push(`"{{${v}}}" se enviará vacío porque la columna "${v}" aún no existe en la hoja.`);
    }
  });
  return advertencias;
}

function renderizarTemplate(template, datos) {
  if (!template) return '';
  return template.replace(VARIABLE_REGEX, (match, variable) => {
    const valor = datos[variable.trim()];
    if (valor !== undefined && valor !== null && String(valor).trim() !== '') {
      return String(valor);
    }
    return '';
  });
}

function agregarImagenAlCuerpo(cuerpo, imagenBase64) {
  if (!imagenBase64) return cuerpo;
  const imagenHtml = '<br><br><div style="text-align:center;margin-top:20px;"><img src="cid:imagen" alt="Imagen" style="max-width:100%;height:auto;border-radius:4px;"></div>';
  return cuerpo + imagenHtml;
}

function generarVistaPrevia(template, destinatarios, max = 5, imagenBase64, imagenTipo, asuntoTemplate, columnaCorreo) {
  columnaCorreo = columnaCorreo || getCampoCorreoDefecto();
  const previas = [];
  const headers = getHeaders(getSheetName('REGISTROS'));
  const variables = extraerVariables(template + ' ' + (asuntoTemplate || ''));
  const erroresVariables = validarVariables(variables, headers);
  if (erroresVariables.length > 0) {
    return { error: erroresVariables.join('; '), previas: [] };
  }
  const muestra = destinatarios.slice(0, max);
  muestra.forEach((dest, i) => {
    let cuerpo = renderizarTemplate(template, dest);
    cuerpo = agregarImagenAlCuerpo(cuerpo, imagenBase64);
    const asuntoRenderizado = asuntoTemplate ? renderizarTemplate(asuntoTemplate, dest) : '';
    previas.push({
      indice: i + 1,
      correo: getCorreoEnvio(dest, columnaCorreo),
      nombreCompleto: getNombreEnvio(dest) || '(sin nombre)',
      asunto: asuntoRenderizado || '(sin asunto)',
      cuerpo: cuerpo
    });
  });
  return {
    error: null,
    previas,
    totalDestinatarios: destinatarios.length,
    advertencias: advertenciasVariables(variables)
  };
}
