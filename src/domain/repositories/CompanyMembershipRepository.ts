import type {
    CompanyUserMembership,
    CreateCompanyInput,
    InviteCompanyUserInput,
    RemoveCompanyUserInput,
    UpdateCompanyUserRoleInput,
} from "@/domain/models/CompanyMembership";

export interface CompanyMembershipRepository {
    createCompany(input: CreateCompanyInput): Promise<void>;

    listCompanyUsers(
        companyId: string,
        page?: number,
        perPage?: number
    ): Promise<CompanyUserMembership[]>;

    inviteCompanyUser(input: InviteCompanyUserInput): Promise<void>;

    updateCompanyUserRole(input: UpdateCompanyUserRoleInput): Promise<void>;

    removeCompanyUser(input: RemoveCompanyUserInput): Promise<void>;
}

