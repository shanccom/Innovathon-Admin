const CONFIG_SISTEMA = {
  SHEETS: {
    REGISTROS: 'Registros'
  },
  HEADERS_REGISTROS: [
    'Código',
    'Fecha de registro',
    'Nombres y apellidos',
    'DNI',
    'Correo institucional',
    'Correo personal',
    'Institución de procedencia',
    'Otra institución',
    'Nivel académico',
    'Sede',
    'Otra sede',
    'Carrera / Especialidad',
    'Otra carrera',
    'Habilidades principales',
    'Áreas de aporte',
    'Eje temático / Reto',
    'Compañero / Recomendación',
    'LinkedIn / Portafolio',
    'Disponibilidad presencial',
    'Aceptó términos',
    'Origen'
  ],
  HEADERS_OBLIGATORIOS: [
    'Código',
    'Nombres y apellidos',
    'Correo institucional'
  ],
  CAMPOS_CORREO: ['Correo institucional', 'Correo personal'],
  CAMPO_CORREO_DEFECTO: 'Correo institucional',
  CAMPO_NOMBRE: 'Nombres y apellidos',
  CAMPO_ID: 'Código',
  /**
   * Campos de filtro que NO requieren existir como columna en "Registros".
   * Sirven para funcionalidades futuras: hoy el filtro «Grupo», que se
   * habilitará cuando el sorteo de grupos escriba la columna en la hoja.
   * Cambia 'Grupo' por el nombre exacto de la columna cuando lo definas.
   */
  CAMPOS_EXTENDIDOS: ['Grupo'],
  ESTADOS_ENVIO: {
    ENVIADO: 'ENVIADO',
    ERROR: 'ERROR',
    OMITIDO: 'OMITIDO',
    PENDIENTE: 'PENDIENTE'
  },
  LOTE_TAMANO: 50,
  CAMPANA_ID_PREFIX: 'CMP_',
  PROPIEDADES: {
    PROGRESO_KEY: 'campana_progreso_',
    ULTIMA_FILA_KEY: 'ultima_fila_procesada_'
  }
};

function getConfig(key) {
  return CONFIG_SISTEMA[key];
}

function getSheetName(sheetKey) {
  return CONFIG_SISTEMA.SHEETS[sheetKey] || sheetKey;
}

function getHeadersRegistros() {
  return [...CONFIG_SISTEMA.HEADERS_REGISTROS];
}

function getRequiredHeaders() {
  return [...CONFIG_SISTEMA.HEADERS_OBLIGATORIOS];
}

function getCamposCorreo() {
  return [...CONFIG_SISTEMA.CAMPOS_CORREO];
}

/**
 * Campos de filtro disponibles aunque no existan como columna en la hoja.
 */
function getCamposExtendidos() {
  return [...CONFIG_SISTEMA.CAMPOS_EXTENDIDOS];
}

function getCampoCorreoDefecto() {
  return CONFIG_SISTEMA.CAMPO_CORREO_DEFECTO;
}

function getCampoNombre() {
  return CONFIG_SISTEMA.CAMPO_NOMBRE;
}

function getCampoId() {
  return CONFIG_SISTEMA.CAMPO_ID;
}

function getEstadosEnvio() {
  return { ...CONFIG_SISTEMA.ESTADOS_ENVIO };
}

function getLoteTamano() {
  return CONFIG_SISTEMA.LOTE_TAMANO;
}

function generarCampanaId() {
  const ahora = new Date();
  const timestamp = Utilities.formatDate(ahora, Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  return CONFIG_SISTEMA.CAMPANA_ID_PREFIX + timestamp;
}
