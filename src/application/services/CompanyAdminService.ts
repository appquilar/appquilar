import type {
    CompanyAdminFilters,
    CompanyAdminRepository,
    PaginatedAdminCompaniesResult,
} from "@/domain/repositories/CompanyAdminRepository";

export class CompanyAdminService {
    constructor(private readonly companyAdminRepository: CompanyAdminRepository) {}

    async listCompanies(
        filters?: CompanyAdminFilters
    ): Promise<PaginatedAdminCompaniesResult> {
        return this.companyAdminRepository.listCompanies(filters);
    }
}
