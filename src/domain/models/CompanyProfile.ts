import type { Address } from "@/domain/models/Address";
import type { Location } from "@/domain/models/Location";
import type { CompanyPlanType, SubscriptionStatus } from "@/domain/models/Subscription";

export interface CompanyPhoneNumber {
    countryCode: string;
    prefix: string;
    number: string;
}

export interface CompanyProfile {
    id: string;
    ownerId: string | null;
    name: string;
    slug: string;
    description: string | null;
    fiscalIdentifier: string | null;
    contactEmail: string | null;
    phoneNumber: CompanyPhoneNumber | null;
    address: Address | null;
    location: Location | null;
    planType?: CompanyPlanType | null;
    subscriptionStatus?: SubscriptionStatus | null;
    isFoundingAccount?: boolean | null;
}

export interface UpdateCompanyProfileInput {
    companyId: string;
    name: string;
    slug: string;
    description?: string | null;
    fiscalIdentifier?: string | null;
    contactEmail?: string | null;
    phoneNumber?: CompanyPhoneNumber | null;
    address?: Address | null;
    location?: Location | null;
}
