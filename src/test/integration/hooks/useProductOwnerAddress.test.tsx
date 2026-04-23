import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

import { useProductOwnerAddress } from "@/application/hooks/useProductOwnerAddress";

const useAuthMock = vi.fn();
const useCompanyProfileMock = vi.fn();

vi.mock("@/context/AuthContext", () => ({
    useAuth: () => useAuthMock(),
}));

vi.mock("@/application/hooks/useCompanyProfile", () => ({
    useCompanyProfile: (...args: unknown[]) => useCompanyProfileMock(...args),
}));

describe("useProductOwnerAddress", () => {
    it("uses the user address and config route when the user has no company", () => {
        useAuthMock.mockReturnValue({
            currentUser: {
                id: "user-1",
                address: {
                    street: "Calle Mayor 1",
                    street2: null,
                    city: "Madrid",
                    postalCode: "28001",
                    state: "Madrid",
                    country: "Espana",
                },
            },
            isLoading: false,
        });
        useCompanyProfileMock.mockReturnValue({
            data: undefined,
            isLoading: false,
        });

        const { result } = renderHook(() => useProductOwnerAddress());

        expect(result.current.ownerType).toBe("user");
        expect(result.current.address?.city).toBe("Madrid");
        expect(result.current.hasRequiredAddress).toBe(true);
        expect(result.current.settingsHref).toBe("/dashboard/config?tab=address");
    });

    it("uses the company address and company route when the user manages products as a company", () => {
        useAuthMock.mockReturnValue({
            currentUser: {
                id: "user-2",
                address: null,
                companyContext: {
                    companyId: "company-1",
                    companyName: "Herramientas Norte",
                    companyRole: "ROLE_ADMIN",
                    isCompanyOwner: true,
                },
            },
            isLoading: false,
        });
        useCompanyProfileMock.mockReturnValue({
            data: {
                id: "company-1",
                address: {
                    street: "Calle Industria 23",
                    street2: null,
                    city: "Barcelona",
                    postalCode: "08001",
                    state: "Barcelona",
                    country: "Espana",
                },
            },
            isLoading: false,
        });

        const { result } = renderHook(() => useProductOwnerAddress());

        expect(result.current.ownerType).toBe("company");
        expect(result.current.address?.city).toBe("Barcelona");
        expect(result.current.hasRequiredAddress).toBe(true);
        expect(result.current.settingsHref).toBe("/dashboard/companies/company-1");
    });
});
