import { describe, expect, it, vi } from "vitest";

import { CompanyAdvancedStatsService } from "@/application/services/CompanyAdvancedStatsService";
import type { CompanyEngagementStats } from "@/domain/models/CompanyEngagementStats";
import type { Product } from "@/domain/models/Product";
import type { CompanyEngagementRepository } from "@/domain/repositories/CompanyEngagementRepository";
import type { ProductRepository } from "@/domain/repositories/ProductRepository";

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
    category: overrides.category ?? {
        id: "cat-1",
        name: "Herramientas",
        slug: "herramientas",
    },
    rating: overrides.rating ?? 0,
    reviewCount: overrides.reviewCount ?? 0,
});

const createCompanyStats = (
    overrides: Partial<CompanyEngagementStats> = {}
): CompanyEngagementStats => ({
    companyId: overrides.companyId ?? "company-1",
    period: overrides.period ?? { from: "2026-04-01", to: "2026-04-07" },
    summary: overrides.summary ?? {
        totalViews: 200,
        uniqueVisitors: 120,
        repeatVisitors: 30,
        repeatVisitorRatio: 0.25,
        loggedViews: 80,
        anonymousViews: 120,
        messagesTotal: 40,
        messageThreads: 30,
        messageToRentalRatio: 0.4,
        averageFirstResponseMinutes: 150,
    },
    topLocations: overrides.topLocations ?? [],
    dailyViews: overrides.dailyViews ?? [],
    dailyMessages: overrides.dailyMessages ?? [],
    byProduct: overrides.byProduct ?? [
        {
            productId: "product-1",
            productName: "Taladro Pro",
            productSlug: "taladro-pro",
            productInternalId: "TLD-001",
            totalViews: 120,
            uniqueVisitors: 90,
            loggedViews: 60,
            anonymousViews: 60,
            messagesTotal: 8,
            messageThreads: 5,
            visitToMessageRatio: 0.0667,
            messageToRentalRatio: 0.15,
        },
        {
            productId: "product-2",
            productName: "Foco LED",
            productSlug: "foco-led",
            productInternalId: "FCO-002",
            totalViews: 20,
            uniqueVisitors: 10,
            loggedViews: 8,
            anonymousViews: 12,
            messagesTotal: 6,
            messageThreads: 5,
            visitToMessageRatio: 0.25,
            messageToRentalRatio: 0.6,
        },
    ],
    opportunities: overrides.opportunities ?? {
        highInterestLowConversion: {
            productId: "product-1",
            productName: "Taladro Pro",
            productSlug: "taladro-pro",
            productInternalId: "TLD-001",
            totalViews: 120,
            uniqueVisitors: 90,
            loggedViews: 60,
            anonymousViews: 60,
            messagesTotal: 8,
            messageThreads: 5,
            visitToMessageRatio: 0.0667,
            messageToRentalRatio: 0.15,
        },
    },
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

describe("CompanyAdvancedStatsService", () => {
    it("builds funnel, premium KPIs and deterministic insights from current and previous stats", async () => {
        const engagementRepository = createCompanyEngagementRepositoryMock();
        const productRepository = createProductRepositoryMock();

        const currentStats = createCompanyStats();
        const previousStats = createCompanyStats({
            period: { from: "2026-03-25", to: "2026-03-31" },
            summary: {
                totalViews: 100,
                uniqueVisitors: 60,
                repeatVisitors: 15,
                repeatVisitorRatio: 0.2,
                loggedViews: 35,
                anonymousViews: 65,
                messagesTotal: 10,
                messageThreads: 10,
                messageToRentalRatio: 0,
                averageFirstResponseMinutes: 90,
            },
            byProduct: [
                {
                    productId: "product-1",
                    productName: "Taladro Pro",
                    productSlug: "taladro-pro",
                    productInternalId: "TLD-001",
                    totalViews: 80,
                    uniqueVisitors: 50,
                    loggedViews: 40,
                    anonymousViews: 40,
                    messagesTotal: 10,
                    messageThreads: 8,
                    visitToMessageRatio: 0.125,
                    messageToRentalRatio: 0.2,
                },
                {
                    productId: "product-2",
                    productName: "Foco LED",
                    productSlug: "foco-led",
                    productInternalId: "FCO-002",
                    totalViews: 8,
                    uniqueVisitors: 4,
                    loggedViews: 4,
                    anonymousViews: 4,
                    messagesTotal: 0,
                    messageThreads: 0,
                    visitToMessageRatio: 0,
                    messageToRentalRatio: 0,
                },
            ],
            opportunities: {
                highInterestLowConversion: null,
            },
        });

        vi.mocked(engagementRepository.getCompanyStats)
            .mockResolvedValueOnce(currentStats)
            .mockResolvedValueOnce(previousStats);
        vi.mocked(productRepository.listByOwnerPaginated).mockResolvedValue({
            data: [
                createProduct({ id: "product-1", internalId: "TLD-001", name: "Taladro Pro" }),
                createProduct({ id: "product-2", internalId: "FCO-002", name: "Foco LED" }),
                createProduct({ id: "product-3", internalId: "MSC-003", name: "Mesa Corte" }),
            ],
            total: 3,
            page: 1,
        });

        const service = new CompanyAdvancedStatsService(
            engagementRepository,
            productRepository
        );

        const result = await service.getCompanyAdvancedStats("company-1", {
            from: "2026-04-01",
            to: "2026-04-07",
        });

        expect(engagementRepository.getCompanyStats).toHaveBeenNthCalledWith(1, "company-1", {
            from: "2026-04-01",
            to: "2026-04-07",
        });
        expect(engagementRepository.getCompanyStats).toHaveBeenNthCalledWith(2, "company-1", {
            from: "2026-03-25",
            to: "2026-03-31",
        });
        expect(productRepository.listByOwnerPaginated).toHaveBeenCalledWith(
            "company-1",
            "company",
            1,
            200,
            { publicationStatus: "published" }
        );

        expect(result.funnel.overallConversionRate).toBeCloseTo(0.15, 4);
        expect(result.funnel.delta.kind).toBe("increase");
        expect(result.conversionKpis).toHaveLength(4);
        expect(result.conversionKpis[2].delta.kind).toBe("new");
        expect(result.responsePerformance.averageFirstResponse.currentValue).toBe(150);
        expect(result.productConversionRows[0].productInternalId).toBe("TLD-001");
        expect(result.productConversionRows[1].deltaVsPrevious.kind).toBe("new");
        expect(result.sectionAvailability.trafficSources.available).toBe(false);
        expect(result.exportReadiness.csv.available).toBe(false);

        expect(result.insights.some((insight) => insight.key.startsWith("backend-opportunity-"))).toBe(true);
        expect(result.insights.some((insight) => insight.key === "response-time-improvement")).toBe(true);
        expect(result.insights.some((insight) => insight.key === "dormant-product-product-3")).toBe(true);
        expect(result.hasAnyData).toBe(true);
    });

    it("keeps rates safe when the current and previous periods have no traffic", async () => {
        const engagementRepository = createCompanyEngagementRepositoryMock();
        const productRepository = createProductRepositoryMock();

        const zeroStats = createCompanyStats({
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
            byProduct: [],
            opportunities: {
                highInterestLowConversion: null,
            },
        });

        vi.mocked(engagementRepository.getCompanyStats)
            .mockResolvedValueOnce(zeroStats)
            .mockResolvedValueOnce(zeroStats);
        vi.mocked(productRepository.listByOwnerPaginated).mockResolvedValue({
            data: [],
            total: 0,
            page: 1,
        });

        const service = new CompanyAdvancedStatsService(
            engagementRepository,
            productRepository
        );

        const result = await service.getCompanyAdvancedStats("company-1", {
            from: "2026-04-01",
            to: "2026-04-07",
        });

        expect(result.funnel.overallConversionRate).toBe(0);
        expect(result.funnel.delta.kind).toBe("neutral");
        expect(result.conversionKpis[0].currentValue).toBe(0);
        expect(result.conversionKpis[0].delta.percentageChange).toBe(0);
        expect(result.responsePerformance.averageFirstResponse.currentValue).toBeNull();
        expect(result.insights).toHaveLength(0);
        expect(result.hasAnyData).toBe(false);
    });
});
