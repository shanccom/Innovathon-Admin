export interface Participant {
  id: string;
  raw: Record<string, unknown>;
  dni: string;
  nombre: string;
  equipo: string;
  correo: string;
  celular: string;
  rol: string;
  estado: string;
}

export type SyncState = 'idle' | 'loading' | 'connected' | 'error';

export interface SyncStatus {
  state: SyncState;
  message: string;
  count: number;
  timestamp: number | null;
  errorType?: 'PERMISSION_DENIED' | 'FETCH_ERROR' | string;
}

export interface ParticipantFetchResult {
  success: boolean;
  data?: Participant[];
  count?: number;
  fromCache?: boolean;
  status: SyncStatus;
  error?: string;
  message?: string;
  spreadsheetUrl?: string;
}
