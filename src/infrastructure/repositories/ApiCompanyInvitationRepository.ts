import { ApiClient } from "@/infrastructure/http/ApiClient";
import type { AcceptCompanyInvitationInput } from "@/domain/models/CompanyInvitation";
import type { CompanyInvitationRepository } from "@/domain/repositories/CompanyInvitationRepository";
import type { AuthSession } from "@/domain/models/AuthSession";
import { toAuthorizationHeader } from "@/domain/models/AuthSession";

export class ApiCompanyInvitationRepository implements CompanyInvitationRepository {
    constructor(
        private readonly apiClient: ApiClient,
        private readonly getSession: () => AuthSession | null
    ) {
    }

    async acceptInvitation(input: AcceptCompanyInvitationInput): Promise<void> {
        const payload: Record<string, string> = {};

        if (input.email) {
            payload.email = input.email;
        }

        if (input.password) {
            payload.password = input.password;
        }

        if (input.firstName) {
            payload.first_name = input.firstName;
        }

        if (input.lastName) {
            payload.last_name = input.lastName;
        }

        await this.apiClient.post<void>(
            `/api/companies/${encodeURIComponent(input.companyId)}/invitations/${encodeURIComponent(input.token)}/accept`,
            payload,
            {
                headers: this.authHeaders(),
                skipParseJson: true
            }
        );
    }

    private authHeaders(): Record<string, string> {
        const authHeader = toAuthorizationHeader(this.getSession());
        if (!authHeader) {
            return {};
        }

        return {
            Authorization: authHeader,
        };
    }
}
