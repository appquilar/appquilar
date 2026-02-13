import type {
    CreateCompanyInput,
    InviteCompanyUserInput,
    RemoveCompanyUserInput,
    UpdateCompanyUserRoleInput,
} from "@/domain/models/CompanyMembership";
import type { CompanyUserMembership } from "@/domain/models/CompanyMembership";
import type { CompanyMembershipRepository } from "@/domain/repositories/CompanyMembershipRepository";

export class CompanyMembershipService {
    constructor(
        private readonly repository: CompanyMembershipRepository
    ) {
    }

    async createCompany(input: CreateCompanyInput): Promise<void> {
        await this.repository.createCompany(input);
    }

    async listCompanyUsers(
        companyId: string,
        page = 1,
        perPage = 50
    ): Promise<CompanyUserMembership[]> {
        return this.repository.listCompanyUsers(companyId, page, perPage);
    }

    async inviteCompanyUser(input: InviteCompanyUserInput): Promise<void> {
        await this.repository.inviteCompanyUser(input);
    }

    async updateCompanyUserRole(input: UpdateCompanyUserRoleInput): Promise<void> {
        await this.repository.updateCompanyUserRole(input);
    }

    async removeCompanyUser(input: RemoveCompanyUserInput): Promise<void> {
        await this.repository.removeCompanyUser(input);
    }
}

