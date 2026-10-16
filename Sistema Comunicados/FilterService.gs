const OPERADORES = {
  IGUAL: 'igual',
  DIFERENTE: 'diferente',
  CONTIENE: 'contiene',
  VACIO: 'vacio',
  NO_VACIO: 'no vacio'
};

function aplicarFiltros(personas, filtros) {
  if (!filtros || filtros.length === 0) {
    return personas;
  }
  return personas.filter(persona => {
    return filtros.every(filtro => evaluarFiltro(persona, filtro));
  });
}

function normalizarValor(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor).trim();
}

function evaluarFiltro(persona, filtro) {
  const { campo, operador, valor } = filtro;
  const valorPersona = normalizarValor(persona[campo]);
  const valorFiltro = normalizarValor(valor);
  switch (operador) {
    case OPERADORES.IGUAL:
      return valorPersona.toLowerCase() === valorFiltro.toLowerCase();
    case OPERADORES.DIFERENTE:
      return valorPersona.toLowerCase() !== valorFiltro.toLowerCase();
    case OPERADORES.CONTIENE:
      return valorPersona.toLowerCase().includes(valorFiltro.toLowerCase());
    case OPERADORES.VACIO:
      return valorPersona === '';
    case OPERADORES.NO_VACIO:
      return valorPersona !== '';
    default:
      return true;
  }
}

function getOperadoresDisponibles() {
  return Object.values(OPERADORES);
}

/**
 * Campos disponibles para armar filtros: columnas reales de "Registros"
 * más los campos extendidos (p. ej. «Grupo»), que se habilitan aunque la
 * columna todavía no exista en la hoja.
 */
function getCamposDisponibles() {
  const headers = getHeaders(getSheetName('REGISTROS'));
  const extendidos = getCamposExtendidos();
  extendidos.forEach(campo => {
    if (!headers.includes(campo)) headers.push(campo);
  });
  return headers;
}

/**
 * true si el campo es uno de los extendidos (no depende de la columna actual).
 */
function campoEsExtendido(campo) {
  return getCamposExtendidos().includes(campo);
}

/**
 * true si la columna existe físicamente en "Registros".
 */
function campoExisteEnHoja(campo) {
  return getHeaders(getSheetName('REGISTROS')).includes(campo);
}

/**
 * Avisos no bloqueantes: filtros que usan un campo extendido cuya columna
 * aún no se creó en la hoja. Mientras no exista, ese filtro no selecciona
 * registros (el valor se trata como vacío).
 */
function advertenciasFiltros(filtros) {
  if (!filtros || filtros.length === 0) return [];
  const advertencias = [];
  filtros.forEach((filtro, i) => {
    if (filtro && campoEsExtendido(filtro.campo) && !campoExisteEnHoja(filtro.campo)) {
      advertencias.push(
        `Filtro ${i + 1}: la columna "${filtro.campo}" todavía no existe en la hoja ` +
        `"${getSheetName('REGISTROS')}". El filtro no seleccionará registros hasta que se agregue.`
      );
    }
  });
  return advertencias;
}

function validarFiltros(filtros) {
  const campos = getCamposDisponibles();
  const operadores = getOperadoresDisponibles();
  const errores = [];
  filtros.forEach((filtro, i) => {
    if (!filtro.campo || !campos.includes(filtro.campo)) {
      errores.push(`Filtro ${i + 1}: campo "${filtro.campo}" no existe`);
    }
    if (!filtro.operador || !operadores.includes(filtro.operador)) {
      errores.push(`Filtro ${i + 1}: operador "${filtro.operador}" inválido`);
    }
    if (filtro.operador !== OPERADORES.VACIO && filtro.operador !== OPERADORES.NO_VACIO) {
      if (filtro.valor === undefined || filtro.valor === null || String(filtro.valor).trim() === '') {
        errores.push(`Filtro ${i + 1}: valor requerido para operador "${filtro.operador}"`);
      }
    }
  });
  return errores;
}

function filtrarRegistros(filtros) {
  const registros = getRegistrosConIndices();
  return aplicarFiltros(registros, filtros);
}