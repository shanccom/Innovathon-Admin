/**
 * Configuración de las 6 Sesiones Oficiales de Asistencia y sus Formularios
 * Innovathon Mollendo 2026
 *
 * Cada sesión se corresponde con un bloque horario del evento (3 días x 2 turnos).
 * Los organizadores pueden sobreescribir las URLs de los formularios desde el panel
 * si se crea un formulario de emergencia durante el evento.
 */

export interface AttendanceSessionConfig {
  id: string;
  name: string;
  day: number;
  shift: 'mañana' | 'tarde';
  schedule: string;
  description: string;
  defaultFormUrl: string;
}

/** Umbral de asistencias para tener derecho a certificado de participación (5 de 6) */
export const MIN_ATTENDANCE_FOR_CERTIFICATE = 5;
export const TOTAL_ATTENDANCE_SESSIONS = 6;

export const DEFAULT_ATTENDANCE_SESSIONS: AttendanceSessionConfig[] = [
  {
    id: 'dia-1-manana',
    name: 'Día 1 - Mañana',
    day: 1,
    shift: 'mañana',
    schedule: '08:30 AM – 10:00 AM',
    description: 'Acreditación oficial, entrega de pases e inauguración',
    defaultFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSeGSB-L3fBFwLvKJtEH4lt20IM94GcMoACZz2I3kEoPS-VQTA/viewform',
  },
  {
    id: 'dia-1-tarde',
    name: 'Día 1 - Tarde',
    day: 1,
    shift: 'tarde',
    schedule: '02:30 PM – 04:00 PM',
    description: 'Conformación de equipos y primera ronda de mentorías',
    defaultFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScT-dRhuehJi0uuFSpkGqnSpXqzEGYUaSZq8UCZFzVzl2wkIw/viewform',
  },
  {
    id: 'dia-2-manana',
    name: 'Día 2 - Mañana',
    day: 2,
    shift: 'mañana',
    schedule: '08:30 AM – 10:00 AM',
    description: 'Check-in de desarrollo, programación y hacking matutino',
    defaultFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSeaMJ6H9awI0r9Kfl9RQ2IeuzssscG2fW30_sjA4fS8yK-WkQ/viewform',
  },
  {
    id: 'dia-2-tarde',
    name: 'Día 2 - Tarde',
    day: 2,
    shift: 'tarde',
    schedule: '02:30 PM – 04:00 PM',
    description: 'Checkpoint de prototipos y segunda ronda de mentorías',
    defaultFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSeiv1TztQAXjO8xnpn3dTn7EsbsIma2J8FQomryDzDm9uevIQ/viewform',
  },
  {
    id: 'dia-3-manana',
    name: 'Día 3 - Mañana',
    day: 3,
    shift: 'mañana',
    schedule: '08:30 AM – 10:00 AM',
    description: 'Ensayo general de pitch, validación técnica y demos',
    defaultFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScvI7yXkWpWO0wnQkw1mbykAmWvRDCJ5LZOZF8XzCBtyFjX5g/viewform',
  },
  {
    id: 'dia-3-tarde',
    name: 'Día 3 - Tarde',
    day: 3,
    shift: 'tarde',
    schedule: '02:00 PM – 03:30 PM',
    description: 'Presentación final ante el jurado calificador y clausura',
    defaultFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdELgCDKRMmGDcH94DujL5-Abd6Mrz13ENTxtGEku6itZysbg/viewform',
  },
];

const STORAGE_KEY_CUSTOM_URLS = 'innovathon_attendance_form_urls';

export function getCustomFormUrls(): Record<string, string> {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_URLS);
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading custom form URLs from storage:', e);
  }
  return {};
}

export function saveCustomFormUrl(sessionId: string, url: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      const current = getCustomFormUrls();
      current[sessionId] = url.trim();
      localStorage.setItem(STORAGE_KEY_CUSTOM_URLS, JSON.stringify(current));
    }
  } catch (e) {
    console.error('Error saving custom form URL:', e);
  }
}

export function getEffectiveFormUrl(session: AttendanceSessionConfig): string {
  const customUrls = getCustomFormUrls();
  return customUrls[session.id] || customUrls[session.name] || session.defaultFormUrl;
}
