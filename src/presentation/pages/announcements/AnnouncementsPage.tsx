import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAnnouncements } from '../../../application/hooks/useAnnouncements';
import { Icon } from '../../components/common/Icon';

type ActiveTab = 'destinatarios' | 'redaccion' | 'previa' | 'envio' | 'historial';

export const AnnouncementsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('redaccion');
  const [testEmailInput, setTestEmailInput] = useState<string>('');
  const [campaignNameInput] = useState<string>(
      `Comunicado - ${new Date().toLocaleString('es-MX', {
        dateStyle: 'short',
        timeStyle: 'short',
      })}`
    );
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmKeyword, setConfirmKeyword] = useState<string>('');
  const [previewTabMode, setPreviewTabMode] = useState<'html' | 'text'>('html');

  const {
    allRecipients,
    filteredRecipients,
    targetRecipients,
    availableTeams,
    availableRoles,
    participantsLoading,
    refreshParticipants,

    teamFilter,
    setTeamFilter,
    roleFilter,
    setRoleFilter,
    searchQuery,
    setSearchQuery,
    onlyValidEmails,
    setOnlyValidEmails,

    selectedIds,
    isManualSelectionMode,
    toggleSelectRecipient,
    selectAll,
    deselectAll,

    template,
    setAsunto,
    setCuerpo,
    insertVariable,
    handleImageUpload,
    removeImage,
    imageOptimizationInfo,

    spamEvaluation,

    previewIndex,
    setPreviewIndex,
    previewDevice,
    setPreviewDevice,
    currentPreviewRecipient,
    renderedPreview,

    testSending,
    testResult,
    sendTest,
    isSending,
    progress,
    campaignResult,
    sendCampaign,

    campaignHistory,
  } = useAnnouncements();

  useEffect(() => {
    document.title = 'Gestión de Comunicados - Innovathon Manager';
  }, []);

  const handleStartSending = async () => {
    if (confirmKeyword.trim().toUpperCase() !== 'ENVIAR') {
      alert('Debes escribir "ENVIAR" exactamente en mayúsculas para desbloquear el despacho.');
      return;
    }
    setShowConfirmModal(false);
    setConfirmKeyword('');
    try {
      await sendCampaign(campaignNameInput || `Comunicado - ${template.asunto}`, 'ENVIAR');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error durante el envío de la campaña.');
    }
  };

  const spamBadgeColor =
    spamEvaluation.nivel === 'safe'
      ? 'var(--status-success-text)'
      : spamEvaluation.nivel === 'caution'
      ? '#b45309'
      : '#b91c1c';

  const spamBadgeBg =
    spamEvaluation.nivel === 'safe'
      ? 'var(--status-success-bg)'
      : spamEvaluation.nivel === 'caution'
      ? 'var(--status-warning-bg)'
      : 'var(--status-danger-bg)';

  return (
    <>
      {/* Encabezado Principal */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Gestión de comunicados masivos</h1>
          <p className="page-subtitle">
            Redacta, personaliza y despacha comunicados oficiales a participantes con protección anti-spam y optimización de imágenes.
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className={`btn btn-secondary btn-sm ${participantsLoading ? 'spinning' : ''}`}
            type="button"
            onClick={() => refreshParticipants()}
            disabled={participantsLoading}
            title="Sincronizar lista con Google Sheets"
          >
            <Icon name="refresh" />
            <span>Actualizar lista</span>
          </button>
          <Link to="/" className="btn btn-secondary btn-sm">
            <Icon name="arrowLeft" />
            <span>Volver al panel</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Métricas de Campaña */}
      <div className="status-cards-row" style={{ marginBottom: '1.5rem' }}>
        <div className="status-step-card" onClick={() => setActiveTab('destinatarios')} style={{ cursor: 'pointer' }}>
          <div className="status-step-icon pending">
            <Icon name="users" />
          </div>
          <div>
            <div className="status-step-title">Destinatarios seleccionados</div>
            <div className="status-step-count">{targetRecipients.length}</div>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              De {allRecipients.length} en «Registros»
            </small>
          </div>
        </div>

        <div className="status-step-card" onClick={() => setActiveTab('redaccion')} style={{ cursor: 'pointer' }}>
          <div
            className="status-step-icon"
            style={{
              backgroundColor: spamBadgeBg,
              color: spamBadgeColor,
              border: `1px solid ${spamBadgeColor}`,
            }}
          >
            <Icon name="mailCheck" />
          </div>
          <div>
            <div className="status-step-title">Evaluación Anti-Spam</div>
            <div className="status-step-count" style={{ color: spamBadgeColor }}>
              {spamEvaluation.score}/100
            </div>
            <small style={{ color: spamBadgeColor, fontSize: '0.75rem', fontWeight: 600 }}>
              {spamEvaluation.nivel === 'safe'
                ? 'Entregabilidad alta'
                : spamEvaluation.nivel === 'caution'
                ? 'Riesgo moderado'
                : 'Riesgo alto de spam'}
            </small>
          </div>
        </div>

        <div className="status-step-card" onClick={() => setActiveTab('previa')} style={{ cursor: 'pointer' }}>
          <div className="status-step-icon" style={{ backgroundColor: '#f0f9ff', color: '#0369a1' }}>
            <Icon name="fileText" />
          </div>
          <div>
            <div className="status-step-title">Contenido del correo</div>
            <div className="status-step-count" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              {template.imagenBase64 ? 'Texto + Imagen' : 'Solo Texto'}
            </div>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              {template.imagenBase64
                ? `${Math.round((template.imagenTamanoBytes || 0) / 1024)} KB optimizado`
                : 'Sin imagen adjunta'}
            </small>
          </div>
        </div>

        <div className="status-step-card" onClick={() => setActiveTab('historial')} style={{ cursor: 'pointer' }}>
          <div className="status-step-icon" style={{ backgroundColor: '#faf5ff', color: '#7e22ce' }}>
            <Icon name="award" />
          </div>
          <div>
            <div className="status-step-title">Campañas enviadas</div>
            <div className="status-step-count">{campaignHistory.length}</div>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              Registradas en historial
            </small>
          </div>
        </div>
      </div>

      {/* Navegación por Pestañas */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'redaccion' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('redaccion')}
        >
          <Icon name="penTool" />
          <span>1. Redacción & Diseño</span>
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'destinatarios' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('destinatarios')}
        >
          <Icon name="users" />
          <span>2. Destinatarios ({targetRecipients.length})</span>
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'previa' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('previa')}
        >
          <Icon name="fileText" />
          <span>3. Vista Previa</span>
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'envio' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('envio')}
          style={{
            backgroundColor: activeTab === 'envio' ? '#047857' : undefined,
            color: activeTab === 'envio' ? '#ffffff' : undefined,
          }}
        >
          <Icon name="send" />
          <span>4. Pruebas & Envío Seguro</span>
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'historial' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('historial')}
          style={{ marginLeft: 'auto' }}
        >
          <Icon name="clock" />
          <span>Historial ({campaignHistory.length})</span>
        </button>
      </div>

      {/* PESTAÑA 1: REDACCIÓN & DISEÑO */}
      {activeTab === 'redaccion' && (
        <div className="content-box">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '1.5rem' }}>
            {/* Columna Izquierda: Formulario de Redacción */}
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-midnight)' }}>
                  Asunto del correo electrónico
                </label>
                <input
                  type="text"
                  value={template.asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  placeholder="Ej: ¡Actualización importante sobre tu equipo! - Innovathon Mollendo 2026"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Se sugiere incluir el nombre del evento y evitar mayúsculas sostenidas.</span>
                  <span>{template.asunto.length} caracteres</span>
                </div>
              </div>

              {/* Botonera de inserción de variables */}
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  Datos personalizados disponibles (clic para insertar):
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    onClick={() => insertVariable('primer_nombre')}
                    title="Inserta solo el nombre de pila (ej: Carlos)"
                  >
                    + &#123;&#123;primer_nombre&#125;&#125;
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    onClick={() => insertVariable('nombre_completo')}
                    title="Inserta el nombre completo con mayúsculas y minúsculas correctas"
                  >
                    + &#123;&#123;nombre_completo&#125;&#125;
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    onClick={() => insertVariable('equipo | tu equipo asignado')}
                    title="Inserta el nombre del equipo con valor por defecto si está vacío"
                  >
                    + &#123;&#123;equipo&#125;&#125;
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    onClick={() => insertVariable('dni')}
                  >
                    + &#123;&#123;dni&#125;&#125;
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    onClick={() => insertVariable('rol')}
                  >
                    + &#123;&#123;rol&#125;&#125;
                  </button>
                </div>
              </div>

              {/* Textarea del cuerpo del correo */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-midnight)' }}>
                  Mensaje del comunicado
                </label>
                <textarea
                  value={template.cuerpo}
                  onChange={(e) => setCuerpo(e.target.value)}
                  rows={12}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    lineHeight: '1.6',
                    resize: 'vertical',
                  }}
                  placeholder="Redacta el mensaje aquí..."
                />
                <small style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Nota técnica: Los saltos de línea se transforman automáticamente en párrafos HTML limpios y responsivos.
                </small>
              </div>

              {/* Sección de Imagen Optimizada */}
              <div style={{ padding: '1rem', border: '1px dashed var(--border-medium)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Imagen adjunta (opcional)</span>
                  {template.imagenBase64 && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={removeImage}
                      style={{ color: '#b91c1c' }}
                    >
                      Quitar imagen
                    </button>
                  )}
                </div>

                {template.imagenBase64 ? (
                  <div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <img
                        src={`data:${template.imagenTipo || 'image/jpeg'};base64,${template.imagenBase64}`}
                        alt="Previsualización"
                        style={{ width: '90px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-light)' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{template.imagenNombre}</div>
                        <div style={{ color: 'var(--status-success-text)', fontSize: '0.75rem', fontWeight: 600 }}>
                          {imageOptimizationInfo || 'Imagen optimizada para carga ultra rápida.'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', cursor: 'pointer', padding: '1rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      />
                      <Icon name="penTool" size={20} />
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.25rem' }}>
                        Haz clic para subir un banner o imagen
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Se redimensiona y comprime automáticamente en el navegador a menos de 200 KB
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Columna Derecha: Asesor Anti-Spam en Vivo */}
            <div>
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: spamBadgeBg,
                  border: `1px solid ${spamBadgeColor}`,
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: spamBadgeColor }}>
                    Semáforo Anti-Spam
                  </h3>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: spamBadgeColor }}>
                    {spamEvaluation.score} / 100
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: spamBadgeColor, margin: 0 }}>
                  {spamEvaluation.nivel === 'safe'
                    ? 'Cumple con los estándares recomendados por Gmail y SpamAssassin.'
                    : spamEvaluation.nivel === 'caution'
                    ? 'Presenta algunos factores que podrían disminuir la entregabilidad.'
                    : 'Peligro: Este mensaje tiene alta probabilidad de ser enviado a la carpeta de Spam.'}
                </p>
              </div>

              {/* Lista de advertencias o consejos */}
              <div style={{ backgroundColor: '#fff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Diagnóstico en tiempo real:
                </h4>

                {spamEvaluation.advertencias.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--status-success-text)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Icon name="checkCircle" size={18} />
                    <span>¡Excelente! No se detectaron patrones de spam en el asunto ni en el cuerpo.</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {spamEvaluation.advertencias.map((adv) => (
                      <div
                        key={adv.id}
                        style={{
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: adv.tipo === 'danger' ? '#fef2f2' : adv.tipo === 'warning' ? '#fffbeb' : '#f0f9ff',
                          borderLeft: `3px solid ${adv.tipo === 'danger' ? '#dc2626' : adv.tipo === 'warning' ? '#d97706' : '#0284c7'}`,
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: adv.tipo === 'danger' ? '#991b1b' : adv.tipo === 'warning' ? '#92400e' : '#0369a1' }}>
                          {adv.mensaje}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          {adv.sugerencia}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Acceso rápido a Previsualizar */}
              <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem' }}
                  onClick={() => setActiveTab('previa')}
                >
                  <Icon name="fileText" />
                  <span>Ver vista previa interactiva →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: DESTINATARIOS */}
      {activeTab === 'destinatarios' && (
        <div className="content-box">
          {/* Barra de Filtros */}
          <div className="filter-strip" style={{ marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div className="filter-input" style={{ flex: '1 1 240px' }}>
              <Icon name="search" />
              <input
                type="text"
                placeholder="Buscar por nombre, DNI, equipo o correo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="filter-select"
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              style={{ flex: '0 1 200px' }}
            >
              <option value="all">Todos los equipos ({allRecipients.length})</option>
              {availableTeams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ flex: '0 1 180px' }}
            >
              <option value="all">Todos los roles</option>
              {availableRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={onlyValidEmails}
                onChange={(e) => setOnlyValidEmails(e.target.checked)}
              />
              <span>Solo correos válidos</span>
            </label>
          </div>

          {/* Barra de control de selección */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Destinatarios seleccionados: <span style={{ color: 'var(--color-primary-600)', fontWeight: 800 }}>{targetRecipients.length}</span> de {filteredRecipients.length} visibles
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={selectAll}>
                Seleccionar todos
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={deselectAll}>
                Deseleccionar todos
              </button>
            </div>
          </div>

          {/* Tabla de Destinatarios */}
          <div className="table-container" style={{ maxHeight: '480px', overflowY: 'auto' }}>
            <table className="table-mock">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>✓</th>
                  <th>Participante</th>
                  <th>DNI</th>
                  <th>Correo Electrónico</th>
                  <th>Equipo / Proyecto</th>
                  <th>Rol</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecipients.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No se encontraron participantes con los filtros actuales.
                    </td>
                  </tr>
                ) : (
                  filteredRecipients.map((r) => {
                    const isSelected = !isManualSelectionMode || selectedIds.has(r.id);
                    return (
                      <tr key={r.id} style={{ backgroundColor: isSelected ? 'transparent' : '#f8fafc', opacity: isSelected ? 1 : 0.6 }}>
                        <td>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRecipient(r.id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{r.nombre}</div>
                          <small style={{ color: 'var(--text-muted)' }}>{r.primerNombre}</small>
                        </td>
                        <td>
                          <code>{r.dni}</code>
                        </td>
                        <td>
                          {r.correo !== '—' ? (
                            <div>
                              <span style={{ fontSize: '0.85rem' }}>{r.correo}</span>
                              {r.correoInstitucional && r.correoInstitucional !== r.correo && (
                                <small style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                  {r.correoInstitucional}
                                </small>
                              )}
                            </div>
                          ) : (
                            <span className="badge-demo" style={{ color: '#b91c1c' }}>Sin correo</span>
                          )}
                        </td>
                        <td>{r.equipo}</td>
                        <td>
                          <span className="badge-demo">{r.rol}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: VISTA PREVIA INTERACTIVA */}
      {activeTab === 'previa' && (
        <div className="content-box">
          {/* Barra de control de vista previa */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            {/* Paginador de Participante */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Visualizando para:</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPreviewIndex((idx) => Math.max(0, idx - 1))}
                disabled={previewIndex <= 0}
              >
                ◀ Anterior
              </button>
              <span style={{ fontWeight: 700, padding: '0 0.5rem' }}>
                {currentPreviewRecipient.nombre} ({previewIndex + 1} de {Math.max(1, targetRecipients.length)})
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPreviewIndex((idx) => Math.min(targetRecipients.length - 1, idx + 1))}
                disabled={previewIndex >= targetRecipients.length - 1}
              >
                Siguiente ▶
              </button>
            </div>

            {/* Alternar Dispositivo & Modo */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                className={`btn btn-sm ${previewTabMode === 'html' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPreviewTabMode('html')}
              >
                Diseño HTML
              </button>
              <button
                type="button"
                className={`btn btn-sm ${previewTabMode === 'text' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPreviewTabMode('text')}
              >
                Texto Plano (Multipart)
              </button>

              <div style={{ borderLeft: '1px solid var(--border-medium)', height: '20px', margin: '0 0.25rem' }} />

              <button
                type="button"
                className={`btn btn-sm ${previewDevice === 'desktop' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPreviewDevice('desktop')}
                title="Vista de escritorio (600px)"
              >
                <Icon name="laptop" size={16} />
                <span>PC</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${previewDevice === 'mobile' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPreviewDevice('mobile')}
                title="Vista móvil (380px)"
              >
                <span>Móvil</span>
              </button>
            </div>
          </div>

          {/* Cabecera del correo simulado */}
          <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            <div>
              <strong>De:</strong> Comité Organizador Innovathon Mollendo 2026 &lt;notificaciones@innovathonmollendo.pe&gt;
            </div>
            <div>
              <strong>Para:</strong> {currentPreviewRecipient.nombre} &lt;{currentPreviewRecipient.correo}&gt;
            </div>
            <div>
              <strong>Asunto:</strong> <span style={{ color: 'var(--color-primary-600)', fontWeight: 700 }}>{renderedPreview.asunto}</span>
            </div>
          </div>

          {/* Lienzo de Previsualización */}
          <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#e2e8f0', padding: '1.5rem', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
            <div
              style={{
                width: previewDevice === 'mobile' ? '380px' : '620px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                transition: 'width 200ms ease',
              }}
            >
              {previewTabMode === 'html' ? (
                <iframe
                  title="Vista Previa de Correo"
                  srcDoc={renderedPreview.cuerpoHtml}
                  style={{
                    width: '100%',
                    height: '560px',
                    border: 'none',
                    display: 'block',
                  }}
                />
              ) : (
                <div style={{ padding: '1.5rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.85rem', color: '#334155', maxHeight: '560px', overflowY: 'auto' }}>
                  {renderedPreview.cuerpoPlano}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 4: PRUEBAS & ENVÍO SEGURO */}
      {activeTab === 'envio' && (
        <div className="content-box">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
            {/* Tarjeta 1: Envío de Prueba Individual */}
            <div style={{ padding: '1.5rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', backgroundColor: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div className="status-step-icon" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                  <Icon name="mailCheck" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Paso 1: Enviar correo de prueba</h3>
                  <small style={{ color: 'var(--text-muted)' }}>Envía una sola muestra para verificar cómo llega a tu bandeja.</small>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  Correo de destino para la prueba:
                </label>
                <input
                  type="email"
                  value={testEmailInput}
                  onChange={(e) => setTestEmailInput(e.target.value)}
                  placeholder="ejemplo@gmail.com"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                  }}
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  Se generará usando los datos de {currentPreviewRecipient.primerNombre}.
                </small>
              </div>

              <button
                type="button"
                className={`btn btn-secondary ${testSending ? 'spinning' : ''}`}
                onClick={() => sendTest(testEmailInput)}
                disabled={testSending || !testEmailInput}
                style={{ width: '100%' }}
              >
                <Icon name="send" />
                <span>{testSending ? 'Enviando prueba...' : 'Enviar correo de prueba'}</span>
              </button>

              {testResult && (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: testResult.success ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
                    color: testResult.success ? 'var(--status-success-text)' : 'var(--status-danger-text)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                  }}
                >
                  {testResult.message}
                </div>
              )}
            </div>

            {/* Tarjeta 2: Despacho Masivo Definitivo */}
            <div style={{ padding: '1.5rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', backgroundColor: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div className="status-step-icon" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
                  <Icon name="send" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Paso 2: Despacho masivo oficial</h3>
                  <small style={{ color: 'var(--text-muted)' }}>Se enviará a los {targetRecipients.length} participantes seleccionados.</small>
                </div>
              </div>

              {/* Advertencias antes del envío - Candado de seguridad anti-errores */}
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#92400e' }}>
                <strong>Candado de seguridad anti-errores:</strong>
                <div>
                  • Destinatarios seleccionados: <strong>{targetRecipients.length} personas</strong>.
                </div>
                <div>
                  • Esta acción consumirá cuota de Gmail y no se puede deshacer.
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#047857', borderColor: '#047857' }}
                onClick={() => setShowConfirmModal(true)}
                disabled={targetRecipients.length === 0 || isSending}
              >
                <Icon name="send" />
                <span>Lanzar despacho a {targetRecipients.length} personas...</span>
              </button>
            </div>
          </div>

          {/* Visualizador de progreso en vivo */}
          {isSending && (
            <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-midnight)' }}>
                Enviando comunicado ({progress.porcentaje}%)...
              </h3>
              <div style={{ height: '14px', backgroundColor: '#e2e8f0', borderRadius: '7px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: 'var(--color-primary-600)',
                    width: `${progress.porcentaje}%`,
                    transition: 'width 200ms ease',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Procesando: <code>{progress.ultimoCorreo}</code></span>
                <span>{progress.current} de {progress.total} completados ({progress.enviados} enviados, {progress.errores} errores)</span>
              </div>
            </div>
          )}

          {/* Resultado de la campaña enviada */}
          {campaignResult && !isSending && (
            <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--status-success-bg)', border: '1px solid var(--status-success-border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Icon name="checkCircle" size={24} color="var(--status-success-text)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--status-success-text)', margin: 0 }}>
                  ¡Campaña finalizada exitosamente!
                </h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--status-success-text)', margin: 0 }}>
                Se despacharon {campaignResult.enviados} correos correctamente. Puedes consultar el detalle en la pestaña de <strong>Historial</strong>.
              </p>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 5: HISTORIAL DE ENVÍOS */}
      {activeTab === 'historial' && (
        <div className="content-box">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-midnight)' }}>
            Registro de comunicados despachados
          </h2>

          {campaignHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-box">
                <Icon name="announcements" />
              </div>
              <h3 className="empty-title">Sin comunicados registrados</h3>
              <p className="empty-desc">
                Aún no se han realizado despachos de comunicados desde este panel. Los envíos completados aparecerán aquí con sus métricas.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table-mock">
                <thead>
                  <tr>
                    <th>Fecha y Hora</th>
                    <th>Nombre de Campaña</th>
                    <th>Asunto</th>
                    <th>Destinatarios</th>
                    <th>Enviados</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignHistory.map((camp) => (
                    <tr key={camp.id}>
                      <td>{camp.fecha}</td>
                      <td>
                        <strong>{camp.nombre}</strong>
                      </td>
                      <td>{camp.asunto}</td>
                      <td>{camp.totalDestinatarios}</td>
                      <td>
                        <span style={{ color: 'var(--status-success-text)', fontWeight: 700 }}>
                          {camp.enviados}
                        </span>{' '}
                        / {camp.totalDestinatarios}
                      </td>
                      <td>
                        <span className="badge-live">{camp.estado.toUpperCase()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN REFORZADA ("A PRUEBA DE TONTOS") */}
      {showConfirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 10, 24, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              maxWidth: '460px',
              width: '100%',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', marginBottom: '0.75rem' }}>
              <Icon name="alertCircle" size={24} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                Confirmación de seguridad
              </h3>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Estás a punto de enviar este comunicado por correo electrónico a{' '}
              <strong style={{ color: 'var(--color-midnight)' }}>{targetRecipients.length} participantes</strong>. Esta acción consumirá cuota de Gmail y no se puede deshacer.
            </p>

            <div style={{ marginBottom: '1.25rem', backgroundColor: '#fef2f2', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.35rem' }}>
                Para continuar, escribe la palabra &quot;ENVIAR&quot; en mayúsculas:
              </label>
              <input
                type="text"
                value={confirmKeyword}
                onChange={(e) => setConfirmKeyword(e.target.value)}
                placeholder="Escribe ENVIAR aquí..."
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: '4px',
                  border: '2px solid #ef4444',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  letterSpacing: '1px',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmKeyword('');
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{
                  backgroundColor: confirmKeyword.trim() === 'ENVIAR' ? '#dc2626' : '#9ca3af',
                  borderColor: confirmKeyword.trim() === 'ENVIAR' ? '#dc2626' : '#9ca3af',
                  cursor: confirmKeyword.trim() === 'ENVIAR' ? 'pointer' : 'not-allowed',
                }}
                disabled={confirmKeyword.trim() !== 'ENVIAR'}
                onClick={handleStartSending}
              >
                Sí, enviar a todos
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
