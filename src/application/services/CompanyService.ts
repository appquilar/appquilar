
import { Company, CompanyFormData } from '@/domain/models/Company';
import { CompanyRepository } from '@/domain/repositories/CompanyRepository';
import { MockCompanyRepository } from '@/infrastructure/repositories/MockCompanyRepository';

/**
 * Service for managing company data
 */
export class CompanyService {
  private static instance: CompanyService;
  private repository: CompanyRepository;

  private constructor(repository: CompanyRepository) {
    this.repository = repository;
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): CompanyService {
    if (!CompanyService.instance) {
      // Using the mock repository for now
      const repository = new MockCompanyRepository();
      CompanyService.instance = new CompanyService(repository);
    }
    return CompanyService.instance;
  }

  /**
   * Set a custom repository implementation
   */
  public static setRepository(repository: CompanyRepository): void {
    if (CompanyService.instance) {
      CompanyService.instance.repository = repository;
    } else {
      CompanyService.instance = new CompanyService(repository);
    }
  }

  /**
   * Get all companies
   */
  async getAllCompanies(): Promise<Company[]> {
    return this.repository.getAllCompanies();
  }

  /**
   * Get a company by ID
   */
  async getCompanyById(id: string): Promise<Company | null> {
    return this.repository.getCompanyById(id);
  }

  /**
   * Get companies by category ID
   */
  async getCompaniesByCategoryId(categoryId: string): Promise<Company[]> {
    return this.repository.getCompaniesByCategoryId(categoryId);
  }

  /**
   * Create a new company
   */
  async createCompany(companyData: CompanyFormData): Promise<Company> {
    return this.repository.createCompany(companyData);
  }

  /**
   * Update a company
   */
  async updateCompany(id: string, companyData: CompanyFormData): Promise<Company> {
    return this.repository.updateCompany(id, companyData);
  }

  /**
   * Delete a company
   */
  async deleteCompany(id: string): Promise<boolean> {
    return this.repository.deleteCompany(id);
  }
}
