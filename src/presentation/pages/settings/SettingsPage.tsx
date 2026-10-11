import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../../../application/hooks/useConfig';
import { useParticipants } from '../../../application/hooks/useParticipants';
import { Icon } from '../../components/common/Icon';

const SAMPLE_APPS_SCRIPT_CODE = `/**
 * Backend de Google Apps Script para Innovathon Mollendo 2026
 * Permite leer "Registros" y despachar "Comunicados" masivos sin riesgo de spam ni timeouts.
 */

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Registros") || ss.getSheets()[0];
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return responseJSON({ success: true, total: 0, data: [] });
    }
    
    const headers = data[0];
    const rows = data.slice(1).map(function(row) {
      var item = {};
      headers.forEach(function(h, i) {
        if (h) item[String(h).trim()] = row[i];
      });
      return item;
    });
    
    return responseJSON({
      success: true,
      sheet: sheet.getName(),
      total: rows.length,
      data: rows
    });
  } catch (err) {
    return responseJSON({ success: false, error: err.message });
  }
}

function doPost(e) {
  try {
    const contents = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const action = contents.action || '';

    // 1. Envío de prueba individual
    if (action === 'send_test') {
      const emailParams = {
        to: contents.to,
        subject: contents.subject,
        htmlBody: contents.htmlBody,
        body: contents.plainBody || '',
        name: 'Innovathon Mollendo 2026'
      };

      if (contents.imageBase64 && contents.imageMimeType) {
        const raw = contents.imageBase64.split(',')[1] || contents.imageBase64;
        emailParams.inlineImages = {
          imagen: Utilities.newBlob(Utilities.base64Decode(raw), contents.imageMimeType, 'banner')
        };
      }

      MailApp.sendEmail(emailParams);
      return responseJSON({ success: true, message: 'Prueba enviada a ' + contents.to });
    }

    // 2. Despacho masivo por lotes con registro en HISTORIAL
    if (action === 'send_campaign') {
      const recipients = contents.destinatarios || [];
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let logSheet = ss.getSheetByName('HISTORIAL_COMUNICADOS');
      if (!logSheet) {
        logSheet = ss.insertSheet('HISTORIAL_COMUNICADOS');
        logSheet.appendRow(['Fecha', 'Campaña', 'Destinatario', 'Nombre', 'Asunto', 'Estado', 'Error']);
      }

      let imageBlob = null;
      if (contents.template && contents.template.imageBase64) {
        const raw = contents.template.imageBase64.split(',')[1] || contents.template.imageBase64;
        imageBlob = Utilities.newBlob(Utilities.base64Decode(raw), contents.template.imageMimeType || 'image/jpeg', 'banner');
      }

      let enviados = 0;
      let errores = 0;
      const detalles = [];

      for (let i = 0; i < recipients.length; i++) {
        const r = recipients[i];
        try {
          const emailParams = {
            to: r.correo,
            subject: r.asunto,
            htmlBody: r.htmlBody,
            body: r.plainBody || '',
            name: 'Innovathon Mollendo 2026'
          };
          if (imageBlob) {
            emailParams.inlineImages = { imagen: imageBlob };
          }
          MailApp.sendEmail(emailParams);
          enviados++;
          detalles.push({ correo: r.correo, nombre: r.nombre, estado: 'ENVIADO', timestamp: new Date().toLocaleTimeString() });
          logSheet.appendRow([new Date(), contents.campaignName, r.correo, r.nombre, r.asunto, 'ENVIADO', '']);
        } catch (err) {
          errores++;
          detalles.push({ correo: r.correo, nombre: r.nombre, estado: 'ERROR', error: err.message, timestamp: new Date().toLocaleTimeString() });
          logSheet.appendRow([new Date(), contents.campaignName, r.correo, r.nombre, r.asunto, 'ERROR', err.message]);
        }
        // Pacing de 1 segundo para proteger reputación de spam
        Utilities.sleep(1000);
      }

      return responseJSON({
        success: true,
        campaign: {
          id: 'CMP_' + Date.now(),
          nombre: contents.campaignName,
          asunto: contents.template.asunto,
          cuerpo: contents.template.cuerpo,
          imagenAdjunta: Boolean(imageBlob),
          totalDestinatarios: recipients.length,
          enviados: enviados,
          errores: errores,
          omitidos: 0,
          fecha: new Date().toLocaleString(),
          estado: errores > 0 ? (enviados > 0 ? 'parcial' : 'fallido') : 'completado',
          detalles: detalles
        }
      });
    }

    return responseJSON({ success: false, error: 'Acción no reconocida' });
  } catch (err) {
    return responseJSON({ success: false, error: err.message });
  }
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}`;

type TestStatus = 'idle' | 'testing' | 'success' | 'warning' | 'error';

export const SettingsPage: React.FC = () => {
  const { config, saveConfig, getSpreadsheetUrl } = useConfig();
  const { refresh } = useParticipants(false);

  const [spreadsheetId, setSpreadsheetId] = useState(config.spreadsheetId);
  const [sheetName, setSheetName] = useState(config.sheetName);
  const [appsScriptUrl, setAppsScriptUrl] = useState(config.appsScriptUrl || '');

  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [testResult, setTestResult] = useState<{ count?: number; message?: string }>({});
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    document.title = 'Configuración - Innovathon Manager';
  }, []);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(SAMPLE_APPS_SCRIPT_CODE);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    } catch {
      alert('Copia el código manualmente desde el bloque de texto.');
    }
  };

  const handleSaveAndTest = async () => {
    saveConfig({
      spreadsheetId: spreadsheetId.trim() || config.spreadsheetId,
      sheetName: sheetName.trim() || config.sheetName,
      appsScriptUrl: appsScriptUrl.trim(),
    });

    setTestStatus('testing');
    const res = await refresh();

    if (res.success) {
      setTestStatus('success');
      setTestResult({ count: res.count });
    } else {
      if (res.error === 'PERMISSION_DENIED') {
        setTestStatus('warning');
      } else {
        setTestStatus('error');
        setTestResult({ message: res.message });
      }
    }
  };

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Configuración de integraciones</h1>
          <p className="page-subtitle">
            Gestiona la conexión con Google Sheets (hoja «Registros») y servicios de Google Workspace.
          </p>
        </div>
        <div className="page-actions">
          <Link to="/" className="btn btn-secondary">
            <Icon name="arrowLeft" />
            <span>Volver al panel</span>
          </Link>
        </div>
      </div>

      {/* Formulario de Configuración */}
      <div className="form-card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--color-midnight)',
                margin: 0,
              }}
            >
              Conexión con Google Sheets
            </h2>
            <p className="form-hint" style={{ marginTop: '0.25rem' }}>
              Especifica el ID de tu hoja y el nombre de la pestaña donde están los participantes
              registrados.
            </p>
          </div>
          <a
            href={getSpreadsheetUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
          >
            <Icon name="externalLink" />
            <span>Abrir hoja en Google Sheets</span>
          </a>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="cfg-spreadsheet-id">
              ID de la Hoja de Cálculo (Google Sheets ID)
            </label>
            <input
              type="text"
              id="cfg-spreadsheet-id"
              className="form-control"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              placeholder="1U48ftJJns3-4waJrt4A4uaI4OBNQoeyg1sOzzvXllI8"
            />
            <span className="form-hint">
              Extraído de la URL de tu hoja:{' '}
              <code>
                docs.google.com/spreadsheets/d/<strong>ID</strong>/edit
              </code>
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cfg-sheet-name">
              Nombre de la Pestaña / Hoja
            </label>
            <input
              type="text"
              id="cfg-sheet-name"
              className="form-control"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="Registros"
            />
            <span className="form-hint">
              Debe coincidir exactamente con el nombre de la pestaña (por defecto:{' '}
              <code>Registros</code>).
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cfg-apps-script-url">
              URL de Google Apps Script Web App{' '}
              <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>
                (Opcional / Recomendado)
              </span>
            </label>
            <input
              type="url"
              id="cfg-apps-script-url"
              className="form-control"
              value={appsScriptUrl}
              onChange={(e) => setAppsScriptUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
            />
            <span className="form-hint">
              Si prefieres mantener la hoja privada o registrar asistencias, implementa el script
              proporcionado abajo.
            </span>
          </div>
        </div>

        <div id="settings-status-box">
          {testStatus === 'testing' && (
            <div className="alert-box alert-info">
              <Icon name="refresh" className="spinning" />
              <div>Probando conexión con Google Sheets...</div>
            </div>
          )}

          {testStatus === 'success' && (
            <div className="alert-box alert-success">
              <Icon name="check" />
              <div>
                <strong>¡Conexión establecida con éxito!</strong>
                <div style={{ marginTop: '0.25rem' }}>
                  Se leyeron correctamente <strong>{testResult.count} participantes</strong> de la hoja
                  «{sheetName}». Tanto el panel principal como el módulo de Asistencias ya están
                  sincronizados.
                </div>
              </div>
            </div>
          )}

          {testStatus === 'warning' && (
            <div className="alert-box alert-warning">
              <Icon name="alertCircle" />
              <div>
                <strong>Hoja protegida por Google Drive:</strong>
                <div style={{ marginTop: '0.25rem' }}>
                  La hoja no permite lectura anónima todavía. Para solucionarlo en 10 segundos:
                  <ol style={{ margin: '0.5rem 0 0.5rem 1.25rem', padding: 0 }}>
                    <li>
                      Abre{' '}
                      <a href={getSpreadsheetUrl()} target="_blank" rel="noopener noreferrer">
                        tu hoja de Google Sheets
                      </a>
                      .
                    </li>
                    <li>
                      Presiona <strong>Compartir</strong> (botón verde/azul arriba a la derecha).
                    </li>
                    <li>
                      En <em>Acceso general</em>, selecciona{' '}
                      <strong>«Cualquier persona con el enlace»</strong> como <strong>Lector</strong>.
                    </li>
                    <li>
                      Vuelve a presionar el botón <em>«Guardar y Probar Conexión»</em>.
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {testStatus === 'error' && (
            <div className="alert-box alert-error">
              <Icon name="alertCircle" />
              <div>
                <strong>Error al consultar la hoja:</strong>
                <div style={{ marginTop: '0.25rem' }}>{testResult.message}</div>
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-primary"
            id="btn-save-and-test"
            onClick={handleSaveAndTest}
            disabled={testStatus === 'testing'}
          >
            <Icon name="refresh" className={testStatus === 'testing' ? 'spinning' : ''} />
            <span>Guardar y Probar Conexión</span>
          </button>
        </div>
      </div>

      {/* Guía de Configuración */}
      <div className="form-card">
        <h2
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: 'var(--color-midnight)',
            marginBottom: '1.25rem',
          }}
        >
          ¿Cómo conectar la hoja de Google Sheets?
        </h2>

        <div style={{ marginBottom: '2rem' }}>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--color-purple-primary)',
              marginBottom: '0.75rem',
            }}
          >
            Opción 1: Acceso Directo por Enlace (Rápido - 10 segundos)
          </h3>

          <div className="guide-step">
            <div className="step-num">1</div>
            <div className="step-content">
              <div className="step-title">Abre la hoja de cálculo</div>
              <div className="step-desc">
                Ingresa a{' '}
                <a href={getSpreadsheetUrl()} target="_blank" rel="noopener noreferrer">
                  este enlace de Google Sheets
                </a>
                .
              </div>
            </div>
          </div>

          <div className="guide-step">
            <div className="step-num">2</div>
            <div className="step-content">
              <div className="step-title">Cambia los permisos de compartir</div>
              <div className="step-desc">
                Haz clic en el botón superior derecho <strong>Compartir</strong>. En la sección{' '}
                <strong>Acceso general</strong>, cambia de <em>Restringido</em> a{' '}
                <strong>«Cualquier persona con el enlace»</strong> con rol de <strong>Lector</strong>.
              </div>
            </div>
          </div>

          <div className="guide-step">
            <div className="step-num">3</div>
            <div className="step-content">
              <div className="step-title">Haz clic en Listo y Prueba</div>
              <div className="step-desc">
                Presiona el botón <strong>«Guardar y Probar Conexión»</strong> arriba. El panel
                leerá inmediatamente las filas de «Registros».
              </div>
            </div>
          </div>
        </div>

        <div className="nav-divider" style={{ margin: '2rem 0' }}></div>

        <div>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--color-purple-primary)',
              marginBottom: '0.75rem',
            }}
          >
            Opción 2: Conector Google Apps Script (Ideal para mantener la hoja privada y registrar
            asistencias)
          </h3>
          <p className="form-hint" style={{ marginBottom: '1rem' }}>
            Permite leer los registros y enviar marcas de asistencia directamente a Google Sheets sin
            hacer el archivo público para todo el mundo.
          </p>

          <div className="guide-step">
            <div className="step-num">1</div>
            <div className="step-content">
              <div className="step-title">Abrir el editor de Apps Script</div>
              <div className="step-desc">
                En tu hoja de Google Sheets, ve a <strong>Extensiones &gt; Apps Script</strong>.
              </div>
            </div>
          </div>

          <div className="guide-step">
            <div className="step-num">2</div>
            <div className="step-content">
              <div className="step-title">Pegar el código de backend</div>
              <div className="step-desc">Borra el código que aparezca y pega el siguiente script:</div>
              <div className="code-box">
                <div className="code-header">
                  <span>Código.gs</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    id="btn-copy-code"
                    style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                    onClick={handleCopyCode}
                  >
                    <Icon name="copy" />
                    <span id="copy-text">
                      {copyFeedback ? '¡Copiado!' : 'Copiar código'}
                    </span>
                  </button>
                </div>
                <pre>
                  <code>{SAMPLE_APPS_SCRIPT_CODE}</code>
                </pre>
              </div>
            </div>
          </div>

          <div className="guide-step" style={{ marginTop: '1.25rem' }}>
            <div className="step-num">3</div>
            <div className="step-content">
              <div className="step-title">Implementar como Aplicación Web</div>
              <div className="step-desc">
                Haz clic en <strong>Implementar &gt; Nueva implementación</strong>. Selecciona tipo{' '}
                <strong>Aplicación web</strong>.<br />
                En <em>Ejecutar como</em>: <strong>Yo</strong>.<br />
                En <em>Quién tiene acceso</em>: <strong>Cualquier persona</strong> (Anyone).<br />
                Copia la URL generada (termina en <code>/exec</code>) y pégala en el campo «URL de
                Google Apps Script Web App» de arriba.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
