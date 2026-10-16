const C_NOMBRE = 'Nombres y apellidos';
const C_CORREO_INST = 'Correo institucional';
const C_CORREO_PERS = 'Correo personal';
const C_SEDE = 'Sede';
const C_NIVEL = 'Nivel académico';
const C_ORIGEN = 'Origen';
const C_ACEPTA = 'Aceptó términos';
const C_LINKEDIN = 'LinkedIn / Portafolio';
const C_EJE = 'Eje temático / Reto';

function obtenerFiltroDeEjemplo(campo) {
  const registros = getRegistros();
  for (let i = 0; i < registros.length; i++) {
    const valor = String(registros[i][campo] || '').trim();
    if (valor !== '') {
      return { campo: campo, operador: 'igual', valor: valor };
    }
  }
  return { campo: campo, operador: 'no vacio', valor: '' };
}

function obtenerFiltrosEjemplo() {
  return [
    obtenerFiltroDeEjemplo(C_SEDE),
    obtenerFiltroDeEjemplo(C_ACEPTA)
  ];
}

function logDestinatarios(destinatarios, columnaCorreo) {
  destinatarios.slice(0, 10).forEach(d => {
    Logger.log('  ' + getCorreoEnvio(d, columnaCorreo) + ' - ' + getNombreEnvio(d));
  });
}

function runTestCompleto() {
  setupInicial();
  const columnaCorreo = getCampoCorreoDefecto();
  const filtros = obtenerFiltrosEjemplo();
  Logger.log('Filtros de ejemplo: ' + JSON.stringify(filtros));
  const destinatarios = obtenerDestinatariosFiltrados(filtros);
  Logger.log('Destinatarios filtrados: ' + destinatarios.length);
  logDestinatarios(destinatarios, columnaCorreo);
  const asunto = 'Test {{' + C_NOMBRE + '}}';
  const cuerpo = 'Hola {{' + C_NOMBRE + '}}, bienvenido/a desde {{' + C_SEDE + '}}';
  const preview = previsualizarCampana(filtros, asunto, cuerpo, null, null, columnaCorreo);
  Logger.log('Preview: ' + JSON.stringify(preview, null, 2));
  if (preview.ok) {
    const resultado = ejecutarCampana(filtros, asunto, cuerpo, 'Test Completo', { modoPrueba: true, columnaCorreo: columnaCorreo });
    Logger.log('Resultado: ' + JSON.stringify(resultado, null, 2));
  }
}

function testCasosExtremos() {
  setupInicial();
  const columnaCorreo = getCampoCorreoDefecto();
  const filtros = obtenerFiltrosEjemplo();

  console.log('=== TEST 1: Filtro sin resultados ===');
  const f1 = [{ campo: C_ORIGEN, operador: 'igual', valor: 'ValorInexistenteXYZ' }];
  console.log('Filtrados:', obtenerDestinatariosFiltrados(f1).length);

  console.log('=== TEST 2: Campo opcional vacío ===');
  const f2 = [{ campo: C_LINKEDIN, operador: 'vacio', valor: '' }];
  console.log('Filtrados sin LinkedIn:', obtenerDestinatariosFiltrados(f2).length);

  console.log('=== TEST 3: Variable inexistente ===');
  const p = previsualizarCampana(filtros, 'Test {{campoInexistente}}', 'Hola {{' + C_NOMBRE + '}}', null, null, columnaCorreo);
  console.log('Preview error:', p.error);

  console.log('=== TEST 4: Campo opcional vacío en mensaje ===');
  const p2 = previsualizarCampana(filtros, 'Test', 'Hola {{' + C_NOMBRE + '}}, LinkedIn: {{' + C_LINKEDIN + '}}', null, null, columnaCorreo);
  console.log('Preview con LinkedIn vacío:', p2.ok ? (p2.previas[0] ? p2.previas[0].cuerpo : '(sin previas)') : p2.error);

  console.log('=== TEST 5: Validación email ===');
  console.log('Email válido:', validarEmail('test@test.com'));
  console.log('Email inválido:', validarEmail('invalid'));
  console.log('Email vacío:', validarEmail(''));

  console.log('=== TEST 6: Cuota ===');
  console.log('Cuota restante:', getCuotaRestante());

  console.log('=== TEST 7: Headers de Registros ===');
  console.log('Headers:', JSON.stringify(getHeaders(getSheetName('REGISTROS'))));
  console.log('validarHeadersRegistros:', validarHeadersRegistros());

  console.log('=== TEST 8: Variables con acentos y espacios ===');
  const vars = extraerVariables('{{' + C_NOMBRE + '}} {{' + C_ACEPTA + '}} {{' + C_EJE + '}}');
  console.log('Variables extraídas:', vars);

  console.log('=== TEST 9: testConexion() ===');
  const tc = testConexion();
  console.log('testConexion:', JSON.stringify(tc, null, 2));

  console.log('=== TEST 10: Filtros múltiples AND ===');
  const d4 = obtenerDestinatariosFiltrados(filtros);
  console.log('Filtrados AND:', d4.length);
  logDestinatarios(d4, columnaCorreo);

  console.log('=== TEST 11: Operador contiene ===');
  const f5 = [{ campo: C_NOMBRE, operador: 'contiene', valor: 'a' }];
  console.log('Filtrados contiene "a":', obtenerDestinatariosFiltrados(f5).length);

  console.log('=== TEST 12: Operador diferente ===');
  const f6 = [{ campo: C_ORIGEN, operador: 'diferente', valor: 'ValorInexistenteXYZ' }];
  console.log('Filtrados origen != inexistente:', obtenerDestinatariosFiltrados(f6).length);

  console.log('=== TEST 13: Case insensitive ===');
  const sedeEjemplo = String(getRegistros()[0] ? getRegistros()[0][C_SEDE] : '').trim();
  if (sedeEjemplo) {
    const f7 = [{ campo: C_SEDE, operador: 'igual', valor: sedeEjemplo.toLowerCase() }];
    console.log('Filtrados "' + sedeEjemplo.toLowerCase() + '" (minúscula):', obtenerDestinatariosFiltrados(f7).length);
  } else {
    console.log('Omitido: no hay valor de ejemplo en', C_SEDE);
  }

  console.log('=== TEST 14: Espacios en valor ===');
  if (sedeEjemplo) {
    const f8 = [{ campo: C_SEDE, operador: 'igual', valor: ' ' + sedeEjemplo + ' ' }];
    console.log('Filtrados con espacios:', obtenerDestinatariosFiltrados(f8).length);
  } else {
    console.log('Omitido: no hay valor de ejemplo en', C_SEDE);
  }

  console.log('=== TEST 15: Selector de columna de correo ===');
  console.log('Campos de correo:', getCamposCorreo());
  const analisisInst = analizarCorreos(getRegistros(), C_CORREO_INST);
  const analisisPers = analizarCorreos(getRegistros(), C_CORREO_PERS);
  console.log('Institucional -> válidos:', analisisInst.validos.length, 'sin correo:', analisisInst.sinCorreo.length, 'inválidos:', analisisInst.invalidos.length);
  console.log('Personal -> válidos:', analisisPers.validos.length, 'sin correo:', analisisPers.sinCorreo.length, 'inválidos:', analisisPers.invalidos.length);

  console.log('Todos los tests completados');
}

function testCuota() {
  console.log('=== TEST CUOTA ===');
  setupInicial();
  const columnaCorreo = getCampoCorreoDefecto();
  const filtros = obtenerFiltrosEjemplo();

  console.log('1. Cuota actual:', getCuotaRestante());

  console.log('2. Previsualizar campaña...');
  const asunto = 'Test Cuota {{' + C_NOMBRE + '}}';
  const cuerpo = 'Hola {{' + C_NOMBRE + '}}';
  const preview = previsualizarCampana(filtros, asunto, cuerpo, null, null, columnaCorreo);
  console.log('   Total destinatarios:', preview.totalDestinatarios);
  console.log('   OK:', preview.ok);
  console.log('   Advertencias:', JSON.stringify(preview.advertencias || []));

  console.log('3. Ejecutar en MODO PRUEBA...');
  const resultadoPrueba = ejecutarCampana(filtros, asunto, cuerpo, 'Test Cuota Prueba', { modoPrueba: true, columnaCorreo: columnaCorreo });
  console.log('   Resultado:', JSON.stringify(resultadoPrueba, null, 2));

  console.log('4. Resumen en memoria:', JSON.stringify(resultadoPrueba.resumen || {}, null, 2));
  console.log('   Detalle errores:', JSON.stringify(construirDetalleErrores(resultadoPrueba), null, 2));
  console.log('=== TEST CUOTA COMPLETADO ===');
}

function testFiltroGrupo() {
  console.log('=== TEST FILTRO GRUPO (campo extendido) ===');
  setupInicial();
  const campos = getCamposDisponibles();
  console.log('1. "Grupo" está en campos disponibles:', campos.includes('Grupo'));
  console.log('2. Es campo extendido:', campoEsExtendido('Grupo'));
  console.log('3. Columna existe en hoja:', campoExisteEnHoja('Grupo'));
  console.log('4. Advertencia:', JSON.stringify(advertenciasFiltros([{ campo: 'Grupo', operador: 'igual', valor: 'A' }])));
  console.log('5. Validación de filtros:', JSON.stringify(validarFiltros([{ campo: 'Grupo', operador: 'igual', valor: 'A' }])));
  console.log('6. Registros que cumplen Grupo=A:', obtenerDestinatariosFiltrados([{ campo: 'Grupo', operador: 'igual', valor: 'A' }]).length);
  console.log('=== TEST FILTRO GRUPO COMPLETADO ===');
}

function testModoRealPequeno() {
  console.log('=== TEST MODO REAL PEQUEÑO (pocos destinatarios) ===');
  console.log('⚠️ ADVERTENCIA: este test envía correos REALES.');
  setupInicial();
  const columnaCorreo = getCampoCorreoDefecto();
  const filtros = obtenerFiltrosEjemplo();

  console.log('1. Cuota actual:', getCuotaRestante());

  console.log('2. Previsualizar...');
  const asunto = 'Test Real {{' + C_NOMBRE + '}}';
  const cuerpo = 'Hola {{' + C_NOMBRE + '}}, esto es una prueba real.';
  const preview = previsualizarCampana(filtros, asunto, cuerpo, null, null, columnaCorreo);
  console.log('   Total:', preview.totalDestinatarios);

  if (preview.ok && preview.totalDestinatarios > 0) {
    console.log('3. Ejecutar MODO REAL con', preview.totalDestinatarios, 'destinatarios...');
    const resultado = ejecutarCampana(filtros, asunto, cuerpo, 'Test Real Pequeño', { modoPrueba: false, columnaCorreo: columnaCorreo });
    console.log('   Resultado:', JSON.stringify(resultado, null, 2));

    if (resultado.ok) {
      console.log('4. Resumen del envío...');
      console.log('   Resumen:', JSON.stringify(resultado.resumen, null, 2));
      console.log('   Errores:', JSON.stringify(construirDetalleErrores(resultado), null, 2));
    }
  }

  console.log('5. Cuota después:', getCuotaRestante());
  console.log('=== TEST MODO REAL COMPLETADO ===');
}

function testErrores() {
  console.log('=== TEST ERRORES ===');
  setupInicial();
  const columnaCorreo = getCampoCorreoDefecto();
  const sheet = getSpreadsheet().getSheetByName(getSheetName('REGISTROS'));
  const headers = getHeaders(getSheetName('REGISTROS'));

  console.log('1. Agregar fila con correo inválido...');
  const filaTest = headers.map(h => {
    if (h === C_NOMBRE) return 'Persona Error Test';
    if (h === C_CORREO_INST) return 'correo-invalido';
    if (h === C_ORIGEN) return 'TEST_TEMPORAL';
    return '';
  });
  sheet.appendRow(filaTest);

  const filtros = [{ campo: C_ORIGEN, operador: 'igual', valor: 'TEST_TEMPORAL' }];
  const preview = previsualizarCampana(filtros, 'Test', 'Hola {{' + C_NOMBRE + '}}', null, null, columnaCorreo);
  console.log('   Preview OK:', preview.ok, '| Error:', preview.error || '(ninguno)');

  if (preview.ok) {
    const r = ejecutarCampana(filtros, 'Test', 'Hola {{' + C_NOMBRE + '}}', 'Test Errores', { modoPrueba: true, columnaCorreo: columnaCorreo });
    console.log('   Resultado:', JSON.stringify(r, null, 2));
  }

  console.log('2. Eliminar fila de prueba...');
  sheet.deleteRow(sheet.getLastRow());
  console.log('=== TEST ERRORES COMPLETADO ===');
}

function testSeleccionCorreo() {
  console.log('=== TEST SELECCIÓN DE CORREO ===');
  setupInicial();
  const filtros = obtenerFiltrosEjemplo();

  console.log('1. Con "Correo institucional"...');
  const a1 = analizarCorreos(obtenerDestinatariosFiltrados(filtros), C_CORREO_INST);
  console.log('   válidos:', a1.validos.length, '| sin correo:', a1.sinCorreo.length, '| inválidos:', a1.invalidos.length);

  console.log('2. Con "Correo personal"...');
  const a2 = analizarCorreos(obtenerDestinatariosFiltrados(filtros), C_CORREO_PERS);
  console.log('   válidos:', a2.validos.length, '| sin correo:', a2.sinCorreo.length, '| inválidos:', a2.invalidos.length);

  console.log('3. Vista previa con columna personal...');
  const p = previsualizarCampana(filtros, 'Test {{' + C_NOMBRE + '}}', 'Hola', null, null, C_CORREO_PERS);
  console.log('   OK:', p.ok, '| excluidos:', JSON.stringify(p.excluidos || {}));
  if (p.ok && p.previas.length > 0) {
    console.log('   Correo mostrado:', p.previas[0].correo);
  }

  console.log('4. Variable inexistente detectada...');
  const p2 = previsualizarCampana(filtros, 'Test {{campoInexistente}}', 'Hola', null, null, C_CORREO_INST);
  console.log('   OK:', p2.ok, '| Error:', p2.error);

  console.log('=== TEST SELECCIÓN DE CORREO COMPLETADO ===');
}

function runAllTests() {
  testCasosExtremos();
  testCuota();
  testFiltroGrupo();
  testErrores();
  testSeleccionCorreo();
  console.log('TODOS LOS TESTS AUTOMÁTICOS COMPLETADOS');
}
