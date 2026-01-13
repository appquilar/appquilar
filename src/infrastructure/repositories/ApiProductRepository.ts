import { Product, ProductFormData, PublicationStatusType } from '@/domain/models/Product';
import { ProductRepository, ProductSearchCriteria, ProductListResponse, ProductFilters } from '@/domain/repositories/ProductRepository';
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

            const payload = (response as any).data && (response as any).success !== undefined
                ? (response as any).data
                : response;

            const items = Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []);

            return {
                data: items.map((item: any) => this.mapToDomain(item)),
                total: payload.total || items.length,
                page: payload.page || 1
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
            const response = await this.client.get<any>(
                `/api/products/${id}`,
                { headers: this.getAuthHeaders() }
            );
            const data = (response as any).data ? (response as any).data : response;
            return this.mapToDomain(data);
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
            const data = (response as any).data ? (response as any).data : response;
            return this.mapToDomain(data);
        } catch (error) {
            console.error(`Error fetching product slug ${slug}`, error);
            return null;
        }
    }

    async getProductsByCompanyId(companyId: string): Promise<Product[]> {
        const result = await this.listByOwnerPaginated(companyId, 'company', 1, 100);
        return result.data;
    }

    async listByOwner(ownerId: string): Promise<Product[]> {
        const result = await this.listByOwnerPaginated(ownerId, 'company', 1, 100);
        return result.data;
    }

    async listByOwnerPaginated(
        ownerId: string,
        ownerType: 'company' | 'user',
        page: number,
        perPage: number,
        filters?: ProductFilters
    ): Promise<ProductListResponse> {
        try {
            const endpoint = ownerType === 'company'
                ? `/api/companies/${ownerId}/products`
                : `/api/users/${ownerId}/products`;

            const queryParams = new URLSearchParams();
            queryParams.append('page', page.toString());
            queryParams.append('per_page', perPage.toString());

            if (filters?.name) queryParams.append('name', filters.name);
            if (filters?.id) queryParams.append('id', filters.id);
            if (filters?.internalId) queryParams.append('internalId', filters.internalId);
            if (filters?.categoryId) queryParams.append('categoryId', filters.categoryId);

            const response = await this.client.get<any>(`${endpoint}?${queryParams.toString()}`, {
                headers: this.getAuthHeaders()
            });

            let items: any[] = [];
            let total = 0;
            let currentPage = 1;

            if (response?.data?.data && Array.isArray(response.data.data)) {
                items = response.data.data;
                total = response.data.total ?? items.length;
                currentPage = response.data.page ?? 1;
            }
            else if (response?.data && Array.isArray(response.data)) {
                items = response.data;
                total = response.total ?? items.length;
                currentPage = response.page ?? 1;
            }
            else if (Array.isArray(response)) {
                items = response;
                total = items.length;
            }

            return {
                data: items.map((item: any) => this.mapToDomain(item)),
                total: total,
                page: currentPage
            };
        } catch (error) {
            console.error(`Error listing products for owner ${ownerId}`, error);
            return { data: [], total: 0, page: 1 };
        }
    }

    async getProductsByCategoryId(categoryId: string): Promise<Product[]> {
        try {
            const response = await this.client.get<{ data: any[] }>(`/api/categories/${categoryId}/products`);
            const data = (response as any).data && Array.isArray((response as any).data)
                ? (response as any).data
                : ((response as any).data?.data || []);

            return data.map((item: any) => this.mapToDomain(item));
        } catch (error) {
            console.error(`Error fetching category products`, error);
            return [];
        }
    }

    async createProduct(data: ProductFormData): Promise<Product> {
        const dto = this.mapToDto(data);

        if (!dto.product_id) {
            dto.product_id = crypto.randomUUID();
        }

        const response = await this.client.post<any>(
            '/api/products',
            dto,
            { headers: this.getAuthHeaders() }
        );

        const responseData = (response as any).data ? (response as any).data : response;
        return this.mapToDomain(responseData);
    }

    async updateProduct(id: string, data: ProductFormData): Promise<Product> {
        const dto = this.mapToDto(data);

        // 1. Update basic data
        await this.client.patch(
            `/api/products/${id}`,
            dto,
            { headers: this.getAuthHeaders() }
        );

        // 2. Handle Status Transition
        if (data.publicationStatus) {
            try {
                let statusEndpoint = '';
                if (data.publicationStatus === 'published') {
                    statusEndpoint = `/api/products/${id}/publish`;
                } else if (data.publicationStatus === 'draft') {
                    statusEndpoint = `/api/products/${id}/unpublish`;
                } else if (data.publicationStatus === 'archived') {
                    statusEndpoint = `/api/products/${id}/archive`;
                }

                if (statusEndpoint) {
                    await this.client.patch(statusEndpoint, {}, { headers: this.getAuthHeaders() });
                }
            } catch (statusError) {
                console.error("Failed to update product status", statusError);
            }
        }

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
        // Safe extraction of image_ids
        const imageIds = Array.isArray(apiData.image_ids) ? apiData.image_ids : [];
        const primaryImageId = imageIds[0];

        // Safe extraction of status
        let status: PublicationStatusType = 'draft';
        if (apiData.publication_status && typeof apiData.publication_status === 'object') {
            status = apiData.publication_status.status || 'draft';
        } else if (typeof apiData.status === 'string') {
            status = apiData.status as PublicationStatusType;
        }

        return {
            id: apiData.id || apiData.product_id,
            internalId: apiData.internal_id || '',
            name: apiData.name || '',
            slug: apiData.slug || '',
            description: apiData.description || '',
            imageUrl: primaryImageId ? `${this.baseUrl}/api/media/images/${primaryImageId}/MEDIUM` : '',
            thumbnailUrl: primaryImageId ? `${this.baseUrl}/api/media/images/${primaryImageId}/THUMBNAIL` : '',

            image_ids: imageIds, // Store all IDs

            publicationStatus: status,

            price: {
                daily: (apiData.tiers?.[0]?.price_per_day?.amount || 0) / 100,
                deposit: (apiData.deposit?.amount || 0) / 100,
                tiers: Array.isArray(apiData.tiers) ? apiData.tiers.map((t: any) => ({
                    daysFrom: t.days_from,
                    daysTo: t.days_to,
                    pricePerDay: (t.price_per_day?.amount || 0) / 100
                })) : []
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
        const product = data as any;

        return {
            product_id: product.id,
            name: data.name,
            slug: data.slug,
            internal_id: data.internalId || data.slug || product.id,
            description: data.description,
            quantity: 1,
            company_id: product.company?.id || data.companyId,
            category_id: product.category?.id || data.categoryId,
            image_ids: product.images?.map((img: any) => img.id).filter(Boolean) || [],

            // deposit, tiers etc...
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