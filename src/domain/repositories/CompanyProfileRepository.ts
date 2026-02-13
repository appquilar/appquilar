import type {
    CompanyProfile,
    UpdateCompanyProfileInput,
} from "@/domain/models/CompanyProfile";

export interface CompanyProfileRepository {
    getById(companyId: string): Promise<CompanyProfile>;
    update(input: UpdateCompanyProfileInput): Promise<void>;
}
