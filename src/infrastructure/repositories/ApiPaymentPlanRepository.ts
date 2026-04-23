import type {
    AssignPaymentPlanInput,
    PaymentPlan,
    PaymentPlanScope,
    PaymentPlanSubscriber,
    UpdatePaymentPlanInput,
} from "@/domain/models/PaymentPlan";
import type { BillingPlanType } from "@/domain/models/Billing";
import type { PaymentPlanRepository } from "@/domain/repositories/PaymentPlanRepository";
import { ApiClient } from "@/infrastructure/http/ApiClient";
import type { AuthSession } from "@/domain/models/AuthSession";
import { toAuthorizationHeader } from "@/domain/models/AuthSession";
import type {
    CapabilityState,
    FeatureCapabilities,
    FeatureCapability,
    InventoryManagementCapability,
    SubscriptionStatus,
} from "@/domain/models/Subscription";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

interface ApiListResponse<T> {
    success: boolean;
    data: T[];
    total: number;
}

interface GenericCapabilityDto {
    state: CapabilityState;
    limits?: Record<string, number | null> | null;
}

interface InventoryManagementCapabilityDto extends GenericCapabilityDto {
    limits?: {
        max_products_with_inventory?: number | null;
        max_quantity_per_product?: number | null;
    } | null;
}

interface FeatureCapabilitiesDto {
    inventory_management?: InventoryManagementCapabilityDto | null;
    basic_analytics?: GenericCapabilityDto | null;
    advanced_analytics?: GenericCapabilityDto | null;
    team_management?: GenericCapabilityDto | null;
    custom_domain?: GenericCapabilityDto | null;
    branding?: GenericCapabilityDto | null;
    api_access?: GenericCapabilityDto | null;
}

interface PaymentPlanDto {
    plan_code: BillingPlanType;
    scope: PaymentPlanScope;
    display_name: string;
    subtitle?: string | null;
    marketing_message?: string | null;
    badge_text?: string | null;
    feature_list?: string[] | null;
    quotas?: {
        active_products?: number | null;
        team_members?: number | null;
    } | null;
    capabilities?: FeatureCapabilitiesDto | null;
    sort_order: number;
    is_active: boolean;
    is_visible_in_checkout: boolean;
    is_checkout_enabled: boolean;
    is_manual_assignment_enabled: boolean;
    price?: {
        amount?: number | null;
        currency?: string | null;
        interval?: string | null;
        stripe_product_id?: string | null;
        stripe_price_id?: string | null;
        version?: number | null;
    } | null;
}

interface PaymentPlanSubscriberDto {
    id: string;
    email?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    name?: string | null;
    slug?: string | null;
    contact_email?: string | null;
    subscription_status: SubscriptionStatus;
    plan_type: string;
    is_founding_account?: boolean | null;
}

const mapGenericCapability = (dto: GenericCapabilityDto | null | undefined): FeatureCapability | null => {
    if (!dto) {
        return null;
    }

    return {
        state: dto.state,
        limits: dto.limits ?? null,
    };
};

const mapInventoryManagementCapability = (
    dto: InventoryManagementCapabilityDto | null | undefined
): InventoryManagementCapability | null => {
    if (!dto) {
        return null;
    }

    return {
        state: dto.state,
        limits: {
            maxProductsWithInventory: dto.limits?.max_products_with_inventory ?? null,
            maxQuantityPerProduct: dto.limits?.max_quantity_per_product ?? null,
        },
    };
};

const mapCapabilities = (dto: FeatureCapabilitiesDto | null | undefined): FeatureCapabilities => {
    if (!dto) {
        return {};
    }

    return {
        inventoryManagement: mapInventoryManagementCapability(dto.inventory_management),
        basicAnalytics: mapGenericCapability(dto.basic_analytics),
        advancedAnalytics: mapGenericCapability(dto.advanced_analytics),
        teamManagement: mapGenericCapability(dto.team_management),
        customDomain: mapGenericCapability(dto.custom_domain),
        branding: mapGenericCapability(dto.branding),
        apiAccess: mapGenericCapability(dto.api_access),
    };
};

const mapPlanDtoToDomain = (dto: PaymentPlanDto): PaymentPlan => {
    return {
        id: dto.plan_code,
        planCode: dto.plan_code,
        scope: dto.scope,
        displayName: dto.display_name,
        subtitle: dto.subtitle ?? null,
        marketingMessage: dto.marketing_message ?? null,
        badgeText: dto.badge_text ?? null,
        featureList: dto.feature_list ?? [],
        quotas: {
            activeProducts: dto.quotas?.active_products ?? null,
            teamMembers: dto.quotas?.team_members ?? null,
        },
        capabilities: mapCapabilities(dto.capabilities),
        sortOrder: dto.sort_order,
        isActive: dto.is_active,
        isVisibleInCheckout: dto.is_visible_in_checkout,
        isCheckoutEnabled: dto.is_checkout_enabled,
        isManualAssignmentEnabled: dto.is_manual_assignment_enabled,
        price: {
            amount: dto.price?.amount ?? null,
            currency: dto.price?.currency ?? null,
            interval: dto.price?.interval ?? null,
            stripeProductId: dto.price?.stripe_product_id ?? null,
            stripePriceId: dto.price?.stripe_price_id ?? null,
            version: dto.price?.version ?? 0,
        },
    };
};

const mapSubscriberDtoToDomain = (dto: PaymentPlanSubscriberDto): PaymentPlanSubscriber => {
    return {
        id: dto.id,
        email: dto.email ?? null,
        firstName: dto.first_name ?? null,
        lastName: dto.last_name ?? null,
        name: dto.name ?? null,
        slug: dto.slug ?? null,
        contactEmail: dto.contact_email ?? null,
        subscriptionStatus: dto.subscription_status,
        planType: dto.plan_type,
        isFoundingAccount: dto.is_founding_account ?? null,
    };
};

export class ApiPaymentPlanRepository implements PaymentPlanRepository {
    private readonly apiClient: ApiClient;
    private readonly getSession: () => AuthSession | null;

    constructor(apiClient: ApiClient, getSession: () => AuthSession | null) {
        this.apiClient = apiClient;
        this.getSession = getSession;
    }

    private async authHeaders(): Promise<Record<string, string>> {
        const session = this.getSession();
        const authHeader = toAuthorizationHeader(session);

        return authHeader ? { Authorization: authHeader } : {};
    }

    async listPlans(scope: PaymentPlanScope, checkoutOnly = false): Promise<PaymentPlan[]> {
        const headers = await this.authHeaders();
        const endpoint = checkoutOnly ? "/api/billing/plans" : "/api/admin/payment-plans";
        const response = await this.apiClient.get<ApiListResponse<PaymentPlanDto>>(
            `${endpoint}?scope=${scope}`,
            { headers }
        );

        return response.data.map(mapPlanDtoToDomain);
    }

    async updatePlan(input: UpdatePaymentPlanInput): Promise<void> {
        const headers = await this.authHeaders();

        await this.apiClient.patch<void>(
            `/api/admin/payment-plans/${input.planCode}`,
            {
                plan_code: input.planCode,
                display_name: input.displayName,
                subtitle: input.subtitle,
                marketing_message: input.marketingMessage,
                badge_text: input.badgeText,
                feature_list: input.featureList,
                quotas: {
                    active_products: input.quotas.activeProducts,
                    team_members: input.quotas.teamMembers,
                },
                capabilities: {
                    inventory_management: input.capabilities.inventoryManagement
                        ? {
                              state: input.capabilities.inventoryManagement.state,
                              limits: {
                                  max_products_with_inventory:
                                      input.capabilities.inventoryManagement.limits.maxProductsWithInventory,
                                  max_quantity_per_product:
                                      input.capabilities.inventoryManagement.limits.maxQuantityPerProduct,
                              },
                          }
                        : { state: "disabled" },
                    basic_analytics: input.capabilities.basicAnalytics
                        ? {
                              state: input.capabilities.basicAnalytics.state,
                              limits: input.capabilities.basicAnalytics.limits ?? null,
                          }
                        : { state: "disabled" },
                    advanced_analytics: input.capabilities.advancedAnalytics
                        ? {
                              state: input.capabilities.advancedAnalytics.state,
                              limits: input.capabilities.advancedAnalytics.limits ?? null,
                          }
                        : { state: "disabled" },
                    team_management: input.capabilities.teamManagement
                        ? {
                              state: input.capabilities.teamManagement.state,
                              limits: input.capabilities.teamManagement.limits ?? null,
                          }
                        : { state: "disabled" },
                    api_access: input.capabilities.apiAccess
                        ? {
                              state: input.capabilities.apiAccess.state,
                              limits: input.capabilities.apiAccess.limits ?? null,
                          }
                        : { state: "disabled" },
                },
                sort_order: input.sortOrder,
                is_active: input.isActive,
                is_visible_in_checkout: input.isVisibleInCheckout,
                is_checkout_enabled: input.isCheckoutEnabled,
                is_manual_assignment_enabled: input.isManualAssignmentEnabled,
                price_amount: input.priceAmount,
                price_currency: input.priceCurrency,
                price_interval: input.priceInterval,
                stripe_product_id: input.stripeProductId,
            },
            {
                headers,
                skipParseJson: true,
            }
        );
    }

    async listSubscribers(scope: PaymentPlanScope, planCode: string): Promise<PaymentPlanSubscriber[]> {
        const headers = await this.authHeaders();
        const response = await this.apiClient.get<ApiListResponse<PaymentPlanSubscriberDto>>(
            `/api/admin/payment-plans/${scope}/${planCode}/subscribers`,
            { headers }
        );

        return response.data.map(mapSubscriberDtoToDomain);
    }

    async assignPlan(input: AssignPaymentPlanInput): Promise<void> {
        const headers = await this.authHeaders();

        await this.apiClient.post<void>(
            "/api/admin/payment-plans/assign",
            {
                scope: input.scope,
                plan_code: input.planCode,
                target_id: input.targetId,
                subscription_status: input.subscriptionStatus ?? null,
            },
            {
                headers,
                skipParseJson: true,
            }
        );
    }
}
