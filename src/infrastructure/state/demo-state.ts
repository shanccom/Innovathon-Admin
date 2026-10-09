import { ModuleInfo, StatItem, UserProfile } from '../../domain/models/stats.model';

export const DEMO_USER: UserProfile = {
  name: 'Comité Organizador',
  role: 'Administrador (Demo)',
  avatarInitial: 'IM',
  event: 'Innovathon Mollendo 2026',
};

export const DEMO_STATS: StatItem[] = [
  {
    id: 'participants',
    title: 'Participantes registrados',
    value: '—',
    note: 'Pendiente conexión hoja «Registros»',
    isDemo: true,
    icon: 'users',
  },
  {
    id: 'attendance',
    title: 'Asistencias registradas',
    value: '—',
    note: 'Pendiente conexión hoja «Asistencias»',
    isDemo: true,
    icon: 'checkCircle',
  },
  {
    id: 'certificates',
    title: 'Certificados gestionados',
    value: '—',
    note: 'Integración Google Drive / Docs',
    isDemo: true,
    icon: 'fileText',
  },
  {
    id: 'announcements',
    title: 'Comunicados enviados',
    value: '—',
    note: 'Integración Gmail API',
    isDemo: true,
    icon: 'send',
  },
];

export const MODULES_INFO: ModuleInfo[] = [
  {
    id: 'asistencias',
    path: '/asistencias',
    title: 'Control de asistencia',
    icon: 'attendance',
    description: 'Registra la asistencia de los participantes y consulta su historial por sesión.',
    actionText: 'Ir a asistencias',
  },
  {
    id: 'certificados',
    path: '/certificados',
    title: 'Gestión de certificados',
    icon: 'certificates',
    description: 'Gestiona la generación, firma, recepción y entrega de certificados.',
    actionText: 'Ir a certificados',
  },
  {
    id: 'comunicados',
    path: '/comunicados',
    title: 'Gestión de comunicados',
    icon: 'announcements',
    description: 'Prepara comunicados para los participantes y consulta el historial de envíos.',
    actionText: 'Ir a comunicados',
  },
];
