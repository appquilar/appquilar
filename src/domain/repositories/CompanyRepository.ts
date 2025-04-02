
import { Company, CompanyFormData } from '../models/Company';

/**
 * Repository interface for accessing and managing Company data
 */
export interface CompanyRepository {
  /**
   * Get all companies
   */
  getAllCompanies(): Promise<Company[]>;
  
  /**
   * Get a company by ID
   */
  getCompanyById(id: string): Promise<Company | null>;
  
  /**
   * Get companies by category ID
   */
  getCompaniesByCategoryId(categoryId: string): Promise<Company[]>;
  
  /**
   * Create a new company
   */
  createCompany(companyData: CompanyFormData): Promise<Company>;
  
  /**
   * Update an existing company
   */
  updateCompany(id: string, companyData: CompanyFormData): Promise<Company>;
  
  /**
   * Delete a company
   */
  deleteCompany(id: string): Promise<boolean>;
}
