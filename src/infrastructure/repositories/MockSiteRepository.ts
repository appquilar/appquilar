
import { Site, SiteFormData } from '@/domain/models/Site';
import { SiteRepository } from '@/domain/repositories/SiteRepository';
import { MOCK_SITES } from '@/components/dashboard/sites/data/mockSites';
import { v4 as uuidv4 } from 'uuid';
import { SITE_CONFIG } from '@/domain/config/siteConfig';

/**
 * Mock implementation of SiteRepository that uses in-memory data
 */
export class MockSiteRepository implements SiteRepository {
  private sites: Site[] = [...MOCK_SITES];

  async getAllSites(): Promise<Site[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.sites];
  }

  async getSiteById(id: string): Promise<Site | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    const site = this.sites.find(s => s.id === id);
    return site ? { ...site } : null;
  }

  async createSite(siteData: SiteFormData): Promise<Site> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Enforce category limits
    const menuCategoryIds = siteData.menuCategoryIds.slice(0, SITE_CONFIG.MAX_MENU_CATEGORIES);
    const featuredCategoryIds = siteData.featuredCategoryIds.slice(0, SITE_CONFIG.MAX_FEATURED_CATEGORIES);
    
    const newSite: Site = {
      id: uuidv4(),
      ...siteData,
      menuCategoryIds,
      featuredCategoryIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.sites.push(newSite);
    return { ...newSite };
  }

  async updateSite(id: string, siteData: SiteFormData): Promise<Site> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Enforce category limits
    const menuCategoryIds = siteData.menuCategoryIds.slice(0, SITE_CONFIG.MAX_MENU_CATEGORIES);
    const featuredCategoryIds = siteData.featuredCategoryIds.slice(0, SITE_CONFIG.MAX_FEATURED_CATEGORIES);
    
    const index = this.sites.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Site with ID ${id} not found`);
    }
    
    const updatedSite: Site = {
      ...this.sites[index],
      ...siteData,
      menuCategoryIds,
      featuredCategoryIds,
      updatedAt: new Date().toISOString()
    };
    
    this.sites[index] = updatedSite;
    return { ...updatedSite };
  }

  async deleteSite(id: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const initialLength = this.sites.length;
    this.sites = this.sites.filter(s => s.id !== id);
    return this.sites.length < initialLength;
  }
}
