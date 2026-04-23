type ProductPriceTierLike = {
    daysFrom?: number;
    daysTo?: number;
    pricePerDay?: number;
};

type ProductPriceLike = {
    daily?: number;
    tiers?: ProductPriceTierLike[];
};

export interface VisibleProductDailyPricing {
    amount: number | null;
    daysFrom: number | null;
    daysTo?: number;
    isFromLaterTier: boolean;
}

const isPositiveNumber = (value: unknown): value is number =>
    typeof value === "number" && Number.isFinite(value) && value > 0;

export const getVisibleProductDailyPricing = (
    price?: ProductPriceLike | null
): VisibleProductDailyPricing => {
    const tiers = Array.isArray(price?.tiers) ? [...price.tiers] : [];
    const firstPositiveTier = tiers
        .sort((left, right) => Number(left.daysFrom ?? Number.MAX_SAFE_INTEGER) - Number(right.daysFrom ?? Number.MAX_SAFE_INTEGER))
        .find((tier) => isPositiveNumber(Number(tier.pricePerDay ?? 0)));

    if (firstPositiveTier && isPositiveNumber(Number(firstPositiveTier.pricePerDay))) {
        const daysFrom = Number(firstPositiveTier.daysFrom ?? 1);

        return {
            amount: Number(firstPositiveTier.pricePerDay),
            daysFrom,
            daysTo: firstPositiveTier.daysTo,
            isFromLaterTier: daysFrom > 1,
        };
    }

    const fallbackDaily = Number(price?.daily ?? 0);
    if (isPositiveNumber(fallbackDaily)) {
        return {
            amount: fallbackDaily,
            daysFrom: 1,
            isFromLaterTier: false,
        };
    }

    return {
        amount: null,
        daysFrom: null,
        isFromLaterTier: false,
    };
};
