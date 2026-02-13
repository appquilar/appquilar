import type { AcceptCompanyInvitationInput } from "@/domain/models/CompanyInvitation";

export interface CompanyInvitationRepository {
    acceptInvitation(input: AcceptCompanyInvitationInput): Promise<void>;
}
