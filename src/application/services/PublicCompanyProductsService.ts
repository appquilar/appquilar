import type { ProductListResponse } from "@/domain/repositories/ProductRepository";
import type { PublicCompanyProductsRepository } from "@/domain/repositories/PublicCompanyProductsRepository";

export class PublicCompanyProductsService {
  constructor(
    private readonly repository: PublicCompanyProductsRepository
  ) {}

  async listByCompanySlug(slug: string, page: number, perPage: number): Promise<ProductListResponse> {
    return this.repository.listByCompanySlug(slug, page, perPage);
  }
}
