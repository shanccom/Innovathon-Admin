import { icons } from '../components/icons.js';
import { participantsService } from '../services/participantsService.js';

const SAMPLE_APPS_SCRIPT_CODE = `/**
 * Backend de Google Apps Script para Innovathon Mollendo 2026
 * Permite leer "Registros" y escribir en "Asistencias" de forma segura.
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

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export function renderSettings() {
  const config = participantsService.config;

  return `
    <div class="page-header-row">
      <div>
        <h1 class="page-title">Configuración de integraciones</h1>
        <p class="page-subtitle">Gestiona la conexión con Google Sheets (hoja «Registros») y servicios de Google Workspace.</p>
      </div>
      <div class="page-actions">
        <a href="#/" class="btn btn-secondary">
          ${icons.arrowLeft}
          <span>Volver al panel</span>
        </a>
      </div>
    </div>

    <!-- Formulario de Configuración -->
    <div class="form-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--color-midnight); margin: 0;">
            Conexión con Google Sheets
          </h2>
          <p class="form-hint" style="margin-top: 0.25rem;">
            Especifica el ID de tu hoja y el nombre de la pestaña donde están los participantes registrados.
          </p>
        </div>
        <a href="${participantsService.getSpreadsheetUrl()}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
          ${icons.externalLink}
          <span>Abrir hoja en Google Sheets</span>
        </a>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label class="form-label" for="cfg-spreadsheet-id">ID de la Hoja de Cálculo (Google Sheets ID)</label>
          <input 
            type="text" 
            id="cfg-spreadsheet-id" 
            class="form-control" 
            value="${config.spreadsheetId}" 
            placeholder="1U48ftJJns3-4waJrt4A4uaI4OBNQoeyg1sOzzvXllI8"
          />
          <span class="form-hint">
            Extraído de la URL de tu hoja: <code>docs.google.com/spreadsheets/d/<strong>ID</strong>/edit</code>
          </span>
        </div>

        <div class="form-group">
          <label class="form-label" for="cfg-sheet-name">Nombre de la Pestaña / Hoja</label>
          <input 
            type="text" 
            id="cfg-sheet-name" 
            class="form-control" 
            value="${config.sheetName}" 
            placeholder="Registros"
          />
          <span class="form-hint">
            Debe coincidir exactamente con el nombre de la pestaña (por defecto: <code>Registros</code>).
          </span>
        </div>

        <div class="form-group">
          <label class="form-label" for="cfg-apps-script-url">
            URL de Google Apps Script Web App <span style="font-weight: 400; color: var(--text-muted);">(Opcional / Recomendado)</span>
          </label>
          <input 
            type="url" 
            id="cfg-apps-script-url" 
            class="form-control" 
            value="${config.appsScriptUrl || ''}" 
            placeholder="https://script.google.com/macros/s/.../exec"
          />
          <span class="form-hint">
            Si prefieres mantener la hoja privada o registrar asistencias, implementa el script proporcionado abajo.
          </span>
        </div>
      </div>

      <div id="settings-status-box"></div>

      <div class="form-actions">
        <button type="button" class="btn btn-primary" id="btn-save-and-test">
          ${icons.refresh}
          <span>Guardar y Probar Conexión</span>
        </button>
      </div>
    </div>

    <!-- Guía de Configuración -->
    <div class="form-card">
      <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--color-midnight); margin-bottom: 1.25rem;">
        ¿Cómo conectar la hoja de Google Sheets?
      </h2>

      <div style="margin-bottom: 2rem;">
        <h3 style="font-size: 1rem; font-weight: 700; color: var(--color-purple); margin-bottom: 0.75rem;">
          Opción 1: Acceso Directo por Enlace (Rápido - 10 segundos)
        </h3>
        
        <div class="guide-step">
          <div class="step-num">1</div>
          <div class="step-content">
            <div class="step-title">Abre la hoja de cálculo</div>
            <div class="step-desc">
              Ingresa a <a href="${participantsService.getSpreadsheetUrl()}" target="_blank" rel="noopener noreferrer">este enlace de Google Sheets</a>.
            </div>
          </div>
        </div>

        <div class="guide-step">
          <div class="step-num">2</div>
          <div class="step-content">
            <div class="step-title">Cambia los permisos de compartir</div>
            <div class="step-desc">
              Haz clic en el botón superior derecho <strong>Compartir</strong>. En la sección <strong>Acceso general</strong>, cambia de <em>Restringido</em> a <strong>«Cualquier persona con el enlace»</strong> con rol de <strong>Lector</strong>.
            </div>
          </div>
        </div>

        <div class="guide-step">
          <div class="step-num">3</div>
          <div class="step-content">
            <div class="step-title">Haz clic en Listo y Prueba</div>
            <div class="step-desc">
              Presiona el botón <strong>«Guardar y Probar Conexión»</strong> arriba. El panel leerá inmediatamente las filas de «Registros».
            </div>
          </div>
        </div>
      </div>

      <div class="nav-divider" style="margin: 2rem 0;"></div>

      <div>
        <h3 style="font-size: 1rem; font-weight: 700; color: var(--color-purple); margin-bottom: 0.75rem;">
          Opción 2: Conector Google Apps Script (Ideal para mantener la hoja privada y registrar asistencias)
        </h3>
        <p class="form-hint" style="margin-bottom: 1rem;">
          Permite leer los registros y enviar marcas de asistencia directamente a Google Sheets sin hacer el archivo público para todo el mundo.
        </p>

        <div class="guide-step">
          <div class="step-num">1</div>
          <div class="step-content">
            <div class="step-title">Abrir el editor de Apps Script</div>
            <div class="step-desc">
              En tu hoja de Google Sheets, ve a <strong>Extensiones &gt; Apps Script</strong>.
            </div>
          </div>
        </div>

        <div class="guide-step">
          <div class="step-num">2</div>
          <div class="step-content">
            <div class="step-title">Pegar el código de backend</div>
            <div class="step-desc">
              Borra el código que aparezca y pega el siguiente script:
            </div>
            <div class="code-box">
              <div class="code-header">
                <span>Código.gs</span>
                <button type="button" class="btn btn-secondary btn-sm" id="btn-copy-code" style="padding: 2px 8px; font-size: 0.75rem;">
                  ${icons.copy}
                  <span id="copy-text">Copiar código</span>
                </button>
              </div>
              <pre><code>${SAMPLE_APPS_SCRIPT_CODE}</code></pre>
            </div>
          </div>
        </div>

        <div class="guide-step" style="margin-top: 1.25rem;">
          <div class="step-num">3</div>
          <div class="step-content">
            <div class="step-title">Implementar como Aplicación Web</div>
            <div class="step-desc">
              Haz clic en <strong>Implementar &gt; Nueva implementación</strong>. Selecciona tipo <strong>Aplicación web</strong>.<br>
              En <em>Ejecutar como</em>: <strong>Yo</strong>.<br>
              En <em>Quién tiene acceso</em>: <strong>Cualquier persona</strong> (Anyone).<br>
              Copia la URL generada (termina en <code>/exec</code>) y pégala en el campo «URL de Google Apps Script Web App» de arriba.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function afterSettingsRender() {
  const saveBtn = document.querySelector('#btn-save-and-test');
  const copyBtn = document.querySelector('#btn-copy-code');
  const copyText = document.querySelector('#copy-text');
  const statusBox = document.querySelector('#settings-status-box');

  const idInput = document.querySelector('#cfg-spreadsheet-id');
  const nameInput = document.querySelector('#cfg-sheet-name');
  const urlInput = document.querySelector('#cfg-apps-script-url');

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(SAMPLE_APPS_SCRIPT_CODE);
        if (copyText) copyText.textContent = '¡Copiado!';
        setTimeout(() => {
          if (copyText) copyText.textContent = 'Copiar código';
        }, 2500);
      } catch (e) {
        alert('Copia el código manualmente desde el bloque de texto.');
      }
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const spreadsheetId = idInput ? idInput.value.trim() : '';
      const sheetName = nameInput ? nameInput.value.trim() : '';
      const appsScriptUrl = urlInput ? urlInput.value.trim() : '';

      participantsService.saveConfig({
        spreadsheetId: spreadsheetId || participantsService.config.spreadsheetId,
        sheetName: sheetName || participantsService.config.sheetName,
        appsScriptUrl,
      });

      if (statusBox) {
        statusBox.innerHTML = `
          <div class="alert-box alert-info">
            ${icons.refresh}
            <div>Probando conexión con Google Sheets...</div>
          </div>
        `;
      }

      saveBtn.classList.add('spinning');
      const res = await participantsService.fetchParticipants(true);
      saveBtn.classList.remove('spinning');

      if (!statusBox) return;

      if (res.success) {
        statusBox.innerHTML = `
          <div class="alert-box alert-success">
            ${icons.check}
            <div>
              <strong>¡Conexión establecida con éxito!</strong>
              <div style="margin-top: 0.25rem;">
                Se leyeron correctamente <strong>${res.count} participantes</strong> de la hoja «${participantsService.config.sheetName}».
                Tanto el panel principal como el módulo de Asistencias ya están sincronizados.
              </div>
            </div>
          </div>
        `;
      } else {
        if (res.error === 'PERMISSION_DENIED') {
          statusBox.innerHTML = `
            <div class="alert-box alert-warning">
              ${icons.alertCircle}
              <div>
                <strong>Hoja protegida por Google Drive:</strong>
                <div style="margin-top: 0.25rem;">
                  La hoja no permite lectura anónima todavía. Para solucionarlo en 10 segundos:
                  <ol style="margin: 0.5rem 0 0.5rem 1.25rem; padding: 0;">
                    <li>Abre <a href="${participantsService.getSpreadsheetUrl()}" target="_blank">tu hoja de Google Sheets</a>.</li>
                    <li>Presiona <strong>Compartir</strong> (botón verde/azul arriba a la derecha).</li>
                    <li>En <em>Acceso general</em>, selecciona <strong>«Cualquier persona con el enlace»</strong> como <strong>Lector</strong>.</li>
                    <li>Vuelve a presionar el botón <em>«Guardar y Probar Conexión»</em>.</li>
                  </ol>
                </div>
              </div>
            </div>
          `;
        } else {
          statusBox.innerHTML = `
            <div class="alert-box alert-error">
              ${icons.alertCircle}
              <div>
                <strong>Error al consultar la hoja:</strong>
                <div style="margin-top: 0.25rem;">${res.message}</div>
              </div>
            </div>
          `;
        }
      }
    });
  }
}
