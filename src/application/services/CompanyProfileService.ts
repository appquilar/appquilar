import type {
    CompanyProfile,
    UpdateCompanyProfileInput,
} from "@/domain/models/CompanyProfile";
import type { CompanyProfileRepository } from "@/domain/repositories/CompanyProfileRepository";

export class CompanyProfileService {
    constructor(
        private readonly repository: CompanyProfileRepository
    ) {
    }

    async getById(companyId: string): Promise<CompanyProfile> {
        return this.repository.getById(companyId);
    }

    async update(input: UpdateCompanyProfileInput): Promise<void> {
        await this.repository.update(input);
    }
}
