import type { PublicCompanyProfile } from "@/domain/models/PublicCompanyProfile";

export interface PublicCompanyProfileRepository {
  getBySlug(slug: string): Promise<PublicCompanyProfile>;
}
