export interface Organizer {
  identifier: string;
  dni?: string;
  fullName: string;
  role: string;
  templateType?: 'organizer' | 'volunteer' | '';
  area: string;
  sendCertificate: boolean;
  generationStatus?: string;
  drivePdfUrl?: string;
}
