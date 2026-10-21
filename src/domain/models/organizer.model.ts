export interface Organizer {
  identifier: string;
  dni?: string;
  fullName: string;
  role: string;
  area: string;
  sendCertificate: boolean;
  generationStatus?: string;
  drivePdfUrl?: string;
}

