import type { Address } from "@/domain/models/Address";

export interface PublicCompanyLocation {
  city: string | null;
  state: string | null;
  country: string | null;
  displayLabel: string | null;
}

export interface PublicCompanyGeoLocation {
  latitude: number;
  longitude: number;
}

export interface PublicCompanyProfile {
  name: string;
  slug: string;
  description: string | null;
  profilePictureId: string | null;
  headerImageId: string | null;
  location: PublicCompanyLocation;
  address: Address | null;
  geoLocation: PublicCompanyGeoLocation | null;
}
