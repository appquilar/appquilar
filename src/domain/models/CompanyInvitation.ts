export interface AcceptCompanyInvitationInput {
    companyId: string;
    token: string;
    email?: string | null;
    password?: string | null;
    firstName?: string | null;
    lastName?: string | null;
}
