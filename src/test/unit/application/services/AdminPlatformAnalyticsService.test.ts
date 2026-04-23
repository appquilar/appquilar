import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AdminPlatformAnalyticsService } from "@/application/services/AdminPlatformAnalyticsService";
import type { Category } from "@/domain/models/Category";
import type { CompanyAdminSummary } from "@/domain/models/CompanyAdminSummary";
import type { CompanyEngagementStats } from "@/domain/models/CompanyEngagementStats";
import type { Product } from "@/domain/models/Product";
import type { UserEngagementStats } from "@/domain/models/UserEngagementStats";
import type { User } from "@/domain/models/User";
import { UserRole } from "@/domain/models/UserRole";
import type { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import type { CompanyAdminRepository } from "@/domain/repositories/CompanyAdminRepository";
import type { CompanyEngagementRepository } from "@/domain/repositories/CompanyEngagementRepository";
import type { ProductRepository } from "@/domain/repositories/ProductRepository";
import type { UserEngagementRepository } from "@/domain/repositories/UserEngagementRepository";
import type { UserRepository } from "@/domain/repositories/UserRepository";

const createCategoryRepositoryMock = (): CategoryRepository => ({
    getAllCategories: vi.fn(),
    getById: vi.fn(),
    getBySlug: vi.fn(),
    getBreadcrumbs: vi.fn(),
    getDynamicProperties: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
});

const createCompanyAdminRepositoryMock = (): CompanyAdminRepository => ({
    listCompanies: vi.fn(),
});

const createCompanyEngagementRepositoryMock = (): CompanyEngagementRepository => ({
    getCompanyStats: vi.fn(),
    trackProductView: vi.fn(),
});

const createProductRepositoryMock = (): ProductRepository => ({
    search: vi.fn(),
    getAllProducts: vi.fn(),
    getProductById: vi.fn(),
    getById: vi.fn(),
    getBySlug: vi.fn(),
    getProductsByCompanyId: vi.fn(),
    listByOwner: vi.fn(),
    listByOwnerPaginated: vi.fn(),
    getOwnerSummary: vi.fn(),
    getProductsByCategoryId: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    publishProduct: vi.fn(),
    calculateRentalCost: vi.fn(),
    checkAvailability: vi.fn(),
    getInventorySummary: vi.fn(),
    getInventoryAllocations: vi.fn(),
    getInventoryUnits: vi.fn(),
    updateInventoryUnit: vi.fn(),
    adjustInventory: vi.fn(),
});

const createUserEngagementRepositoryMock = (): UserEngagementRepository => ({
    getUserStats: vi.fn(),
});

const createUserRepositoryMock = (): UserRepository => ({
    getById: vi.fn(),
    update: vi.fn(),
    updateAddress: vi.fn(),
    getCurrentUser: vi.fn(),
    getAllUsers: vi.fn(),
});

const createCompany = (overrides: Partial<CompanyAdminSummary> = {}): CompanyAdminSummary => ({
    id: overrides.id ?? "company-1",
    ownerId: overrides.ownerId ?? "user-owner-1",
    name: overrides.name ?? "Acme Rentals",
    slug: overrides.slug ?? "acme-rentals",
    description: overrides.description ?? null,
    fiscalIdentifier: overrides.fiscalIdentifier ?? null,
    contactEmail: overrides.contactEmail ?? "ops@acme.test",
    planType: overrides.planType ?? "starter",
    subscriptionStatus: overrides.subscriptionStatus ?? "active",
    isFoundingAccount: overrides.isFoundingAccount ?? false,
});

const createUser = (overrides: Partial<User> = {}): User => ({
    id: overrides.id ?? "user-1",
    firstName: overrides.firstName ?? "Ada",
    lastName: overrides.lastName ?? "Lovelace",
    email: overrides.email ?? "ada@example.test",
    roles: overrides.roles ?? [UserRole.REGULAR_USER],
    address: overrides.address ?? null,
    location: overrides.location ?? null,
    companyId: overrides.companyId ?? null,
    companyName: overrides.companyName ?? null,
    companyRole: overrides.companyRole ?? null,
    isCompanyOwner: overrides.isCompanyOwner ?? null,
    companyContext: overrides.companyContext ?? null,
    planType: overrides.planType ?? "explorer",
    subscriptionStatus: overrides.subscriptionStatus ?? "active",
    productSlotLimit: overrides.productSlotLimit ?? null,
    capabilities: overrides.capabilities ?? null,
    entitlements: overrides.entitlements ?? null,
    status: overrides.status ?? "active",
    dateAdded: overrides.dateAdded ?? null,
    profilePictureId: overrides.profilePictureId ?? null,
});

const createProduct = (overrides: Partial<Product> = {}): Product => ({
    id: overrides.id ?? "product-1",
    internalId: overrides.internalId ?? "PRD-001",
    name: overrides.name ?? "Taladro Pro",
    slug: overrides.slug ?? "taladro-pro",
    description: overrides.description ?? "Producto demo",
    quantity: overrides.quantity ?? 1,
    isRentalEnabled: overrides.isRentalEnabled ?? true,
    imageUrl: overrides.imageUrl ?? "",
    thumbnailUrl: overrides.thumbnailUrl ?? "",
    publicationStatus: overrides.publicationStatus ?? "published",
    price: overrides.price ?? { daily: 25 },
    productType: overrides.productType ?? "rental",
    category: overrides.category ?? {
        id: "cat-1",
        name: "Herramientas",
        slug: "herramientas",
    },
    rating: overrides.rating ?? 0,
    reviewCount: overrides.reviewCount ?? 0,
    createdAt: overrides.createdAt,
    updatedAt: overrides.updatedAt,
    inventorySummary: overrides.inventorySummary ?? null,
    dynamicProperties: overrides.dynamicProperties,
    image_ids: overrides.image_ids ?? ["img-1"],
    circle: overrides.circle,
    ownerData: overrides.ownerData,
});

const createCompanyStats = (
    companyId: string,
    period: { from: string; to: string },
    overrides: Partial<CompanyEngagementStats> = {}
): CompanyEngagementStats => ({
    companyId,
    period,
    summary: overrides.summary ?? {
        totalViews: 120,
        uniqueVisitors: 80,
        repeatVisitors: 18,
        repeatVisitorRatio: 0.225,
        loggedViews: 70,
        anonymousViews: 50,
        messagesTotal: 18,
        messageThreads: 6,
        messageToRentalRatio: 0.2,
        averageFirstResponseMinutes: 45,
    },
    topLocations: overrides.topLocations ?? [],
    dailyViews: overrides.dailyViews ?? [
        { day: period.from, views: 20 },
        { day: period.to, views: 30 },
    ],
    dailyMessages: overrides.dailyMessages ?? [
        { day: period.from, messages: 2 },
        { day: period.to, messages: 4 },
    ],
    byProduct: overrides.byProduct ?? [
        {
            productId: "company-1-product-1",
            productName: "Taladro Pro",
            productSlug: "taladro-pro",
            productInternalId: "TLD-001",
            totalViews: 80,
            uniqueVisitors: 50,
            loggedViews: 45,
            anonymousViews: 35,
            messagesTotal: 10,
            messageThreads: 4,
            visitToMessageRatio: 0.125,
            messageToRentalRatio: 0.2,
        },
    ],
    opportunities: overrides.opportunities ?? {
        highInterestLowConversion: null,
    },
});

const createUserStats = (
    userId: string,
    period: { from: string; to: string },
    overrides: Partial<UserEngagementStats> = {}
): UserEngagementStats => ({
    userId,
    period,
    summary: overrides.summary ?? {
        totalViews: 60,
        uniqueVisitors: 40,
        messagesTotal: 9,
        messageThreads: 3,
    },
    dailyViews: overrides.dailyViews ?? [
        { day: period.from, views: 8 },
        { day: period.to, views: 12 },
    ],
    dailyMessages: overrides.dailyMessages ?? [
        { day: period.from, messages: 1 },
        { day: period.to, messages: 2 },
    ],
    byProduct: overrides.byProduct ?? [
        {
            productId: "user-1-product-1",
            productName: "Foco LED",
            productSlug: "foco-led",
            productInternalId: "FCO-001",
            totalViews: 30,
            uniqueVisitors: 18,
            messagesTotal: 4,
            messageThreads: 2,
        },
    ],
});

describe("AdminPlatformAnalyticsService", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-04-15T09:00:00.000Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it("aggregates platform analytics with strict unsupported blocks and deterministic insights", async () => {
        const companyAdminRepository = createCompanyAdminRepositoryMock();
        const userRepository = createUserRepositoryMock();
        const productRepository = createProductRepositoryMock();
        const companyEngagementRepository = createCompanyEngagementRepositoryMock();
        const userEngagementRepository = createUserEngagementRepositoryMock();
        const categoryRepository = createCategoryRepositoryMock();

        const companies = [
            createCompany({ id: "company-1", name: "Acme Rentals", planType: "starter" }),
            createCompany({ id: "company-2", name: "Dormant Tools", planType: "pro" }),
        ];
        const directUsers = [
            createUser({
                id: "user-1",
                email: "pro.user@appquilar.test",
                firstName: "Pro",
                lastName: "User",
                planType: "user_pro",
            }),
            createUser({
                id: "user-2",
                email: "explorer@appquilar.test",
                firstName: "Explorer",
                lastName: "User",
                planType: "explorer",
            }),
        ];
        const categories: Category[] = [
            {
                id: "cat-1",
                name: "Herramientas",
                slug: "herramientas",
            },
            {
                id: "cat-2",
                name: "Iluminación",
                slug: "iluminacion",
            },
        ];

        const companyOneProducts = Array.from({ length: 8 }, (_, index) =>
            createProduct({
                id: `company-1-product-${index + 1}`,
                internalId: `CMP-1-${index + 1}`,
                name: `Producto Acme ${index + 1}`,
                slug: `producto-acme-${index + 1}`,
                category: { id: "cat-1", name: "Herramientas", slug: "herramientas" },
                image_ids: index === 0 ? [] : ["img-1"],
                price: index === 1 ? { daily: 0, tiers: [] } : { daily: 25 },
            })
        );
        const companyTwoProducts = [
            createProduct({
                id: "company-2-product-1",
                internalId: "CMP-2-1",
                name: "Andamio Dormido",
                slug: "andamio-dormido",
                category: { id: "cat-1", name: "Herramientas", slug: "herramientas" },
            }),
        ];
        const userOneProducts = [
            createProduct({
                id: "user-1-product-1",
                internalId: "USR-1-1",
                name: "Foco LED",
                slug: "foco-led",
                category: { id: "cat-2", name: "Iluminación", slug: "iluminacion" },
            }),
            createProduct({
                id: "user-1-product-2",
                internalId: "USR-1-2",
                name: "Panel LED",
                slug: "panel-led",
                category: { id: "cat-2", name: "Iluminación", slug: "iluminacion" },
            }),
        ];
        const userTwoProducts = [
            createProduct({
                id: "user-2-product-1",
                internalId: "USR-2-1",
                name: "Generador Mini",
                slug: "generador-mini",
                category: { id: "cat-2", name: "Iluminación", slug: "iluminacion" },
            }),
            createProduct({
                id: "user-2-product-2",
                internalId: "USR-2-2",
                name: "Linterna Pro",
                slug: "linterna-pro",
                category: { id: "cat-2", name: "Iluminación", slug: "iluminacion" },
            }),
        ];

        vi.mocked(companyAdminRepository.listCompanies).mockResolvedValue({
            companies,
            total: companies.length,
            page: 1,
        });
        vi.mocked(userRepository.getAllUsers!).mockResolvedValue({
            users: directUsers,
            total: directUsers.length,
            page: 1,
            perPage: 50,
        });
        vi.mocked(categoryRepository.getAllCategories).mockResolvedValue({
            categories,
            total: categories.length,
            page: 1,
            perPage: 50,
        });

        vi.mocked(productRepository.listByOwnerPaginated).mockImplementation(async (ownerId) => {
            const map: Record<string, Product[]> = {
                "company-1": companyOneProducts,
                "company-2": companyTwoProducts,
                "user-1": userOneProducts,
                "user-2": userTwoProducts,
            };

            return {
                data: map[ownerId] ?? [],
                total: (map[ownerId] ?? []).length,
                page: 1,
                perPage: 50,
            };
        });

        const companyStatsMap = new Map<string, CompanyEngagementStats>([
            [
                "company-1:2026-04-09:2026-04-15",
                createCompanyStats("company-1", { from: "2026-04-09", to: "2026-04-15" }, {
                    summary: {
                        totalViews: 200,
                        uniqueVisitors: 120,
                        repeatVisitors: 32,
                        repeatVisitorRatio: 0.266,
                        loggedViews: 110,
                        anonymousViews: 90,
                        messagesTotal: 24,
                        messageThreads: 8,
                        messageToRentalRatio: 0.3,
                        averageFirstResponseMinutes: 45,
                    },
                    byProduct: [
                        {
                            productId: "company-1-product-1",
                            productName: "Producto Acme 1",
                            productSlug: "producto-acme-1",
                            productInternalId: "ACM-001",
                            totalViews: 70,
                            uniqueVisitors: 45,
                            loggedViews: 30,
                            anonymousViews: 40,
                            messagesTotal: 10,
                            messageThreads: 5,
                            visitToMessageRatio: 0.14,
                            messageToRentalRatio: 0.25,
                        },
                    ],
                }),
            ],
            [
                "company-1:2026-04-02:2026-04-08",
                createCompanyStats("company-1", { from: "2026-04-02", to: "2026-04-08" }, {
                    summary: {
                        totalViews: 90,
                        uniqueVisitors: 55,
                        repeatVisitors: 12,
                        repeatVisitorRatio: 0.22,
                        loggedViews: 48,
                        anonymousViews: 42,
                        messagesTotal: 6,
                        messageThreads: 2,
                        messageToRentalRatio: 0.1,
                        averageFirstResponseMinutes: 20,
                    },
                    byProduct: [
                        {
                            productId: "company-1-product-1",
                            productName: "Producto Acme 1",
                            productSlug: "producto-acme-1",
                            productInternalId: "ACM-001",
                            totalViews: 30,
                            uniqueVisitors: 20,
                            loggedViews: 16,
                            anonymousViews: 14,
                            messagesTotal: 4,
                            messageThreads: 1,
                            visitToMessageRatio: 0.13,
                            messageToRentalRatio: 0.1,
                        },
                    ],
                }),
            ],
            [
                "company-1:2026-03-17:2026-04-15",
                createCompanyStats("company-1", { from: "2026-03-17", to: "2026-04-15" }),
            ],
            [
                "company-2:2026-04-09:2026-04-15",
                createCompanyStats("company-2", { from: "2026-04-09", to: "2026-04-15" }, {
                    summary: {
                        totalViews: 0,
                        uniqueVisitors: 0,
                        repeatVisitors: 0,
                        repeatVisitorRatio: 0,
                        loggedViews: 0,
                        anonymousViews: 0,
                        messagesTotal: 0,
                        messageThreads: 0,
                        messageToRentalRatio: 0,
                        averageFirstResponseMinutes: null,
                    },
                    dailyViews: [],
                    dailyMessages: [],
                    byProduct: [],
                }),
            ],
            [
                "company-2:2026-04-02:2026-04-08",
                createCompanyStats("company-2", { from: "2026-04-02", to: "2026-04-08" }, {
                    summary: {
                        totalViews: 0,
                        uniqueVisitors: 0,
                        repeatVisitors: 0,
                        repeatVisitorRatio: 0,
                        loggedViews: 0,
                        anonymousViews: 0,
                        messagesTotal: 0,
                        messageThreads: 0,
                        messageToRentalRatio: 0,
                        averageFirstResponseMinutes: null,
                    },
                    dailyViews: [],
                    dailyMessages: [],
                    byProduct: [],
                }),
            ],
            [
                "company-2:2026-03-17:2026-04-15",
                createCompanyStats("company-2", { from: "2026-03-17", to: "2026-04-15" }, {
                    summary: {
                        totalViews: 0,
                        uniqueVisitors: 0,
                        repeatVisitors: 0,
                        repeatVisitorRatio: 0,
                        loggedViews: 0,
                        anonymousViews: 0,
                        messagesTotal: 0,
                        messageThreads: 0,
                        messageToRentalRatio: 0,
                        averageFirstResponseMinutes: null,
                    },
                    dailyViews: [],
                    dailyMessages: [],
                    byProduct: [],
                }),
            ],
        ]);

        vi.mocked(companyEngagementRepository.getCompanyStats).mockImplementation(async (companyId, period) => {
            const key = `${companyId}:${period?.from}:${period?.to}`;
            const stats = companyStatsMap.get(key);

            if (!stats) {
                throw new Error(`Missing company stats fixture for ${key}`);
            }

            return stats;
        });

        const userStatsMap = new Map<string, UserEngagementStats>([
            [
                "user-1:2026-04-09:2026-04-15",
                createUserStats("user-1", { from: "2026-04-09", to: "2026-04-15" }, {
                    summary: {
                        totalViews: 80,
                        uniqueVisitors: 48,
                        messagesTotal: 12,
                        messageThreads: 5,
                    },
                    byProduct: [
                        {
                            productId: "user-1-product-1",
                            productName: "Foco LED",
                            productSlug: "foco-led",
                            productInternalId: "FCO-001",
                            totalViews: 40,
                            uniqueVisitors: 25,
                            messagesTotal: 6,
                            messageThreads: 3,
                        },
                        {
                            productId: "user-1-product-2",
                            productName: "Panel LED",
                            productSlug: "panel-led",
                            productInternalId: "PNL-002",
                            totalViews: 20,
                            uniqueVisitors: 14,
                            messagesTotal: 4,
                            messageThreads: 2,
                        },
                    ],
                }),
            ],
            [
                "user-1:2026-04-02:2026-04-08",
                createUserStats("user-1", { from: "2026-04-02", to: "2026-04-08" }, {
                    summary: {
                        totalViews: 35,
                        uniqueVisitors: 20,
                        messagesTotal: 2,
                        messageThreads: 1,
                    },
                    byProduct: [
                        {
                            productId: "user-1-product-1",
                            productName: "Foco LED",
                            productSlug: "foco-led",
                            productInternalId: "FCO-001",
                            totalViews: 20,
                            uniqueVisitors: 12,
                            messagesTotal: 2,
                            messageThreads: 1,
                        },
                    ],
                }),
            ],
            [
                "user-2:2026-04-09:2026-04-15",
                createUserStats("user-2", { from: "2026-04-09", to: "2026-04-15" }, {
                    summary: {
                        totalViews: 30,
                        uniqueVisitors: 18,
                        messagesTotal: 3,
                        messageThreads: 1,
                    },
                    byProduct: [
                        {
                            productId: "user-2-product-1",
                            productName: "Generador Mini",
                            productSlug: "generador-mini",
                            productInternalId: "GEN-001",
                            totalViews: 10,
                            uniqueVisitors: 7,
                            messagesTotal: 2,
                            messageThreads: 1,
                        },
                    ],
                }),
            ],
            [
                "user-2:2026-04-02:2026-04-08",
                createUserStats("user-2", { from: "2026-04-02", to: "2026-04-08" }, {
                    summary: {
                        totalViews: 0,
                        uniqueVisitors: 0,
                        messagesTotal: 0,
                        messageThreads: 0,
                    },
                    dailyViews: [],
                    dailyMessages: [],
                    byProduct: [],
                }),
            ],
        ]);

        vi.mocked(userEngagementRepository.getUserStats).mockImplementation(async (userId, period) => {
            const key = `${userId}:${period?.from}:${period?.to}`;
            const stats = userStatsMap.get(key);

            if (!stats) {
                throw new Error(`Missing user stats fixture for ${key}`);
            }

            return stats;
        });

        const service = new AdminPlatformAnalyticsService(
            companyAdminRepository,
            userRepository,
            productRepository,
            companyEngagementRepository,
            userEngagementRepository,
            categoryRepository
        );

        const result = await service.getAdminPlatformAnalytics({
            from: "2026-04-09",
            to: "2026-04-15",
        });

        expect(result.homepage.executiveSummary.cards.find((card) => card.key === "active_companies_7d")?.value).toBe(1);
        expect(result.overview.cards.find((card) => card.key === "conversation_threads")?.value).toBe(14);
        expect(result.overview.cards.find((card) => card.key === "paid_plans_active")?.value).toBe(2);
        expect(result.operations.cards.find((card) => card.key === "response_rate")?.availability?.available).toBe(false);
        expect(result.marketplace.categories[0]?.categoryName).toBe("Iluminación");
        expect(result.marketplace.unsupportedSections).toHaveLength(3);
        expect(result.monetization.upgradeCandidates.some((item) => item.title === "Acme Rentals")).toBe(true);
        expect(result.monetization.nearLimitAccounts.some((item) => item.ownerName === "Acme Rentals")).toBe(true);
        expect(result.qualityRisk.cards.find((card) => card.key === "products_without_image")?.value).toBe(1);
        expect(result.qualityRisk.productsWithoutPrice).toHaveLength(1);
        expect(result.qualityRisk.dormantCompanies.some((item) => item.title === "Dormant Tools")).toBe(true);
        expect(result.homepage.insights.some((insight) => insight.key === "average-first-response-worsened")).toBe(true);
        expect(result.retention.availability.available).toBe(false);
    });

    it("keeps deltas safe when the platform has no supported activity", async () => {
        const companyAdminRepository = createCompanyAdminRepositoryMock();
        const userRepository = createUserRepositoryMock();
        const productRepository = createProductRepositoryMock();
        const companyEngagementRepository = createCompanyEngagementRepositoryMock();
        const userEngagementRepository = createUserEngagementRepositoryMock();
        const categoryRepository = createCategoryRepositoryMock();

        vi.mocked(companyAdminRepository.listCompanies).mockResolvedValue({
            companies: [],
            total: 0,
            page: 1,
        });
        vi.mocked(userRepository.getAllUsers!).mockResolvedValue({
            users: [],
            total: 0,
            page: 1,
            perPage: 50,
        });
        vi.mocked(categoryRepository.getAllCategories).mockResolvedValue({
            categories: [],
            total: 0,
            page: 1,
            perPage: 50,
        });

        const service = new AdminPlatformAnalyticsService(
            companyAdminRepository,
            userRepository,
            productRepository,
            companyEngagementRepository,
            userEngagementRepository,
            categoryRepository
        );

        const result = await service.getAdminPlatformAnalytics({
            from: "2026-04-09",
            to: "2026-04-15",
        });

        const conversationCard = result.homepage.executiveSummary.cards.find(
            (card) => card.key === "conversation_threads_home"
        );

        expect(conversationCard?.value).toBe(0);
        expect(conversationCard?.delta.kind).toBe("neutral");
        expect(conversationCard?.delta.percentageChange).toBe(0);
        expect(result.marketplace.categories).toHaveLength(0);
        expect(result.monetization.nearLimitAccounts).toHaveLength(0);
        expect(result.qualityRisk.actionItems).toHaveLength(0);
    });

    it("adds partial-data insights when product and stats loading fail, while still paginating", async () => {
        const companyAdminRepository = createCompanyAdminRepositoryMock();
        const userRepository = createUserRepositoryMock();
        const productRepository = createProductRepositoryMock();
        const companyEngagementRepository = createCompanyEngagementRepositoryMock();
        const userEngagementRepository = createUserEngagementRepositoryMock();
        const categoryRepository = createCategoryRepositoryMock();

        vi.mocked(companyAdminRepository.listCompanies)
            .mockResolvedValueOnce({
                companies: [createCompany({ id: "company-1", name: "Acme Rentals" })],
                total: 2,
                page: 1,
            })
            .mockResolvedValueOnce({
                companies: [createCompany({ id: "company-2", name: "Broken Rentals" })],
                total: 2,
                page: 2,
            });
        vi.mocked(userRepository.getAllUsers!).mockResolvedValue({
            users: [
                createUser({
                    id: "user-10",
                    email: "company.member@appquilar.test",
                    companyId: "company-1",
                }),
                createUser({
                    id: "user-11",
                    email: "solo@appquilar.test",
                    planType: "explorer",
                }),
            ],
            total: 2,
            page: 1,
            perPage: 50,
        });
        vi.mocked(categoryRepository.getAllCategories)
            .mockResolvedValueOnce({
                categories: [{ id: "cat-1", name: "Herramientas", slug: "herramientas" }],
                total: 2,
                page: 1,
                perPage: 1,
            })
            .mockResolvedValueOnce({
                categories: [{ id: "cat-2", name: "Luces", slug: "luces" }],
                total: 2,
                page: 2,
                perPage: 1,
            });

        vi.mocked(productRepository.listByOwnerPaginated).mockImplementation(async (ownerId, ownerType, page) => {
            if (ownerId === "company-2") {
                throw new Error("cannot load company-2 products");
            }

            if (ownerId === "company-1" && page === 1) {
                return {
                    data: [
                        createProduct({
                            id: "company-1-product-1",
                            name: "Taladro Premium",
                            slug: "taladro-premium",
                        }),
                    ],
                    total: 2,
                    page: 1,
                    perPage: 50,
                };
            }

            if (ownerId === "company-1" && page === 2) {
                return {
                    data: [],
                    total: 2,
                    page: 2,
                    perPage: 50,
                };
            }

            if (ownerId === "user-11") {
                return {
                    data: [],
                    total: 0,
                    page: 1,
                    perPage: 50,
                };
            }

            return {
                data: [],
                total: 0,
                page: 1,
                perPage: 50,
            };
        });

        vi.mocked(companyEngagementRepository.getCompanyStats).mockImplementation(async (companyId, period) => {
            if (companyId === "company-2") {
                throw new Error("stats unavailable");
            }

            return createCompanyStats(companyId, {
                from: period?.from ?? "2026-04-09",
                to: period?.to ?? "2026-04-15",
            });
        });
        vi.mocked(userEngagementRepository.getUserStats).mockImplementation(async (userId, period) =>
            createUserStats(userId, {
                from: period?.from ?? "2026-04-09",
                to: period?.to ?? "2026-04-15",
            })
        );

        const service = new AdminPlatformAnalyticsService(
            companyAdminRepository,
            userRepository,
            productRepository,
            companyEngagementRepository,
            userEngagementRepository,
            categoryRepository
        );

        const result = await service.getAdminPlatformAnalytics({
            from: "2026-04-09",
            to: "2026-04-15",
        });

        expect(companyAdminRepository.listCompanies).toHaveBeenCalledTimes(2);
        expect(categoryRepository.getAllCategories).toHaveBeenCalledTimes(2);
        expect(productRepository.listByOwnerPaginated).toHaveBeenCalledWith("company-1", "company", 2, 50);
        expect(result.homepage.insights).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    key: "partial-platform-analytics-data",
                    description: expect.stringContaining("Broken Rentals"),
                }),
            ])
        );
        expect(result.overview.cards.find((card) => card.key === "active_companies_period")?.value).toBe(1);
        expect(result.marketplace.categories.some((category) => category.categoryName === "Herramientas")).toBe(true);
    });
});
