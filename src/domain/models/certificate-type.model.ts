/**
 * Certificate type classification for Innovathon Mollendo 2026.
 */
export type CertificateType =
  | 'organizer'
  | 'volunteer'
  | 'area_director'
  | 'participant'
  | 'speaker'
  | 'sponsor';

/**
 * Raw sheet value: "DIRECTOR DE ÁREA"
 * Keep the literal role for display; compare using .toLowerCase().
 */
export const AREA_DIRECTOR_ROLE_KEY = 'director de área';

export type OrgEmissionType = 'organizer' | 'volunteer';

export const ORG_EMISSION_LABELS: Record<OrgEmissionType, string> = {
  organizer: 'Organizador',
  volunteer: 'Voluntario',
};
