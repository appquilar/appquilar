export type CompanyUserRole = "ROLE_ADMIN" | "ROLE_CONTRIBUTOR";

export type CompanyUserStatus = "ACCEPTED" | "PENDING" | "EXPIRED";

export interface CompanyUserMembership {
    companyId: string;
    userId: string | null;
    email: string;
    role: CompanyUserRole;
    status: CompanyUserStatus;
}

export interface CreateCompanyInput {
    companyId: string;
    ownerId: string;
    name: string;
    description?: string | null;
    fiscalIdentifier?: string | null;
    contactEmail?: string | null;
    phoneNumber?: {
        countryCode: string;
        prefix: string;
        number: string;
    } | null;
    address?: {
        street: string;
        street2?: string | null;
        city: string;
        postalCode: string;
        state: string;
        country: string;
    } | null;
    location?: {
        latitude: number;
        longitude: number;
    } | null;
}

export interface InviteCompanyUserInput {
    companyId: string;
    email: string;
    role: CompanyUserRole;
}

export interface UpdateCompanyUserRoleInput {
    companyId: string;
    userId: string;
    role: CompanyUserRole;
}

export interface RemoveCompanyUserInput {
    companyId: string;
    userId: string;
}
