import type { Address } from "@/domain/models/Address";
import type { Location } from "@/domain/models/Location";

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
