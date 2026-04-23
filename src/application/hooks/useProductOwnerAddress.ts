import { useMemo } from "react";

import { useCompanyProfile } from "@/application/hooks/useCompanyProfile";
import type { Address } from "@/domain/models/Address";
import { hasMinimalAddress } from "@/domain/models/Address";
import { getUserCompanyId } from "@/domain/models/User";
import { useAuth } from "@/context/AuthContext";

type ProductOwnerType = "company" | "user";

type ProductOwnerAddressState = {
    ownerType: ProductOwnerType;
    address: Address | null;
    companyId: string | null;
    hasRequiredAddress: boolean;
    isLoading: boolean;
    settingsHref: string;
};

export const useProductOwnerAddress = (): ProductOwnerAddressState => {
    const { currentUser, isLoading: isAuthLoading } = useAuth();
    const companyId = getUserCompanyId(currentUser);
    const companyProfileQuery = useCompanyProfile(companyId);

    return useMemo(() => {
        const ownerType: ProductOwnerType = companyId ? "company" : "user";
        const address =
            ownerType === "company"
                ? companyProfileQuery.data?.address ?? null
                : currentUser?.address ?? null;
        const isLoading = isAuthLoading || (ownerType === "company" && companyProfileQuery.isLoading);

        return {
            ownerType,
            address,
            companyId,
            hasRequiredAddress: hasMinimalAddress(address),
            isLoading,
            settingsHref:
                ownerType === "company" && companyId
                    ? `/dashboard/companies/${companyId}`
                    : "/dashboard/config?tab=address",
        };
    }, [
        companyId,
        companyProfileQuery.data?.address,
        companyProfileQuery.isLoading,
        currentUser?.address,
        isAuthLoading,
    ]);
};
