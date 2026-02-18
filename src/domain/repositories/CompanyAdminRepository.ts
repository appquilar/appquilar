import type { CompanyAdminSummary } from "@/domain/models/CompanyAdminSummary";

export interface CompanyAdminFilters {
    name?: string;
    page?: number;
    perPage?: number;
}

export interface PaginatedAdminCompaniesResult {
    companies: CompanyAdminSummary[];
    total: number;
    page: number;
}

export interface CompanyAdminRepository {
    listCompanies(filters?: CompanyAdminFilters): Promise<PaginatedAdminCompaniesResult>;
}
