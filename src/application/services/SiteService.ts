
import { Site, SiteFormData } from '@/domain/models/Site';
import { SiteRepository } from '@/domain/repositories/SiteRepository';
import { MockSiteRepository } from '@/infrastructure/repositories/MockSiteRepository';

/**
 * Service for managing site data
 */
export class SiteService {
  private static instance: SiteService;
  private repository: SiteRepository;

  private constructor(repository: SiteRepository) {
    this.repository = repository;
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): SiteService {
    if (!SiteService.instance) {
      // Using the mock repository for now
      // This can be changed to use ApiSiteRepository when ready
      const repository = new MockSiteRepository();
      SiteService.instance = new SiteService(repository);
    }
    return SiteService.instance;
  }

  /**
   * Set a custom repository implementation
   * Useful for testing or switching between mock and API
   */
  public static setRepository(repository: SiteRepository): void {
    if (SiteService.instance) {
      SiteService.instance.repository = repository;
    } else {
      SiteService.instance = new SiteService(repository);
    }
  }

  /**
   * Get all sites
   */
  async getAllSites(): Promise<Site[]> {
    return this.repository.getAllSites();
  }

  /**
   * Get a site by ID
   */
  async getSiteById(id: string): Promise<Site | null> {
    return this.repository.getSiteById(id);
  }

  /**
   * Create a new site
   */
  async createSite(siteData: SiteFormData): Promise<Site> {
    return this.repository.createSite(siteData);
  }

  /**
   * Update an existing site
   */
  async updateSite(id: string, siteData: SiteFormData): Promise<Site> {
    return this.repository.updateSite(id, siteData);
  }

  /**
   * Delete a site
   */
  async deleteSite(id: string): Promise<boolean> {
    return this.repository.deleteSite(id);
  }
}
