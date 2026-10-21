import { Organizer } from '../../domain/models/organizer.model';
import { OrganizerRepository } from '../../domain/repositories/organizer.repository';
import { appsScriptOrganizerRepository } from '../../infrastructure/repositories/apps-script-organizer.repository';

export class GetOrganizersUseCase {
  constructor(private readonly repository: OrganizerRepository = appsScriptOrganizerRepository) {}

  execute(): Promise<Organizer[]> {
    return this.repository.getOrganizers();
  }
}

export const getOrganizersUseCase = new GetOrganizersUseCase();
