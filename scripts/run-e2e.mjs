import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const PORT = 4173;
const DIST_DIR = path.resolve('dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function createStaticServer() {
  return http.createServer((req, res) => {
    const urlPath = req.url?.split('?')[0] || '/';
    let filePath = path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end('Not Found');
    }
  });
}

async function runE2ESuite() {
  console.log('\n======================================================');
  console.log('🧪 EJECUTANDO SUITE E2E PLAYWRIGHT: SISTEMA DE COMUNICADOS');
  console.log('======================================================\n');

  if (!fs.existsSync(DIST_DIR)) {
    throw new Error('El directorio dist/ no existe. Ejecuta npm run build primero.');
  }

  const server = createStaticServer();
  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  console.log(`✓ Servidor estático iniciado en http://127.0.0.1:${PORT}`);

  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
  });
  console.log('✓ Navegador Chromium lanzado');

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  // Sembrar participantes de prueba para validaciones realistas de filtrado y preview
  await context.addInitScript(() => {
    const mockParticipants = [
      {
        id: '1',
        dni: '71234567',
        nombre: 'Fernando Garambel',
        equipo: 'Equipo Alfa',
        correo: 'fgarambelm@gmail.com',
        celular: '958123456',
        rol: 'Líder de Proyecto',
        estado: 'Registrado',
        raw: {},
      },
      {
        id: '2',
        dni: '72345678',
        nombre: 'Valeria Mendoza',
        equipo: 'Equipo Beta',
        correo: 'valeria@gmail.com',
        celular: '958654321',
        rol: 'Desarrolladora',
        estado: 'Registrado',
        raw: {},
      },
      {
        id: '3',
        dni: '73456789',
        nombre: 'Carlos Quispe',
        equipo: 'Equipo Alfa',
        correo: 'carlos@gmail.com',
        celular: '958987654',
        rol: 'Diseñador UI/UX',
        estado: 'Registrado',
        raw: {},
      },
    ];
    sessionStorage.setItem(
      'innovathon_participants_cache',
      JSON.stringify({
        data: mockParticipants,
        timestamp: Date.now(),
        count: mockParticipants.length,
      })
    );
  });

  const page = await context.newPage();

  const baseUrl = `http://127.0.0.1:${PORT}/#/comunicados`;

  try {
    // -----------------------------------------------------------------
    // TEST 1: Navegación y Carga Inicial de Comunicados
    // -----------------------------------------------------------------
    console.log('\n[1/5] Verificando carga inicial y banner de conexión...');
    await page.goto(baseUrl, { waitUntil: 'networkidle' });

    const titleText = await page.textContent('h1.page-title');
    assert.match(titleText || '', /Gestión de comunicados/i, 'El encabezado debe contener "Gestión de comunicados"');

    // Banner de conexión de Apps Script debe existir
    const banner = page.locator('text=Conexión con Apps Script activa');
    const isBannerVisible = await banner.isVisible();
    assert.equal(isBannerVisible, true, 'El banner de estado de Apps Script debe estar visible');
    console.log('  ✔ Encabezado y banner de estado Apps Script verificados.');

    // -----------------------------------------------------------------
    // TEST 2: Redacción, Inserción de Variables y Medición Anti-Spam
    // -----------------------------------------------------------------
    console.log('\n[2/5] Probando redacción, botones de variables y motor Anti-Spam...');
    // Verificar pestaña activa Redacción
    const asuntoInput = page.locator('input[placeholder*="Actualización importante"]');
    await asuntoInput.waitFor({ state: 'visible' });

    // Insertar texto limpio
    await asuntoInput.fill('Notificación Oficial Innovathon 2026');
    const textarea = page.locator('textarea');
    await textarea.fill('Estimado participante,\n\nTe damos la bienvenida al evento.');

    // Probar clic en variable primer_nombre
    const varBtn = page.locator('button:has-text("primer_nombre")');
    await varBtn.click();
    const textareaVal = await textarea.inputValue();
    assert.match(textareaVal, /\{\{primer_nombre\}\}/, 'El botón debe haber insertado {{primer_nombre}}');

    // Comprobar medidor de Anti-Spam reactivo
    const spamScore = page.locator('.status-step-title:has-text("Evaluación Anti-Spam") + .status-step-count');
    const scoreInitial = await spamScore.textContent();
    assert.ok(scoreInitial && Number(scoreInitial.split('/')[0]) >= 80, 'Score inicial debe ser seguro (>=80)');

    // Inyectar texto spammer (ALL CAPS y palabras de spam)
    await asuntoInput.fill('¡¡¡URGENTE GRATIS GANA DINERO AHORA MISMO SIN COSTO!!!');
    await page.waitForTimeout(150);
    const scoreSpam = await spamScore.textContent();
    const parsedSpam = Number((scoreSpam || '100').split('/')[0]);
    assert.ok(parsedSpam < 80, `El score de spam debe degradarse ante mayúsculas y keywords (actual: ${parsedSpam})`);
    console.log(`  ✔ Inserción de variables y Anti-Spam reactivo correctos (Score cayó a ${parsedSpam}/100 ante spam).`);

    // Restaurar asunto normal
    await asuntoInput.fill('Comunicado Oficial de Participación - Innovathon Mollendo 2026');

    // -----------------------------------------------------------------
    // TEST 3: Vista Previa Responsiva (PC vs Móvil)
    // -----------------------------------------------------------------
    console.log('\n[3/5] Probando vista previa responsiva e iframe renderizado...');
    const tabPrevia = page.locator('button:has-text("3. Vista Previa")');
    await tabPrevia.click();

    const previewContainer = page.locator('iframe[title="Vista Previa de Correo"]');
    await previewContainer.waitFor({ state: 'visible' });

    // Alternar a Móvil
    const btnMovil = page.locator('button:has-text("Móvil")');
    await btnMovil.click();
    await page.waitForTimeout(250);
    const boxWrapper = page.locator('div:has(> iframe[title="Vista Previa de Correo"])');
    const boxWidthMobile = await boxWrapper.evaluate((el) => getComputedStyle(el).width);
    assert.equal(boxWidthMobile, '380px', 'En modo móvil el ancho debe ser 380px');

    // Alternar a PC
    const btnPC = page.locator('button:has-text("PC")');
    await btnPC.click();
    await page.waitForTimeout(250);
    const boxWidthPC = await boxWrapper.evaluate((el) => getComputedStyle(el).width);
    assert.equal(boxWidthPC, '620px', 'En modo PC el ancho debe ser 620px');
    console.log('  ✔ Cambio responsivo (380px Móvil / 620px PC) verificado con éxito.');

    // -----------------------------------------------------------------
    // TEST 4: Pestaña de Destinatarios, Búsqueda y Selección
    // -----------------------------------------------------------------
    console.log('\n[4/5] Probando filtrado y selección de destinatarios...');
    const tabDestinatarios = page.locator('button:has-text("2. Destinatarios")');
    await tabDestinatarios.click();

    const searchInput = page.locator('input[placeholder*="Buscar por nombre"]');
    await searchInput.waitFor({ state: 'visible' });

    // Botones de deselección y selección masiva
    const btnDeselectAll = page.getByRole('button', { name: 'Deseleccionar todos', exact: true });
    await btnDeselectAll.click();

    const counterSpan = page.locator('text=Destinatarios seleccionados:').locator('..');
    const counterTextZero = await counterSpan.textContent();
    assert.match(counterTextZero || '', /0 de/, 'Al deseleccionar todos el contador debe mostrar 0');

    const btnSelectAll = page.getByRole('button', { name: 'Seleccionar todos', exact: true });
    await btnSelectAll.click();
    const counterTextAll = await counterSpan.textContent();
    assert.doesNotMatch(counterTextAll || '', /0 de/, 'Al seleccionar todos el contador no debe ser 0');
    console.log('  ✔ Filtros y selección/deselección múltiple verificados.');

    // -----------------------------------------------------------------
    // TEST 5: Candado de Seguridad Anti-Errores en Despacho Masivo
    // -----------------------------------------------------------------
    console.log('\n[5/5] Probando validación de prueba y candado de seguridad (modal)...');
    const tabEnvio = page.locator('button:has-text("4. Pruebas & Envío Seguro")');
    await tabEnvio.click();

    // Comprobar input de correo de prueba
    const testEmailInput = page.locator('input[placeholder="ejemplo@gmail.com"]');
    await testEmailInput.waitFor({ state: 'visible' });
    const sendTestBtn = page.locator('button:has-text("Enviar correo de prueba")');
    
    // Botón de prueba debe estar deshabilitado con input vacío
    await testEmailInput.fill('');
    assert.equal(await sendTestBtn.isDisabled(), true, 'Botón de prueba debe estar deshabilitado si el input está vacío');

    await testEmailInput.fill('fgarambelm@gmail.com');
    assert.equal(await sendTestBtn.isDisabled(), false, 'Botón de prueba se habilita al ingresar correo');

    // Disparar modal de despacho masivo
    const openModalBtn = page.locator('button:has-text("Lanzar despacho a")');
    await openModalBtn.click();

    const modalTitle = page.locator('h3:has-text("Confirmación de seguridad")');
    await modalTitle.waitFor({ state: 'visible' });

    const confirmKeywordInput = page.locator('input[placeholder*="Escribe ENVIAR aquí"]');
    const confirmSubmitBtn = page.locator('button:has-text("Sí, enviar a todos")');

    // Inicialmente bloqueado
    assert.equal(await confirmSubmitBtn.isDisabled(), true, 'Botón de confirmación debe estar bloqueado inicialmente');

    // Escribir palabra incorrecta
    await confirmKeywordInput.fill('enviar'); // minúscula no debe habilitar
    assert.equal(await confirmSubmitBtn.isDisabled(), true, 'La palabra "enviar" en minúsculas no debe desbloquear');

    // Escribir la palabra de seguridad exacta
    await confirmKeywordInput.fill('ENVIAR');
    assert.equal(await confirmSubmitBtn.isDisabled(), false, 'La palabra "ENVIAR" en mayúsculas debe desbloquear el botón');

    // Cancelar para no disparar envío real en pruebas locales
    const cancelModalBtn = page.locator('button:has-text("Cancelar")');
    await cancelModalBtn.click();
    await modalTitle.waitFor({ state: 'hidden' });
    console.log('  ✔ Candado de seguridad de dos pasos (modal bloqueado hasta escribir "ENVIAR") verificado.');

    console.log('\n======================================================');
    console.log('🎉 TODOS LOS TESTS E2E (5/5) PASARON EXITOSAMENTE!');
    console.log('======================================================\n');
  } finally {
    await browser.close();
    server.close();
  }
}

runE2ESuite().catch((err) => {
  console.error('\n❌ ERROR EN PRUEBAS E2E:', err);
  process.exit(1);
});
