import type { Site } from "@/domain/models/Site";
import type { SiteRepository } from "@/domain/repositories/SiteRepository";

export class SiteService {
    constructor(private readonly siteRepository: SiteRepository) {}

    async getById(siteId: string): Promise<Site> {
        return this.siteRepository.getById(siteId);
    }

    async update(site: Site): Promise<void> {
        await this.siteRepository.update(site);
    }
}
