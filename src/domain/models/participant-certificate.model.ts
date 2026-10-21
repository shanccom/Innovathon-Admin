export interface ParticipantCertificate {
  identifier: string; // dni or code
  dni?: string;
  fullName: string;
  role: string; // role or category (e.g. Participante, Líder de equipo)
  team: string; // team name
  email: string;
  sendCertificate: boolean;
  generationStatus?: string;
  drivePdfUrl?: string;
}
