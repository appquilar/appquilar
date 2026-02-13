import type { AcceptCompanyInvitationInput } from "@/domain/models/CompanyInvitation";
import type { CompanyInvitationRepository } from "@/domain/repositories/CompanyInvitationRepository";

export class CompanyInvitationService {
    constructor(
        private readonly repository: CompanyInvitationRepository
    ) {
    }

    async acceptInvitation(input: AcceptCompanyInvitationInput): Promise<void> {
        await this.repository.acceptInvitation(input);
    }
}
