import type { ProductListResponse } from "@/domain/repositories/ProductRepository";

export interface PublicCompanyProductsRepository {
  listByCompanySlug(slug: string, page: number, perPage: number): Promise<ProductListResponse>;
}
