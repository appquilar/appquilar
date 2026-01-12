import { Product, ProductFormData } from '@/domain/models/Product';
import { ProductRepository, ProductSearchCriteria, ProductListResponse } from '@/domain/repositories/ProductRepository';
import { ApiClient } from '@/infrastructure/http/ApiClient';
import { AuthSession } from '@/domain/models/AuthSession';

export class ApiProductRepository implements ProductRepository {
    private client: ApiClient;
    private getSession: () => AuthSession | null;
    private baseUrl: string;

    constructor(client: ApiClient, getSession: () => AuthSession | null) {
        this.client = client;
        this.getSession = getSession;
        this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    }

    private getAuthHeaders(): Record<string, string> {
        const session = this.getSession();
        if (session?.token) {
            return { Authorization: `Bearer ${session.token}` };
        }
        return {};
    }

    async search(criteria: ProductSearchCriteria): Promise<ProductListResponse> {
        const queryParams = new URLSearchParams();
        if (criteria.text) queryParams.append('text', criteria.text);
        if (criteria.page) queryParams.append('page', criteria.page.toString());
        if (criteria.per_page) queryParams.append('per_page', criteria.per_page.toString());
        if (criteria.categories?.length) {
            criteria.categories.forEach(c => queryParams.append('categories[]', c));
        }

        try {
            const response = await this.client.get<{ data: any[], total: number, page: number }>(
                `/api/products/search?${queryParams.toString()}`
            );

            return {
                data: (response.data || []).map(item => this.mapToDomain(item)),
                total: response.total || 0,
                page: response.page || 1
            };
        } catch (error) {
            console.error('Search failed', error);
            return { data: [], total: 0, page: 1 };
        }
    }

    async getAllProducts(): Promise<Product[]> {
        const result = await this.search({ page: 1, per_page: 50 });
        return result.data;
    }

    async getById(id: string): Promise<Product | null> {
        try {
            const response = await this.client.get<any>(`/api/products/${id}`);
            return this.mapToDomain(response);
        } catch (error) {
            console.error(`Error fetching product ${id}`, error);
            return null;
        }
    }

    async getProductById(id: string): Promise<Product | null> {
        return this.getById(id);
    }

    async getBySlug(slug: string): Promise<Product | null> {
        try {
            const response = await this.client.get<any>(`/api/products/${slug}`);
            return this.mapToDomain(response);
        } catch (error) {
            console.error(`Error fetching product slug ${slug}`, error);
            return null;
        }
    }

    async getProductsByCompanyId(companyId: string): Promise<Product[]> {
        try {
            const response = await this.client.get<any>(`/api/companies/${companyId}/products`);
            // Handle different response structures gracefully
            let items = [];
            if (response && Array.isArray(response.data)) {
                items = response.data;
            } else if (Array.isArray(response)) {
                items = response;
            }
            return items.map((item: any) => this.mapToDomain(item));
        } catch (error) {
            console.error(`Error fetching company products`, error);
            return [];
        }
    }

    async listByOwner(ownerId: string): Promise<Product[]> {
        return this.getProductsByCompanyId(ownerId);
    }

    async getProductsByCategoryId(categoryId: string): Promise<Product[]> {
        try {
            const response = await this.client.get<{ data: any[] }>(`/api/categories/${categoryId}/products`);
            return (response.data || []).map(item => this.mapToDomain(item));
        } catch (error) {
            console.error(`Error fetching category products`, error);
            return [];
        }
    }

    async createProduct(data: ProductFormData): Promise<Product> {
        const dto = this.mapToDto(data);

        // Safety check: ensure ID exists
        if (!dto.product_id) {
            dto.product_id = crypto.randomUUID();
        }

        const response = await this.client.post<any>(
            '/api/products',
            dto,
            { headers: this.getAuthHeaders() }
        );
        return this.mapToDomain(response);
    }

    async updateProduct(id: string, data: ProductFormData): Promise<Product> {
        const dto = this.mapToDto(data);

        await this.client.patch(
            `/api/products/${id}`,
            dto,
            { headers: this.getAuthHeaders() }
        );

        const updated = await this.getById(id);
        if (!updated) throw new Error('Failed to retrieve updated product');
        return updated;
    }

    async deleteProduct(id: string): Promise<boolean> {
        try {
            await this.client.patch(
                `/api/products/${id}/archive`,
                {},
                { headers: this.getAuthHeaders() }
            );
            return true;
        } catch (error) {
            console.error('Error deleting product', error);
            return false;
        }
    }

    private mapToDomain(apiData: any): Product {
        const primaryImageId = apiData.image_ids?.[0];

        return {
            id: apiData.id || apiData.product_id,
            internalId: apiData.internal_id || '',
            name: apiData.name || '',
            slug: apiData.slug || '',
            description: apiData.description || '',
            imageUrl: primaryImageId ? `${this.baseUrl}/api/media/images/${primaryImageId}/MEDIUM` : '',
            thumbnailUrl: primaryImageId ? `${this.baseUrl}/api/media/images/${primaryImageId}/THUMBNAIL` : '',

            price: {
                daily: (apiData.tiers?.[0]?.price_per_day?.amount || 0) / 100,
                deposit: (apiData.deposit?.amount || 0) / 100,
                tiers: apiData.tiers?.map((t: any) => ({
                    daysFrom: t.days_from,
                    daysTo: t.days_to,
                    pricePerDay: (t.price_per_day?.amount || 0) / 100
                })) || []
            },
            isRentable: true,
            isForSale: false,
            productType: 'rental',

            company: {
                id: apiData.company_id || '',
                name: apiData.company_name || '',
                slug: apiData.company_slug || ''
            },
            category: {
                id: apiData.category_id || '',
                name: apiData.category_name || '',
                slug: apiData.category_slug || ''
            },

            rating: apiData.rating || 0,
            reviewCount: apiData.review_count || 0,
            createdAt: apiData.created_at,
            updatedAt: apiData.updated_at
        };
    }

    private mapToDto(data: ProductFormData): any {
        // Cast to any to access the ID that we merged in the FE
        const product = data as any;

        return {
            product_id: product.id, // Use the UUID we generated in FE
            name: data.name,
            slug: data.slug,
            // API requires internal_id. Use field, or fallback to slug or ID to prevent "not_blank" error
            internal_id: data.internalId || data.slug || product.id,
            description: data.description,
            quantity: 1,
            company_id: product.company?.id || data.companyId,
            category_id: product.category?.id || data.categoryId,
            image_ids: product.images?.map((img: any) => img.id).filter(Boolean) || [],

            deposit: {
                amount: Math.round((data.price.deposit || 0) * 100),
                currency: 'EUR'
            },

            tiers: (data.price.tiers || []).map(tier => ({
                price_per_day: { amount: Math.round(tier.pricePerDay * 100), currency: 'EUR' },
                days_from: tier.daysFrom,
                days_to: tier.daysTo
            }))
        };
    }
}