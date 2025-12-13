import type { Site } from "@/domain/models/Site";

export interface SiteRepository {
    getById(siteId: string): Promise<Site>;
    update(site: Site): Promise<void>;
}
