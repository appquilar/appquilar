
import { Site, SiteFormData } from '../models/Site';

/**
 * Repository interface for accessing and managing Site data
 */
export interface SiteRepository {
  /**
   * Get all sites
   */
  getAllSites(): Promise<Site[]>;
  
  /**
   * Get a site by ID
   */
  getSiteById(id: string): Promise<Site | null>;
  
  /**
   * Create a new site
   */
  createSite(siteData: SiteFormData): Promise<Site>;
  
  /**
   * Update an existing site
   */
  updateSite(id: string, siteData: SiteFormData): Promise<Site>;
  
  /**
   * Delete a site
   */
  deleteSite(id: string): Promise<boolean>;
}
