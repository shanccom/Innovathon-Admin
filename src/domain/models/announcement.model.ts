export interface AnnouncementRecipient {
  id: string;
  dni: string;
  nombre: string;
  primerNombre: string;
  apellido: string;
  correo: string;
  equipo: string;
  rol: string;
  estado: string;
}

export interface RecipientFilter {
  equipo?: string;
  rol?: string;
  searchQuery?: string;
  soloValidos?: boolean;
}

export interface EmailTemplate {
  asunto: string;
  cuerpo: string;
  imagenBase64?: string;
  imagenTipo?: string;
  imagenNombre?: string;
  imagenTamanoBytes?: number;
}

export interface SpamWarning {
  id: string;
  tipo: 'danger' | 'warning' | 'info';
  mensaje: string;
  sugerencia: string;
}

export interface SpamEvaluation {
  score: number; // 0 to 100
  nivel: 'safe' | 'caution' | 'danger';
  advertencias: SpamWarning[];
}

export interface CampaignLogDetail {
  correo: string;
  nombre: string;
  estado: 'ENVIADO' | 'ERROR' | 'OMITIDO';
  error?: string;
  timestamp: string;
}

export interface AnnouncementCampaign {
  id: string;
  nombre: string;
  asunto: string;
  cuerpo: string;
  imagenAdjunta: boolean;
  totalDestinatarios: number;
  enviados: number;
  errores: number;
  omitidos: number;
  fecha: string;
  estado: 'completado' | 'parcial' | 'fallido' | 'prueba';
  detalles: CampaignLogDetail[];
}

export interface TestEmailResult {
  success: boolean;
  message: string;
  destinatario: string;
}

export interface CampaignSendProgress {
  current: number;
  total: number;
  ultimoCorreo: string;
  porcentaje: number;
  enviados: number;
  errores: number;
}
