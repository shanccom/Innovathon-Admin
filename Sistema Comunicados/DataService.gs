function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getHojaPorNombre(sheetName) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`La hoja "${sheetName}" no existe en este archivo de Google Sheets.`);
  }
  return sheet;
}

function getHeaders(sheetName) {
  const sheet = getHojaPorNombre(sheetName);
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) return [];
  const range = sheet.getRange(1, 1, 1, lastCol);
  const values = range.getValues()[0];
  return values.filter(h => h !== '');
}

function getAllData(sheetName) {
  const sheet = getHojaPorNombre(sheetName);
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol === 0) return [];
  const range = sheet.getRange(2, 1, lastRow - 1, lastCol);
  const values = range.getValues();
  const headers = getHeaders(sheetName);
  return values.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  }).filter(obj => {
    return Object.values(obj).some(v => v !== '' && v !== null && v !== undefined);
  });
}

function getRegistros() {
  return getAllData(getSheetName('REGISTROS'));
}

function getRegistrosConIndices() {
  const sheet = getHojaPorNombre(getSheetName('REGISTROS'));
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol === 0) return [];
  const range = sheet.getRange(2, 1, lastRow - 1, lastCol);
  const values = range.getValues();
  const headers = getHeaders(getSheetName('REGISTROS'));
  return values.map((row, index) => {
    const obj = { _fila: index + 2 };
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  }).filter(obj => {
    return Object.keys(obj).some(k => k !== '_fila' && obj[k] !== '' && obj[k] !== null && obj[k] !== undefined);
  });
}

function validarHeadersRegistros() {
  const headers = getHeaders(getSheetName('REGISTROS'));
  if (headers.length === 0) {
    throw new Error('La hoja "Registros" está vacía. Debe contener encabezados en la fila 1.');
  }
  const requeridos = getRequiredHeaders();
  const faltantes = requeridos.filter(h => !headers.includes(h));
  if (faltantes.length > 0) {
    throw new Error(`Faltan columnas obligatorias en Registros: ${faltantes.join(', ')}`);
  }
  const duplicados = headers.filter((h, i) => headers.indexOf(h) !== i && h !== '');
  if (duplicados.length > 0) {
    throw new Error(`Columnas duplicadas en Registros: ${[...new Set(duplicados)].join(', ')}`);
  }
  return true;
}

function contarRegistros() {
  const registros = getRegistros();
  return registros.length;
}

function analizarCorreos(registros, columnaCorreo) {
  const validos = [];
  const sinCorreo = [];
  const invalidos = [];
  registros.forEach(r => {
    const correo = String(r[columnaCorreo] || '').trim();
    if (correo === '') {
      sinCorreo.push(r);
    } else if (!validarEmail(correo)) {
      invalidos.push({ registro: r, correo: correo });
    } else {
      validos.push(r);
    }
  });
  return { validos, sinCorreo, invalidos };
}

function setupInicial() {
  const registrosSheet = getSpreadsheet().getSheetByName('Registros');
  if (!registrosSheet) {
    SpreadsheetApp.getUi().alert(
      '⚠️ No se encontró la hoja "Registros".\n\n' +
      'Crea una hoja llamada "Registros" con tus datos y vuelve a ejecutar esta configuración.'
    );
    return;
  }
  try {
    validarHeadersRegistros();
    const total = contarRegistros();
    SpreadsheetApp.getUi().alert(
      '✅ Configuración completada.\n\n' +
      `Hoja "Registros" encontrada con ${total} registros.`
    );
  } catch (e) {
    SpreadsheetApp.getUi().alert('⚠️ Problema con la hoja "Registros":\n\n' + e.message);
  }
}
