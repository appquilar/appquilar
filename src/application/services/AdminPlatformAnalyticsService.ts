import {
    differenceInCalendarDays,
    format,
    parseISO,
    startOfDay,
    subDays,
} from "date-fns";

import type {
    AdminPlatformDetailAnalytics,
    AdminPlatformHomepageAnalytics,
    PlatformActivationSnapshot,
    PlatformActivationStep,
    PlatformAnalyticsPeriod,
    PlatformAttentionItem,
    PlatformCategoryBreakdown,
    PlatformExecutiveSummary,
    PlatformInsight,
    PlatformInsightMetric,
    PlatformMarketplaceHealth,
    PlatformMetricAvailability,
    PlatformMetricCard,
    PlatformMetricDelta,
    PlatformMetricFormat,
    PlatformMonetizationStats,
    PlatformOperationsStats,
    PlatformOverviewSnapshot,
    PlatformPlanDistribution,
    PlatformQualityRiskStats,
    PlatformRankingItem,
    PlatformRetentionStats,
    PlatformSeriesPoint,
    PlatformUsageItem,
} from "@/domain/models/AdminPlatformAnalytics";
import type { Category } from "@/domain/models/Category";
import type { CompanyAdminSummary } from "@/domain/models/CompanyAdminSummary";
import type { CompanyEngagementStats } from "@/domain/models/CompanyEngagementStats";
import type { Product } from "@/domain/models/Product";
import {
    getCompanyPlanProductLimit,
    getEffectiveUserPlan,
    getUserPlanProductLimit,
    isSubscriptionActive,
} from "@/domain/models/Subscription";
import type { User } from "@/domain/models/User";
import { getUserCompanyId } from "@/domain/models/User";
import type { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import type { CompanyAdminRepository } from "@/domain/repositories/CompanyAdminRepository";
import type { CompanyEngagementRepository } from "@/domain/repositories/CompanyEngagementRepository";
import type { ProductRepository } from "@/domain/repositories/ProductRepository";
import type { UserEngagementRepository } from "@/domain/repositories/UserEngagementRepository";
import type { UserRepository } from "@/domain/repositories/UserRepository";

const ADMIN_COMPANIES_PAGE_SIZE = 50;
const PLATFORM_USERS_PAGE_SIZE = 50;
const CATEGORY_PAGE_SIZE = 50;
const OWNER_PRODUCTS_PAGE_SIZE = 50;
const FETCH_BATCH_SIZE = 4;
const MAX_HOME_ATTENTION_ITEMS = 6;
const MAX_LIST_ITEMS = 5;

type OwnerType = "company" | "user";

type CompanyStatsBundle = {
    company: CompanyAdminSummary;
    products: Product[];
    publishedProducts: Product[];
    currentStats: CompanyEngagementStats | null;
    previousStats: CompanyEngagementStats | null;
    active7dStats: CompanyEngagementStats | null;
    active30dStats: CompanyEngagementStats | null;
};

type UserStatsBundle = {
    user: User;
    products: Product[];
    publishedProducts: Product[];
    currentStats: {
        summary: {
            totalViews: number;
            uniqueVisitors: number;
            messageThreads: number;
        };
        dailyViews: Array<{ day: string; views: number }>;
        dailyMessages: Array<{ day: string; messages: number }>;
        byProduct: Array<{
            productId: string;
            messageThreads: number;
        }>;
    } | null;
    previousStats: {
        summary: {
            totalViews: number;
            uniqueVisitors: number;
            messageThreads: number;
        };
        byProduct: Array<{
            productId: string;
            messageThreads: number;
        }>;
    } | null;
};

type OwnerProductIssue = {
    product: Product;
    ownerName: string;
    href: string;
};

const ZERO_DELTA: PlatformMetricDelta = {
    kind: "neutral",
    absoluteChange: 0,
    percentageChange: 0,
};

const UNSUPPORTED_REASON = "Este dato todavía no está disponible a nivel global.";

const safeDivide = (numerator: number, denominator: number): number => {
    if (denominator <= 0) {
        return 0;
    }

    return numerator / denominator;
};

const average = (values: number[]): number | null => {
    if (values.length === 0) {
        return null;
    }

    return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const buildDelta = (
    currentValue: number | null | undefined,
    previousValue: number | null | undefined
): PlatformMetricDelta => {
    const current = currentValue ?? 0;
    const previous = previousValue ?? 0;

    if (current === 0 && previous === 0) {
        return ZERO_DELTA;
    }

    if (previous === 0 && current > 0) {
        return {
            kind: "new",
            absoluteChange: current,
            percentageChange: 0,
        };
    }

    const absoluteChange = current - previous;

    if (absoluteChange === 0) {
        return ZERO_DELTA;
    }

    return {
        kind: absoluteChange > 0 ? "increase" : "decrease",
        absoluteChange,
        percentageChange: safeDivide(absoluteChange, previous) * 100,
    };
};

const buildMetricCard = ({
    key,
    label,
    value,
    previousValue = null,
    format = "count",
    trendPreference = "higher",
    availability,
    helperText,
}: {
    key: string;
    label: string;
    value: number | null;
    previousValue?: number | null;
    format?: PlatformMetricFormat;
    trendPreference?: PlatformMetricCard["trendPreference"];
    availability?: PlatformMetricAvailability;
    helperText?: string;
}): PlatformMetricCard => ({
    key,
    label,
    value,
    format,
    delta: buildDelta(value, previousValue),
    trendPreference,
    availability,
    helperText,
});

const buildUnavailableMetricCard = (
    key: string,
    label: string,
    reason = UNSUPPORTED_REASON
): PlatformMetricCard =>
    buildMetricCard({
        key,
        label,
        value: null,
        availability: {
            available: false,
            reason,
        },
        helperText: reason,
    });

const isPeriodSame = (
    left: PlatformAnalyticsPeriod,
    right: PlatformAnalyticsPeriod
): boolean => left.from === right.from && left.to === right.to;

const buildPeriodKey = (period: PlatformAnalyticsPeriod): string =>
    `${period.from}:${period.to}`;

const resolvePeriod = (
    period?: { from?: string; to?: string }
): PlatformAnalyticsPeriod => {
    if (period?.from && period?.to) {
        return {
            from: period.from,
            to: period.to,
        };
    }

    const today = startOfDay(new Date());

    return {
        from: format(subDays(today, 29), "yyyy-MM-dd"),
        to: format(today, "yyyy-MM-dd"),
    };
};

const buildPreviousPeriod = (
    currentPeriod: PlatformAnalyticsPeriod
): PlatformAnalyticsPeriod => {
    const from = parseISO(currentPeriod.from);
    const to = parseISO(currentPeriod.to);
    const days = differenceInCalendarDays(to, from) + 1;
    const previousTo = subDays(from, 1);
    const previousFrom = subDays(previousTo, days - 1);

    return {
        from: format(previousFrom, "yyyy-MM-dd"),
        to: format(previousTo, "yyyy-MM-dd"),
    };
};

const buildRollingPeriod = (days: number): PlatformAnalyticsPeriod => {
    const today = startOfDay(new Date());

    return {
        from: format(subDays(today, days - 1), "yyyy-MM-dd"),
        to: format(today, "yyyy-MM-dd"),
    };
};

const isActiveStatsSummary = (
    summary: { totalViews: number; messageThreads: number } | null | undefined
): boolean => {
    if (!summary) {
        return false;
    }

    return summary.totalViews > 0 || summary.messageThreads > 0;
};

const buildOwnerHref = (ownerId: string, ownerType: OwnerType): string =>
    ownerType === "company"
        ? `/dashboard/companies/${ownerId}`
        : `/dashboard/users/${ownerId}`;

const buildOwnerProductsHref = (ownerId: string, ownerType: OwnerType): string =>
    ownerType === "company"
        ? `/dashboard/companies/${ownerId}/products`
        : `/dashboard/users/${ownerId}/products`;

const buildUsageItem = ({
    key,
    ownerName,
    ownerId,
    ownerType,
    used,
    limit,
    planLabel,
}: {
    key: string;
    ownerName: string;
    ownerId: string;
    ownerType: OwnerType;
    used: number;
    limit: number;
    planLabel: string;
}): PlatformUsageItem => ({
    key,
    label: `${used}/${limit} productos activos`,
    ownerName,
    used,
    limit,
    usageRatio: safeDivide(used, limit),
    planLabel,
    href: buildOwnerProductsHref(ownerId, ownerType),
});

const buildInsightMetric = (
    label: string,
    value: number,
    format: PlatformMetricFormat
): PlatformInsightMetric => ({
    label,
    value,
    format,
});

const mergeSeries = (
    input: PlatformSeriesPoint[][]
): PlatformSeriesPoint[] => {
    const totals = new Map<string, number>();

    input.flat().forEach((row) => {
        totals.set(row.day, (totals.get(row.day) ?? 0) + row.value);
    });

    return Array.from(totals.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([day, value]) => ({ day, value }));
};

const dedupeByKey = <T extends { key: string }>(items: T[]): T[] => {
    const seen = new Set<string>();
    return items.filter((item) => {
        if (seen.has(item.key)) {
            return false;
        }

        seen.add(item.key);
        return true;
    });
};

const hasPositivePrice = (product: Product): boolean => {
    const tiers = product.price.tiers ?? [];

    if (tiers.some((tier) => tier.pricePerDay > 0)) {
        return true;
    }

    return (product.price.daily ?? 0) > 0;
};

const getCategoryLabel = (
    categoryId: string,
    categoryMap: Map<string, string>
): string => {
    if (!categoryId) {
        return "Sin categoría";
    }

    return categoryMap.get(categoryId) ?? "Sin categoría";
};

const getProductCategoryId = (product: Product): string =>
    product.category.id || "uncategorized";

const createEmptyCategoryBreakdown = (
    categoryId: string,
    categoryName: string
): PlatformCategoryBreakdown => ({
    categoryId,
    categoryName,
    publishedProducts: 0,
    conversationThreads: 0,
    previousConversationThreads: 0,
    demandOfferRatio: 0,
    delta: ZERO_DELTA,
});

const buildActivationStep = ({
    key,
    label,
    value,
    previousValue,
    firstStepValue,
    previousStepValue,
    availability,
}: {
    key: string;
    label: string;
    value: number;
    previousValue: number | null;
    firstStepValue: number;
    previousStepValue: number | null;
    availability?: PlatformMetricAvailability;
}): PlatformActivationStep => {
    const conversionFromPrevious = previousStepValue == null
        ? null
        : safeDivide(value, previousStepValue);

    return {
        key,
        label,
        value,
        previousValue,
        shareOfFirstStep: safeDivide(value, firstStepValue),
        conversionFromPrevious,
        dropOffFromPrevious: conversionFromPrevious == null ? null : 1 - conversionFromPrevious,
        delta: buildDelta(value, previousValue),
        availability,
    };
};

export class AdminPlatformAnalyticsService {
    constructor(
        private readonly companyAdminRepository: CompanyAdminRepository,
        private readonly userRepository: UserRepository,
        private readonly productRepository: ProductRepository,
        private readonly companyEngagementRepository: CompanyEngagementRepository,
        private readonly userEngagementRepository: UserEngagementRepository,
        private readonly categoryRepository: CategoryRepository
    ) {}

    async getAdminPlatformAnalytics(
        period?: { from?: string; to?: string }
    ): Promise<AdminPlatformDetailAnalytics> {
        const resolvedPeriod = resolvePeriod(period);
        const previousPeriod = buildPreviousPeriod(resolvedPeriod);
        const active7dPeriod = buildRollingPeriod(7);
        const active30dPeriod = buildRollingPeriod(30);
        const partialReasons = new Set<string>();

        const [companies, users, categories] = await Promise.all([
            this.listAllCompanies(),
            this.listAllUsers(),
            this.listAllCategories(),
        ]);

        const categoryNames = new Map<string, string>(
            categories.map((category) => [category.id, category.name])
        );
        const directUsers = users.filter((user) => !getUserCompanyId(user));

        const companyProductsById = await this.loadOwnerProducts(
            companies.map((company) => ({
                ownerId: company.id,
                ownerType: "company" as const,
                ownerName: company.name,
            })),
            partialReasons
        );
        const directUserProductsById = await this.loadOwnerProducts(
            directUsers.map((user) => ({
                ownerId: user.id,
                ownerType: "user" as const,
                ownerName: user.email,
            })),
            partialReasons
        );

        const companyBundles = await this.loadCompanyBundles({
            companies,
            companyProductsById,
            resolvedPeriod,
            previousPeriod,
            active7dPeriod,
            active30dPeriod,
            partialReasons,
        });

        const directUsersWithProducts = directUsers.filter((user) => {
            const products = directUserProductsById.get(user.id) ?? [];
            return products.length > 0;
        });

        const userBundles = await this.loadUserBundles({
            users: directUsersWithProducts,
            userProductsById: directUserProductsById,
            resolvedPeriod,
            previousPeriod,
            partialReasons,
        });

        return this.buildAnalytics({
            period: resolvedPeriod,
            previousPeriod,
            companyBundles,
            userBundles,
            directUsers,
            categoryNames,
            partialReasons: Array.from(partialReasons),
        });
    }

    private async listAllCompanies(): Promise<CompanyAdminSummary[]> {
        const companies: CompanyAdminSummary[] = [];
        let page = 1;
        let total = 0;

        do {
            const response = await this.companyAdminRepository.listCompanies({
                page,
                perPage: ADMIN_COMPANIES_PAGE_SIZE,
            });

            companies.push(...response.companies);
            total = response.total;
            page += 1;
        } while (companies.length < total);

        return companies;
    }

    private async listAllUsers(): Promise<User[]> {
        if (!this.userRepository.getAllUsers) {
            return [];
        }

        const users: User[] = [];
        let page = 1;
        let total = 0;

        do {
            const response = await this.userRepository.getAllUsers({
                page,
                perPage: PLATFORM_USERS_PAGE_SIZE,
            });

            users.push(...response.users);
            total = response.total;
            page += 1;
        } while (users.length < total);

        return users;
    }

    private async listAllCategories(): Promise<Category[]> {
        const categories: Category[] = [];
        let page = 1;
        let total = 0;

        do {
            const response = await this.categoryRepository.getAllCategories({
                page,
                perPage: CATEGORY_PAGE_SIZE,
            });

            categories.push(...response.categories);
            total = response.total;
            page += 1;
        } while (categories.length < total);

        return categories;
    }

    private async loadOwnerProducts(
        owners: Array<{ ownerId: string; ownerType: OwnerType; ownerName: string }>,
        partialReasons: Set<string>
    ): Promise<Map<string, Product[]>> {
        const productMap = new Map<string, Product[]>();
        const results = await this.runInBatches(owners, FETCH_BATCH_SIZE, async (owner) => ({
            ownerId: owner.ownerId,
            products: await this.listAllOwnerProducts(owner.ownerId, owner.ownerType),
        }));

        results.forEach((result, index) => {
            const owner = owners[index];

            if (result.status === "fulfilled") {
                productMap.set(owner.ownerId, result.value.products);
                return;
            }

            partialReasons.add(`No se pudieron cargar todos los productos de ${owner.ownerName}.`);
            productMap.set(owner.ownerId, []);
        });

        return productMap;
    }

    private async listAllOwnerProducts(
        ownerId: string,
        ownerType: OwnerType
    ): Promise<Product[]> {
        const products: Product[] = [];
        let page = 1;
        let total = 0;

        do {
            const response = await this.productRepository.listByOwnerPaginated(
                ownerId,
                ownerType,
                page,
                OWNER_PRODUCTS_PAGE_SIZE
            );

            products.push(...response.data);
            total = response.total;
            page += 1;

            if (response.data.length === 0) {
                break;
            }
        } while (products.length < total);

        return products;
    }

    private async loadCompanyBundles({
        companies,
        companyProductsById,
        resolvedPeriod,
        previousPeriod,
        active7dPeriod,
        active30dPeriod,
        partialReasons,
    }: {
        companies: CompanyAdminSummary[];
        companyProductsById: Map<string, Product[]>;
        resolvedPeriod: PlatformAnalyticsPeriod;
        previousPeriod: PlatformAnalyticsPeriod;
        active7dPeriod: PlatformAnalyticsPeriod;
        active30dPeriod: PlatformAnalyticsPeriod;
        partialReasons: Set<string>;
    }): Promise<CompanyStatsBundle[]> {
        const uniquePeriods = [resolvedPeriod, previousPeriod];
        if (!uniquePeriods.some((period) => isPeriodSame(period, active7dPeriod))) {
            uniquePeriods.push(active7dPeriod);
        }
        if (!uniquePeriods.some((period) => isPeriodSame(period, active30dPeriod))) {
            uniquePeriods.push(active30dPeriod);
        }

        const results = await this.runInBatches(companies, FETCH_BATCH_SIZE, async (company) => {
            const statsMap = await this.loadCompanyStatsForPeriods(company.id, uniquePeriods);
            const products = companyProductsById.get(company.id) ?? [];

            return {
                company,
                products,
                publishedProducts: products.filter((product) => product.publicationStatus === "published"),
                currentStats: statsMap.get(buildPeriodKey(resolvedPeriod)) ?? null,
                previousStats: statsMap.get(buildPeriodKey(previousPeriod)) ?? null,
                active7dStats: statsMap.get(buildPeriodKey(active7dPeriod)) ?? null,
                active30dStats: statsMap.get(buildPeriodKey(active30dPeriod)) ?? null,
            };
        });

        return results.map((result, index) => {
            if (result.status === "fulfilled") {
                return result.value;
            }

            const company = companies[index];
            partialReasons.add(`No se pudieron cargar todas las estadísticas de ${company.name}.`);

            return {
                company,
                products: companyProductsById.get(company.id) ?? [],
                publishedProducts: (companyProductsById.get(company.id) ?? []).filter(
                    (product) => product.publicationStatus === "published"
                ),
                currentStats: null,
                previousStats: null,
                active7dStats: null,
                active30dStats: null,
            };
        });
    }

    private async loadUserBundles({
        users,
        userProductsById,
        resolvedPeriod,
        previousPeriod,
        partialReasons,
    }: {
        users: User[];
        userProductsById: Map<string, Product[]>;
        resolvedPeriod: PlatformAnalyticsPeriod;
        previousPeriod: PlatformAnalyticsPeriod;
        partialReasons: Set<string>;
    }): Promise<UserStatsBundle[]> {
        const results = await this.runInBatches(users, FETCH_BATCH_SIZE, async (user) => {
            const statsMap = await this.loadUserStatsForPeriods(user.id, [
                resolvedPeriod,
                previousPeriod,
            ]);
            const products = userProductsById.get(user.id) ?? [];

            return {
                user,
                products,
                publishedProducts: products.filter((product) => product.publicationStatus === "published"),
                currentStats: statsMap.get(buildPeriodKey(resolvedPeriod)) ?? null,
                previousStats: statsMap.get(buildPeriodKey(previousPeriod)) ?? null,
            };
        });

        return results.map((result, index) => {
            if (result.status === "fulfilled") {
                return result.value;
            }

            const user = users[index];
            partialReasons.add(`No se pudieron cargar todas las estadísticas del usuario ${user.email}.`);

            return {
                user,
                products: userProductsById.get(user.id) ?? [],
                publishedProducts: (userProductsById.get(user.id) ?? []).filter(
                    (product) => product.publicationStatus === "published"
                ),
                currentStats: null,
                previousStats: null,
            };
        });
    }

    private async loadCompanyStatsForPeriods(
        companyId: string,
        periods: PlatformAnalyticsPeriod[]
    ): Promise<Map<string, CompanyEngagementStats>> {
        const results = await Promise.allSettled(
            periods.map(async (period) => ({
                key: buildPeriodKey(period),
                stats: await this.companyEngagementRepository.getCompanyStats(companyId, period),
            }))
        );

        const statsMap = new Map<string, CompanyEngagementStats>();
        results.forEach((result) => {
            if (result.status === "fulfilled") {
                statsMap.set(result.value.key, result.value.stats);
            }
        });

        return statsMap;
    }

    private async loadUserStatsForPeriods(
        userId: string,
        periods: PlatformAnalyticsPeriod[]
    ): Promise<Map<string, UserStatsBundle["currentStats"]>> {
        const results = await Promise.allSettled(
            periods.map(async (period) => {
                const stats = await this.userEngagementRepository.getUserStats(userId, period);

                return {
                    key: buildPeriodKey(period),
                    stats: {
                        summary: {
                            totalViews: stats.summary.totalViews,
                            uniqueVisitors: stats.summary.uniqueVisitors,
                            messageThreads: stats.summary.messageThreads,
                        },
                        dailyViews: stats.dailyViews.map((row) => ({
                            day: row.day,
                            views: row.views,
                        })),
                        dailyMessages: stats.dailyMessages.map((row) => ({
                            day: row.day,
                            messages: row.messages,
                        })),
                        byProduct: stats.byProduct.map((row) => ({
                            productId: row.productId,
                            messageThreads: row.messageThreads,
                        })),
                    },
                };
            })
        );

        const statsMap = new Map<string, UserStatsBundle["currentStats"]>();
        results.forEach((result) => {
            if (result.status === "fulfilled") {
                statsMap.set(result.value.key, result.value.stats);
            }
        });

        return statsMap;
    }

    private async runInBatches<T, TResult>(
        items: T[],
        batchSize: number,
        worker: (item: T) => Promise<TResult>
    ): Promise<Array<PromiseSettledResult<TResult>>> {
        const settledResults: Array<PromiseSettledResult<TResult>> = [];

        for (let index = 0; index < items.length; index += batchSize) {
            const batch = items.slice(index, index + batchSize);
            const batchResults = await Promise.allSettled(batch.map((item) => worker(item)));
            settledResults.push(...batchResults);
        }

        return settledResults;
    }

    private buildAnalytics({
        period,
        previousPeriod,
        companyBundles,
        userBundles,
        directUsers,
        categoryNames,
        partialReasons,
    }: {
        period: PlatformAnalyticsPeriod;
        previousPeriod: PlatformAnalyticsPeriod;
        companyBundles: CompanyStatsBundle[];
        userBundles: UserStatsBundle[];
        directUsers: User[];
        categoryNames: Map<string, string>;
        partialReasons: string[];
    }): AdminPlatformDetailAnalytics {
        const publishedProducts = [
            ...companyBundles.flatMap((bundle) => bundle.publishedProducts),
            ...userBundles.flatMap((bundle) => bundle.publishedProducts),
        ];
        const totalPublishedProducts = publishedProducts.length;
        const currentConversationThreads =
            companyBundles.reduce(
                (sum, bundle) => sum + (bundle.currentStats?.summary.messageThreads ?? 0),
                0
            ) +
            userBundles.reduce(
                (sum, bundle) => sum + (bundle.currentStats?.summary.messageThreads ?? 0),
                0
            );
        const previousConversationThreads =
            companyBundles.reduce(
                (sum, bundle) => sum + (bundle.previousStats?.summary.messageThreads ?? 0),
                0
            ) +
            userBundles.reduce(
                (sum, bundle) => sum + (bundle.previousStats?.summary.messageThreads ?? 0),
                0
            );
        const currentCompanyActiveCount = companyBundles.filter((bundle) =>
            isActiveStatsSummary(bundle.currentStats?.summary)
        ).length;
        const previousCompanyActiveCount = companyBundles.filter((bundle) =>
            isActiveStatsSummary(bundle.previousStats?.summary)
        ).length;
        const activeCompanies7d = companyBundles.filter((bundle) =>
            isActiveStatsSummary(bundle.active7dStats?.summary)
        ).length;
        const activeCompanies30d = companyBundles.filter((bundle) =>
            isActiveStatsSummary(bundle.active30dStats?.summary)
        ).length;

        const paidCompanyCount = companyBundles.filter((bundle) =>
            this.isPaidCompany(bundle.company)
        ).length;
        const directUserProCount = directUsers.filter((user) =>
            getEffectiveUserPlan(user.planType, user.subscriptionStatus) === "user_pro"
        ).length;
        const paidPlansActive = paidCompanyCount + directUserProCount;
        const freeAccountsCount =
            companyBundles.filter((bundle) =>
                bundle.company.planType === "starter" && isSubscriptionActive(bundle.company.subscriptionStatus)
            ).length +
            directUsers.filter((user) =>
                getEffectiveUserPlan(user.planType, user.subscriptionStatus) === "explorer"
            ).length;

        const companyCatalogCount = companyBundles.filter(
            (bundle) => bundle.publishedProducts.length > 0
        ).length;
        const companiesWithConversationCount = companyBundles.filter(
            (bundle) => (bundle.currentStats?.summary.messageThreads ?? 0) > 0
        ).length;
        const previousCompaniesWithConversationCount = companyBundles.filter(
            (bundle) => (bundle.previousStats?.summary.messageThreads ?? 0) > 0
        ).length;

        const averageFirstResponse = average(
            companyBundles
                .map((bundle) => bundle.currentStats?.summary.averageFirstResponseMinutes)
                .filter((value): value is number => typeof value === "number")
        );
        const previousAverageFirstResponse = average(
            companyBundles
                .map((bundle) => bundle.previousStats?.summary.averageFirstResponseMinutes)
                .filter((value): value is number => typeof value === "number")
        );

        const overviewDailyViews = mergeSeries([
            ...companyBundles.map((bundle) =>
                (bundle.currentStats?.dailyViews ?? []).map((row) => ({
                    day: row.day,
                    value: row.views,
                }))
            ),
            ...userBundles.map((bundle) =>
                (bundle.currentStats?.dailyViews ?? []).map((row) => ({
                    day: row.day,
                    value: row.views,
                }))
            ),
        ]);
        const overviewDailyMessages = mergeSeries([
            ...companyBundles.map((bundle) =>
                (bundle.currentStats?.dailyMessages ?? []).map((row) => ({
                    day: row.day,
                    value: row.messages,
                }))
            ),
            ...userBundles.map((bundle) =>
                (bundle.currentStats?.dailyMessages ?? []).map((row) => ({
                    day: row.day,
                    value: row.messages,
                }))
            ),
        ]);

        const overview: PlatformOverviewSnapshot = {
            cards: [
                buildMetricCard({
                    key: "active_companies_period",
                    label: "Empresas activas",
                    value: currentCompanyActiveCount,
                    previousValue: previousCompanyActiveCount,
                }),
                buildMetricCard({
                    key: "active_products_total",
                    label: "Productos activos",
                    value: totalPublishedProducts,
                    availability: {
                        available: true,
                        partial: true,
                        reason: "Es una foto actual del catálogo publicado, no un histórico del período.",
                    },
                    helperText: "Snapshot actual del catálogo publicado.",
                }),
                buildMetricCard({
                    key: "conversation_threads",
                    label: "Conversaciones iniciadas",
                    value: currentConversationThreads,
                    previousValue: previousConversationThreads,
                }),
                buildMetricCard({
                    key: "paid_plans_active",
                    label: "Planes de pago activos",
                    value: paidPlansActive,
                    availability: {
                        available: true,
                        partial: true,
                        reason: "Es una foto actual de planes activos, sin histórico de upgrades.",
                    },
                    helperText: "Incluye compañías Pro/Enterprise y cuentas User Pro activas.",
                }),
                buildMetricCard({
                    key: "direct_user_pro",
                    label: "User Pro directos",
                    value: directUserProCount,
                    availability: {
                        available: true,
                        partial: true,
                        reason: "Sólo cubre cuentas directas sin contexto de empresa.",
                    },
                }),
            ],
            planDistribution: this.buildPlanDistribution(companyBundles, directUsers),
            dailyViews: overviewDailyViews,
            dailyMessages: overviewDailyMessages,
        };

        const executiveSummary: PlatformExecutiveSummary = {
            cards: [
                buildMetricCard({
                    key: "active_companies_7d",
                    label: "Empresas activas 7D",
                    value: activeCompanies7d,
                    helperText: "Con visitas o conversaciones en los últimos 7 días.",
                }),
                buildMetricCard({
                    key: "active_companies_30d",
                    label: "Empresas activas 30D",
                    value: activeCompanies30d,
                    helperText: "Con visitas o conversaciones en los últimos 30 días.",
                }),
                buildMetricCard({
                    key: "active_products_total_home",
                    label: "Productos activos totales",
                    value: totalPublishedProducts,
                    availability: {
                        available: true,
                        partial: true,
                        reason: "Es una foto actual del catálogo publicado.",
                    },
                }),
                buildMetricCard({
                    key: "conversation_threads_home",
                    label: "Conversaciones iniciadas",
                    value: currentConversationThreads,
                    previousValue: previousConversationThreads,
                }),
                buildMetricCard({
                    key: "paid_plans_active_home",
                    label: "Planes de pago activos",
                    value: paidPlansActive,
                    helperText: "Foto actual de cuentas activas en planes de pago.",
                }),
                buildMetricCard({
                    key: "direct_user_pro_home",
                    label: "User Pro directos",
                    value: directUserProCount,
                }),
            ],
        };

        const activation: PlatformActivationSnapshot = {
            steps: [
                buildActivationStep({
                    key: "companies_total",
                    label: "Empresas totales",
                    value: companyBundles.length,
                    previousValue: null,
                    firstStepValue: Math.max(companyBundles.length, 1),
                    previousStepValue: null,
                    availability: {
                        available: true,
                        partial: true,
                        reason: "Es una foto actual del censo de empresas.",
                    },
                }),
                buildActivationStep({
                    key: "companies_with_catalog",
                    label: "Con catálogo publicado",
                    value: companyCatalogCount,
                    previousValue: null,
                    firstStepValue: Math.max(companyBundles.length, 1),
                    previousStepValue: companyBundles.length,
                    availability: {
                        available: true,
                        partial: true,
                        reason: "Es una foto actual del catálogo, no un evento del período.",
                    },
                }),
                buildActivationStep({
                    key: "companies_with_conversations",
                    label: "Con al menos una conversación",
                    value: companiesWithConversationCount,
                    previousValue: previousCompaniesWithConversationCount,
                    firstStepValue: Math.max(companyBundles.length, 1),
                    previousStepValue: companyCatalogCount,
                }),
                buildActivationStep({
                    key: "paid_companies",
                    label: "En plan de pago activo",
                    value: paidCompanyCount,
                    previousValue: null,
                    firstStepValue: Math.max(companyBundles.length, 1),
                    previousStepValue: companiesWithConversationCount,
                    availability: {
                        available: true,
                        partial: true,
                        reason: "Es una foto actual de monetización, sin histórico de upgrade.",
                    },
                }),
            ],
            notes: [
                "Las fases de registro, perfil completado, site publicado, primer alquiler y primer upgrade todavía no están disponibles con suficiente fiabilidad a nivel global.",
                "Las fases de catálogo y monetización son snapshots actuales, no eventos fechados del período.",
            ],
        };

        const operations: PlatformOperationsStats = {
            cards: [
                buildMetricCard({
                    key: "average_first_response",
                    label: "1ª respuesta media",
                    value: averageFirstResponse,
                    previousValue: previousAverageFirstResponse,
                    format: "duration_minutes",
                    trendPreference: "lower",
                    availability: {
                        available: true,
                        partial: true,
                        reason: "Se calcula como media simple entre empresas con dato. De momento no mostramos mediana ni distribución.",
                    },
                    helperText: "Sólo disponible como media simple entre empresas.",
                }),
                buildUnavailableMetricCard(
                    "median_first_response",
                    "Mediana de 1ª respuesta",
                    "De momento no tenemos una mediana global fiable."
                ),
                buildUnavailableMetricCard(
                    "response_rate",
                    "Tasa global de respuesta",
                    "De momento no tenemos una tasa global de respuesta fiable."
                ),
                buildUnavailableMetricCard(
                    "unanswered_conversations",
                    "Conversaciones sin responder",
                    "No se deriva en modo ligero porque requeriría recorrer hilos de mensajes."
                ),
            ],
            bestResponders: this.buildResponseRanking(companyBundles, "best"),
            slowResponders: this.buildResponseRanking(companyBundles, "slow"),
            dailyMessages: overviewDailyMessages,
        };

        const marketplace = this.buildMarketplace({
            companyBundles,
            userBundles,
            categoryNames,
        });

        const nearLimitAccounts = this.buildNearLimitAccounts({
            companyBundles,
            userBundles,
        });
        const upgradeCandidates = this.buildUpgradeCandidates({
            companyBundles,
            userBundles,
        });
        const monetization: PlatformMonetizationStats = {
            cards: [
                buildMetricCard({
                    key: "free_accounts",
                    label: "Cuentas free",
                    value: freeAccountsCount,
                }),
                buildMetricCard({
                    key: "paid_accounts",
                    label: "Cuentas paid",
                    value: paidPlansActive,
                }),
                buildMetricCard({
                    key: "active_paid_plans",
                    label: "Planes activos de pago",
                    value: paidPlansActive,
                    helperText: "Compañías Pro/Enterprise + cuentas User Pro activas.",
                }),
                buildMetricCard({
                    key: "direct_user_pro_paid",
                    label: "User Pro activos",
                    value: directUserProCount,
                }),
            ],
            planDistribution: overview.planDistribution,
            upgradeCandidates,
            nearLimitAccounts,
        };

        const qualityRisk = this.buildQualityRisk({
            companyBundles,
            userBundles,
            nearLimitAccounts,
        });
        const insights = this.buildInsights({
            marketplace,
            operations,
            activation,
            monetization,
            qualityRisk,
        });

        const companiesWithoutCatalog = companyBundles
            .filter((bundle) => bundle.publishedProducts.length === 0)
            .slice(0, MAX_LIST_ITEMS)
            .map<PlatformAttentionItem>((bundle) => ({
                key: `company-without-catalog-${bundle.company.id}`,
                title: bundle.company.name,
                description: "Empresa sin catálogo publicado todavía.",
                severity: "info",
                href: buildOwnerHref(bundle.company.id, "company"),
            }));

        const attentionItems = dedupeByKey([
            ...qualityRisk.dormantCompanies,
            ...companiesWithoutCatalog,
            ...upgradeCandidates,
            ...nearLimitAccounts.map((item) => ({
                key: `near-limit-${item.key}`,
                title: item.ownerName,
                description: `${item.used}/${item.limit} productos activos en ${item.planLabel}.`,
                severity: "warning" as const,
                href: item.href,
            })),
        ]).slice(0, MAX_HOME_ATTENTION_ITEMS);

        const homepage: AdminPlatformHomepageAnalytics = {
            period,
            previousPeriod,
            executiveSummary,
            activation,
            operations,
            marketplace,
            insights,
            attentionItems,
            callToActionHref: "/dashboard/platform-analytics",
        };

        const retention: PlatformRetentionStats = {
            availability: {
                available: false,
                reason: "La retención 30/60/90 y las cohortes todavía no están disponibles en esta vista.",
            },
        };

        if (partialReasons.length > 0) {
            homepage.insights = [
                ...homepage.insights,
                {
                    key: "partial-platform-analytics-data",
                    title: "Analítica parcial",
                    description: partialReasons.join(" "),
                    severity: "info",
                    metrics: [],
                },
            ];
        }

        return {
            period,
            previousPeriod,
            homepage,
            overview,
            activation,
            marketplace,
            operations,
            monetization,
            qualityRisk,
            retention,
        };
    }

    private buildPlanDistribution(
        companyBundles: CompanyStatsBundle[],
        directUsers: User[]
    ): PlatformPlanDistribution[] {
        const companyPlans: PlatformPlanDistribution[] = [
            {
                key: "company-starter",
                label: "Empresa Starter",
                total: companyBundles.filter((bundle) => bundle.company.planType === "starter").length,
                active: companyBundles.filter(
                    (bundle) =>
                        bundle.company.planType === "starter" &&
                        isSubscriptionActive(bundle.company.subscriptionStatus)
                ).length,
                paid: false,
            },
            {
                key: "company-pro",
                label: "Empresa Pro",
                total: companyBundles.filter((bundle) => bundle.company.planType === "pro").length,
                active: companyBundles.filter(
                    (bundle) =>
                        bundle.company.planType === "pro" &&
                        isSubscriptionActive(bundle.company.subscriptionStatus)
                ).length,
                paid: true,
            },
            {
                key: "company-enterprise",
                label: "Empresa Enterprise",
                total: companyBundles.filter((bundle) => bundle.company.planType === "enterprise").length,
                active: companyBundles.filter(
                    (bundle) =>
                        bundle.company.planType === "enterprise" &&
                        isSubscriptionActive(bundle.company.subscriptionStatus)
                ).length,
                paid: true,
            },
            {
                key: "user-explorer",
                label: "Usuario Explorer",
                total: directUsers.filter(
                    (user) => getEffectiveUserPlan(user.planType, user.subscriptionStatus) === "explorer"
                ).length,
                active: directUsers.filter(
                    (user) => getEffectiveUserPlan(user.planType, user.subscriptionStatus) === "explorer"
                ).length,
                paid: false,
            },
            {
                key: "user-pro",
                label: "Usuario Pro",
                total: directUsers.filter(
                    (user) => getEffectiveUserPlan(user.planType, user.subscriptionStatus) === "user_pro"
                ).length,
                active: directUsers.filter(
                    (user) => getEffectiveUserPlan(user.planType, user.subscriptionStatus) === "user_pro"
                ).length,
                paid: true,
            },
        ];

        return companyPlans.filter((item) => item.total > 0 || item.active > 0);
    }

    private buildResponseRanking(
        companyBundles: CompanyStatsBundle[],
        order: "best" | "slow"
    ): PlatformRankingItem[] {
        const rows = companyBundles
            .filter(
                (bundle) =>
                    typeof bundle.currentStats?.summary.averageFirstResponseMinutes === "number"
            )
            .map<PlatformRankingItem>((bundle) => ({
                key: `response-${bundle.company.id}`,
                label: bundle.company.name,
                value: bundle.currentStats?.summary.averageFirstResponseMinutes ?? null,
                helperText: `${bundle.currentStats?.summary.messageThreads ?? 0} conversaciones`,
                href: buildOwnerHref(bundle.company.id, "company"),
            }))
            .sort((left, right) => {
                const leftValue = left.value ?? 0;
                const rightValue = right.value ?? 0;

                return order === "best"
                    ? leftValue - rightValue
                    : rightValue - leftValue;
            });

        return rows.slice(0, MAX_LIST_ITEMS);
    }

    private buildMarketplace({
        companyBundles,
        userBundles,
        categoryNames,
    }: {
        companyBundles: CompanyStatsBundle[];
        userBundles: UserStatsBundle[];
        categoryNames: Map<string, string>;
    }): PlatformMarketplaceHealth {
        const byCategory = new Map<string, PlatformCategoryBreakdown>();
        const currentMessageThreadsByProduct = new Map<string, number>();
        const previousMessageThreadsByProduct = new Map<string, number>();

        companyBundles.forEach((bundle) => {
            bundle.currentStats?.byProduct.forEach((row) => {
                currentMessageThreadsByProduct.set(
                    row.productId,
                    (currentMessageThreadsByProduct.get(row.productId) ?? 0) + row.messageThreads
                );
            });
            bundle.previousStats?.byProduct.forEach((row) => {
                previousMessageThreadsByProduct.set(
                    row.productId,
                    (previousMessageThreadsByProduct.get(row.productId) ?? 0) + row.messageThreads
                );
            });
        });

        userBundles.forEach((bundle) => {
            bundle.currentStats?.byProduct.forEach((row) => {
                currentMessageThreadsByProduct.set(
                    row.productId,
                    (currentMessageThreadsByProduct.get(row.productId) ?? 0) + row.messageThreads
                );
            });
            bundle.previousStats?.byProduct.forEach((row) => {
                previousMessageThreadsByProduct.set(
                    row.productId,
                    (previousMessageThreadsByProduct.get(row.productId) ?? 0) + row.messageThreads
                );
            });
        });

        const allPublishedProducts = [
            ...companyBundles.flatMap((bundle) => bundle.publishedProducts),
            ...userBundles.flatMap((bundle) => bundle.publishedProducts),
        ];

        allPublishedProducts.forEach((product) => {
            const categoryId = getProductCategoryId(product);
            const categoryName = getCategoryLabel(categoryId, categoryNames);
            const current = byCategory.get(categoryId) ?? createEmptyCategoryBreakdown(categoryId, categoryName);

            current.publishedProducts += 1;
            current.conversationThreads += currentMessageThreadsByProduct.get(product.id) ?? 0;
            current.previousConversationThreads += previousMessageThreadsByProduct.get(product.id) ?? 0;
            byCategory.set(categoryId, current);
        });

        const categories = Array.from(byCategory.values())
            .map((category) => ({
                ...category,
                demandOfferRatio: safeDivide(category.conversationThreads, category.publishedProducts),
                delta: buildDelta(
                    category.conversationThreads,
                    category.previousConversationThreads
                ),
            }))
            .sort((left, right) => right.conversationThreads - left.conversationThreads);

        const growthCategories = [...categories]
            .filter((category) => category.delta.absoluteChange > 0)
            .sort((left, right) => right.delta.absoluteChange - left.delta.absoluteChange)
            .slice(0, MAX_LIST_ITEMS);

        const weakCategories = [...categories]
            .filter(
                (category) =>
                    category.publishedProducts > 0 &&
                    (category.conversationThreads === 0 || category.demandOfferRatio < 0.35)
            )
            .sort((left, right) => left.demandOfferRatio - right.demandOfferRatio)
            .slice(0, MAX_LIST_ITEMS);

        return {
            categories: categories.slice(0, 8),
            growthCategories,
            weakCategories,
            unsupportedSections: [
                {
                    key: "marketplace-zones",
                    label: "Zonas y cobertura",
                    availability: {
                        available: false,
                        reason: "Todavía no tenemos una lectura global fiable de oferta y demanda por zona.",
                    },
                },
                {
                    key: "marketplace-traffic",
                    label: "Fuentes de tráfico",
                    availability: {
                        available: false,
                        reason: "Todavía no tenemos un desglose fiable por canal de adquisición.",
                    },
                },
                {
                    key: "marketplace-search",
                    label: "Búsquedas sin resultado",
                    availability: {
                        available: false,
                        reason: "Todavía no tenemos datos globales fiables de búsquedas sin resultado o demanda sin disponibilidad.",
                    },
                },
            ],
        };
    }

    private buildNearLimitAccounts({
        companyBundles,
        userBundles,
    }: {
        companyBundles: CompanyStatsBundle[];
        userBundles: UserStatsBundle[];
    }): PlatformUsageItem[] {
        const companyNearLimit = companyBundles
            .map((bundle) => {
                const limit = getCompanyPlanProductLimit({
                    companyId: bundle.company.id,
                    companyName: bundle.company.name,
                    companyRole: "ROLE_ADMIN",
                    isCompanyOwner: false,
                    planType: bundle.company.planType,
                    subscriptionStatus: bundle.company.subscriptionStatus,
                    isFoundingAccount: bundle.company.isFoundingAccount,
                });

                if (limit == null || limit <= 0) {
                    return null;
                }

                const used = bundle.publishedProducts.length;
                const usageRatio = safeDivide(used, limit);

                if (usageRatio < 0.8) {
                    return null;
                }

                return buildUsageItem({
                    key: `company-${bundle.company.id}`,
                    ownerName: bundle.company.name,
                    ownerId: bundle.company.id,
                    ownerType: "company",
                    used,
                    limit,
                    planLabel: bundle.company.planType,
                });
            })
            .filter((item): item is PlatformUsageItem => item !== null);

        const userNearLimit = userBundles
            .map((bundle) => {
                const limit = getUserPlanProductLimit(
                    bundle.user.planType,
                    bundle.user.subscriptionStatus,
                    bundle.user.entitlements ?? null
                );

                if (limit == null || limit <= 0) {
                    return null;
                }

                const used = bundle.publishedProducts.length;
                const usageRatio = safeDivide(used, limit);

                if (usageRatio < 0.8) {
                    return null;
                }

                return buildUsageItem({
                    key: `user-${bundle.user.id}`,
                    ownerName: bundle.user.email,
                    ownerId: bundle.user.id,
                    ownerType: "user",
                    used,
                    limit,
                    planLabel: getEffectiveUserPlan(
                        bundle.user.planType,
                        bundle.user.subscriptionStatus
                    ),
                });
            })
            .filter((item): item is PlatformUsageItem => item !== null);

        return [...companyNearLimit, ...userNearLimit]
            .sort((left, right) => right.usageRatio - left.usageRatio)
            .slice(0, MAX_LIST_ITEMS);
    }

    private buildUpgradeCandidates({
        companyBundles,
        userBundles,
    }: {
        companyBundles: CompanyStatsBundle[];
        userBundles: UserStatsBundle[];
    }): PlatformAttentionItem[] {
        const companyCandidates = companyBundles
            .filter((bundle) => {
                if (bundle.company.planType !== "starter") {
                    return false;
                }

                if (!isSubscriptionActive(bundle.company.subscriptionStatus)) {
                    return false;
                }

                const limit = getCompanyPlanProductLimit({
                    companyId: bundle.company.id,
                    companyName: bundle.company.name,
                    companyRole: "ROLE_ADMIN",
                    isCompanyOwner: false,
                    planType: bundle.company.planType,
                    subscriptionStatus: bundle.company.subscriptionStatus,
                    isFoundingAccount: bundle.company.isFoundingAccount,
                });
                const used = bundle.publishedProducts.length;
                const conversations = bundle.currentStats?.summary.messageThreads ?? 0;

                if (limit == null) {
                    return false;
                }

                return safeDivide(used, limit) >= 0.7 || conversations >= 4;
            })
            .map<PlatformAttentionItem>((bundle) => ({
                key: `upgrade-company-${bundle.company.id}`,
                title: bundle.company.name,
                description: "Actividad suficiente para valorar upgrade desde Starter.",
                severity: "success",
                href: buildOwnerHref(bundle.company.id, "company"),
            }));

        const userCandidates = userBundles
            .filter((bundle) => {
                if (getEffectiveUserPlan(bundle.user.planType, bundle.user.subscriptionStatus) !== "explorer") {
                    return false;
                }

                return bundle.publishedProducts.length >= 2 || (bundle.currentStats?.summary.messageThreads ?? 0) > 0;
            })
            .map<PlatformAttentionItem>((bundle) => ({
                key: `upgrade-user-${bundle.user.id}`,
                title: bundle.user.email,
                description: "Cuenta directa con señales de uso para valorar User Pro.",
                severity: "success",
                href: buildOwnerHref(bundle.user.id, "user"),
            }));

        return [...companyCandidates, ...userCandidates].slice(0, MAX_LIST_ITEMS);
    }

    private buildQualityRisk({
        companyBundles,
        userBundles,
        nearLimitAccounts,
    }: {
        companyBundles: CompanyStatsBundle[];
        userBundles: UserStatsBundle[];
        nearLimitAccounts: PlatformUsageItem[];
    }): PlatformQualityRiskStats {
        const missingImageProducts: OwnerProductIssue[] = [];
        const missingPriceProducts: OwnerProductIssue[] = [];

        companyBundles.forEach((bundle) => {
            bundle.publishedProducts.forEach((product) => {
                if ((product.image_ids ?? []).length === 0) {
                    missingImageProducts.push({
                        product,
                        ownerName: bundle.company.name,
                        href: buildOwnerProductsHref(bundle.company.id, "company"),
                    });
                }

                if (!hasPositivePrice(product)) {
                    missingPriceProducts.push({
                        product,
                        ownerName: bundle.company.name,
                        href: buildOwnerProductsHref(bundle.company.id, "company"),
                    });
                }
            });
        });

        userBundles.forEach((bundle) => {
            bundle.publishedProducts.forEach((product) => {
                if ((product.image_ids ?? []).length === 0) {
                    missingImageProducts.push({
                        product,
                        ownerName: bundle.user.email,
                        href: buildOwnerProductsHref(bundle.user.id, "user"),
                    });
                }

                if (!hasPositivePrice(product)) {
                    missingPriceProducts.push({
                        product,
                        ownerName: bundle.user.email,
                        href: buildOwnerProductsHref(bundle.user.id, "user"),
                    });
                }
            });
        });

        const dormantCompanies = companyBundles
            .filter(
                (bundle) =>
                    bundle.publishedProducts.length > 0 &&
                    !isActiveStatsSummary(bundle.currentStats?.summary)
            )
            .map<PlatformAttentionItem>((bundle) => ({
                key: `dormant-company-${bundle.company.id}`,
                title: bundle.company.name,
                description: "Catálogo publicado sin visitas ni conversaciones en el período.",
                severity: "warning",
                href: buildOwnerHref(bundle.company.id, "company"),
            }))
            .slice(0, MAX_LIST_ITEMS);

        const productsWithoutImage = missingImageProducts
            .slice(0, MAX_LIST_ITEMS)
            .map<PlatformAttentionItem>((entry) => ({
                key: `missing-image-${entry.product.id}`,
                title: entry.product.name,
                description: `Producto publicado sin imagen. Owner: ${entry.ownerName}.`,
                severity: "warning",
                href: entry.href,
            }));

        const productsWithoutPrice = missingPriceProducts
            .slice(0, MAX_LIST_ITEMS)
            .map<PlatformAttentionItem>((entry) => ({
                key: `missing-price-${entry.product.id}`,
                title: entry.product.name,
                description: `Producto publicado sin precio diario válido. Owner: ${entry.ownerName}.`,
                severity: "warning",
                href: entry.href,
            }));

        const actionItems = dedupeByKey([
            ...productsWithoutImage,
            ...productsWithoutPrice,
            ...dormantCompanies,
            ...nearLimitAccounts.map((item) => ({
                key: `quality-near-limit-${item.key}`,
                title: item.ownerName,
                description: `${item.used}/${item.limit} productos activos en ${item.planLabel}.`,
                severity: "info" as const,
                href: item.href,
            })),
        ]).slice(0, MAX_LIST_ITEMS);

        return {
            cards: [
                buildMetricCard({
                    key: "products_without_image",
                    label: "Productos sin foto",
                    value: missingImageProducts.length,
                    availability: {
                        available: true,
                        partial: true,
                        reason: "Se evalúan sólo productos publicados cargados en esta agregación.",
                    },
                }),
                buildMetricCard({
                    key: "products_without_price",
                    label: "Productos sin precio válido",
                    value: missingPriceProducts.length,
                    availability: {
                        available: true,
                        partial: true,
                        reason: "Se valida con la información de precio disponible hoy en catálogo.",
                    },
                }),
                buildMetricCard({
                    key: "dormant_companies",
                    label: "Empresas dormidas",
                    value: dormantCompanies.length,
                }),
                buildMetricCard({
                    key: "near_limit_accounts",
                    label: "Cuentas cerca del límite",
                    value: nearLimitAccounts.length,
                }),
            ],
            productsWithoutImage,
            productsWithoutPrice,
            dormantCompanies,
            actionItems,
        };
    }

    private buildInsights({
        marketplace,
        operations,
        activation,
        monetization,
        qualityRisk,
    }: {
        marketplace: PlatformMarketplaceHealth;
        operations: PlatformOperationsStats;
        activation: PlatformActivationSnapshot;
        monetization: PlatformMonetizationStats;
        qualityRisk: PlatformQualityRiskStats;
    }): PlatformInsight[] {
        const insights: PlatformInsight[] = [];

        const topGrowthCategory = marketplace.growthCategories[0];
        if (
            topGrowthCategory &&
            topGrowthCategory.delta.absoluteChange > 0 &&
            topGrowthCategory.publishedProducts <= 3
        ) {
            insights.push({
                key: `growth-low-supply-${topGrowthCategory.categoryId}`,
                title: "La demanda crece con poca oferta",
                description: `${topGrowthCategory.categoryName} acelera en conversaciones con una oferta publicada todavía limitada.`,
                severity: "warning",
                metrics: [
                    buildInsightMetric("Conversaciones", topGrowthCategory.conversationThreads, "count"),
                    buildInsightMetric("Productos activos", topGrowthCategory.publishedProducts, "count"),
                    buildInsightMetric("Demanda/oferta", topGrowthCategory.demandOfferRatio, "percentage"),
                ],
            });
        }

        const topDemandCategory = [...marketplace.categories]
            .sort((left, right) => right.demandOfferRatio - left.demandOfferRatio)[0];
        if (topDemandCategory && topDemandCategory.conversationThreads >= 3) {
            insights.push({
                key: `high-demand-category-${topDemandCategory.categoryId}`,
                title: "Categoría con alta conversación por producto",
                description: `${topDemandCategory.categoryName} está convirtiendo mejor que el resto del catálogo.`,
                severity: "success",
                metrics: [
                    buildInsightMetric("Demanda/oferta", topDemandCategory.demandOfferRatio, "percentage"),
                    buildInsightMetric("Conversaciones", topDemandCategory.conversationThreads, "count"),
                ],
            });
        }

        const averageFirstResponse = operations.cards.find(
            (card) => card.key === "average_first_response"
        );
        if ((averageFirstResponse?.delta.absoluteChange ?? 0) > 15) {
            insights.push({
                key: "average-first-response-worsened",
                title: "Empeora el tiempo de respuesta",
                description: "La primera respuesta media ha subido frente al período anterior.",
                severity: "warning",
                metrics: [
                    buildInsightMetric(
                        "Cambio",
                        averageFirstResponse?.delta.absoluteChange ?? 0,
                        "duration_minutes"
                    ),
                ],
            });
        }

        const dormantCompaniesCard = qualityRisk.cards.find(
            (card) => card.key === "dormant_companies"
        );
        const companiesWithConversationsStep = activation.steps.find(
            (step) => step.key === "companies_with_conversations"
        );
        const companiesWithCatalogStep = activation.steps.find(
            (step) => step.key === "companies_with_catalog"
        );
        if (
            dormantCompaniesCard?.value != null &&
            dormantCompaniesCard.value > 0 &&
            companiesWithCatalogStep &&
            safeDivide(dormantCompaniesCard.value, companiesWithCatalogStep.value) >= 0.35
        ) {
            insights.push({
                key: "dormant-catalog-share-high",
                title: "Mucho catálogo sin conversación",
                description: "Una parte relevante de las empresas con catálogo publicado no está generando actividad en el período.",
                severity: "warning",
                metrics: [
                    buildInsightMetric(
                        "Empresas dormidas",
                        dormantCompaniesCard.value,
                        "count"
                    ),
                    buildInsightMetric(
                        "Empresas con conversación",
                        companiesWithConversationsStep?.value ?? 0,
                        "count"
                    ),
                ],
            });
        }

        const upgradeCandidatesCard = monetization.upgradeCandidates.length;
        if (upgradeCandidatesCard > 0) {
            insights.push({
                key: "upgrade-candidates-available",
                title: "Hay cuentas con encaje de upgrade",
                description: "Starter y Explorer con suficiente tracción para justificar revisión comercial.",
                severity: "info",
                metrics: [
                    buildInsightMetric(
                        "Candidatas",
                        upgradeCandidatesCard,
                        "count"
                    ),
                ],
            });
        }

        return insights.slice(0, MAX_LIST_ITEMS);
    }

    private isPaidCompany(company: CompanyAdminSummary): boolean {
        if (!isSubscriptionActive(company.subscriptionStatus)) {
            return false;
        }

        return company.planType === "pro" || company.planType === "enterprise";
    }
}
