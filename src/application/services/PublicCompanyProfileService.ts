import type { PublicCompanyProfile } from "@/domain/models/PublicCompanyProfile";
import type { PublicCompanyProfileRepository } from "@/domain/repositories/PublicCompanyProfileRepository";

export class PublicCompanyProfileService {
  constructor(
    private readonly repository: PublicCompanyProfileRepository
  ) {}

  async getBySlug(slug: string): Promise<PublicCompanyProfile> {
    return this.repository.getBySlug(slug);
  }
}
