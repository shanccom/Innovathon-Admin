function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📧 Comunicaciones')
    .addItem('⚙️ Configurar estructura inicial', 'setupInicial')
    .addSeparator()
    .addItem('🚀 Crear mensaje', 'abrirSidebar')
    .addSeparator()
    .addItem('🧪 Probar conexión Gmail', 'testConexionManual')
    .addToUi();
}

function abrirSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('Crear mensaje')
    .setWidth(420);
  SpreadsheetApp.getUi().showSidebar(html);
}

function getDatosIniciales() {
  try {
    const campos = getCamposDisponibles();
    const operadores = getOperadoresDisponibles();
    const conexion = testConexion();
    const camposCorreo = getCamposCorreo().filter(c => campos.includes(c));
    const totalRegistros = contarRegistros();
    const camposExtendidos = getCamposExtendidos();
    const columnasPendientes = camposExtendidos.filter(c => !campoExisteEnHoja(c));
    return {
      campos,
      operadores,
      testConexion: conexion,
      camposCorreo,
      campoCorreoDefecto: getCampoCorreoDefecto(),
      campoNombre: getCampoNombre(),
      camposExtendidos,
      columnasPendientes,
      hojaDatos: getSheetName('REGISTROS'),
      totalRegistros
    };
  } catch (e) {
    return {
      campos: [],
      operadores: [],
      testConexion: { ok: false, error: e.toString() },
      camposCorreo: [],
      campoCorreoDefecto: '',
      campoNombre: '',
      camposExtendidos: [],
      columnasPendientes: [],
      hojaDatos: '',
      totalRegistros: 0
    };
  }
}

function aplicarFiltrosUI(filtros, columnaCorreo) {
  try {
    columnaCorreo = columnaCorreo || getCampoCorreoDefecto();
    const todos = obtenerDestinatariosFiltrados(filtros);
    const analisis = analizarCorreos(todos, columnaCorreo);
    return {
      ok: true,
      total: todos.length,
      validos: analisis.validos.length,
      sinCorreo: analisis.sinCorreo.length,
      invalidos: analisis.invalidos.length
    };
  } catch (e) {
    return { ok: false, error: e.toString() };
  }
}

function previsualizarUI(filtros, asunto, cuerpo, imagenBase64, imagenTipo, columnaCorreo) {
  try {
    return previsualizarCampana(filtros, asunto, cuerpo, imagenBase64, imagenTipo, columnaCorreo);
  } catch (e) {
    return { ok: false, error: e.toString() };
  }
}

function ejecutarCampanaUI(filtros, asunto, cuerpo, tipoCampana, modoPrueba, imagenBase64, imagenTipo, columnaCorreo) {
  try {
    return ejecutarCampana(filtros, asunto, cuerpo, tipoCampana, { modoPrueba: !!modoPrueba, imagenBase64, imagenTipo, columnaCorreo });
  } catch (e) {
    return { ok: false, error: e.toString() };
  }
}

function testConexionManual() {
  const resultado = testConexion();
  const ui = SpreadsheetApp.getUi();
  if (resultado.ok) {
    ui.alert('✅ Conexión OK', 
      `Cuenta: ${resultado.usuario}\nTipo: ${resultado.tipoCuenta}\nCuota disponible: ${resultado.cuotaRestante} de ${resultado.limiteDiario} correos/día`, 
      ui.ButtonSet.OK);
  } else {
    ui.alert('❌ Error de conexión', resultado.error, ui.ButtonSet.OK);
  }
}
