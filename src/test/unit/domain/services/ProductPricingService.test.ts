import { describe, expect, it } from "vitest";

import { getVisibleProductDailyPricing } from "@/domain/services/ProductPricingService";

describe("ProductPricingService", () => {
    it("returns the first tier with a positive configured price", () => {
        expect(
            getVisibleProductDailyPricing({
                daily: 0,
                tiers: [
                    {
                        daysFrom: 1,
                        daysTo: 3,
                        pricePerDay: 0,
                    },
                    {
                        daysFrom: 4,
                        pricePerDay: 24.5,
                    },
                ],
            })
        ).toEqual({
            amount: 24.5,
            daysFrom: 4,
            daysTo: undefined,
            isFromLaterTier: true,
        });
    });

    it("falls back to the daily price when no priced tier exists", () => {
        expect(
            getVisibleProductDailyPricing({
                daily: 18,
                tiers: [],
            })
        ).toEqual({
            amount: 18,
            daysFrom: 1,
            isFromLaterTier: false,
        });
    });

    it("returns null when every visible price requires consultation", () => {
        expect(
            getVisibleProductDailyPricing({
                daily: 0,
                tiers: [
                    {
                        daysFrom: 1,
                        pricePerDay: 0,
                    },
                ],
            })
        ).toEqual({
            amount: null,
            daysFrom: null,
            isFromLaterTier: false,
        });
    });
});
