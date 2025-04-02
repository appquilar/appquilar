
import { Company, CompanyFormData } from '@/domain/models/Company';
import { CompanyRepository } from '@/domain/repositories/CompanyRepository';
import { MOCK_COMPANIES } from '@/components/dashboard/companies/data/mockCompanies';

/**
 * Mock implementation of the CompanyRepository interface
 */
export class MockCompanyRepository implements CompanyRepository {
  private companies: Company[] = [...MOCK_COMPANIES];

  async getAllCompanies(): Promise<Company[]> {
    return Promise.resolve([...this.companies]);
  }

  async getCompanyById(id: string): Promise<Company | null> {
    const company = this.companies.find(company => company.id === id);
    return Promise.resolve(company || null);
  }

  async getCompaniesByCategoryId(categoryId: string): Promise<Company[]> {
    const filtered = this.companies.filter(company => 
      company.categoryIds.includes(categoryId)
    );
    return Promise.resolve(filtered);
  }

  async createCompany(companyData: CompanyFormData): Promise<Company> {
    const newCompany: Company = {
      id: `company-${Date.now()}`,
      ...companyData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.companies.push(newCompany);
    return Promise.resolve(newCompany);
  }

  async updateCompany(id: string, companyData: CompanyFormData): Promise<Company> {
    const index = this.companies.findIndex(company => company.id === id);
    if (index === -1) {
      throw new Error(`Company with id ${id} not found`);
    }
    
    const updatedCompany: Company = {
      ...this.companies[index],
      ...companyData,
      updatedAt: new Date().toISOString()
    };
    
    this.companies[index] = updatedCompany;
    return Promise.resolve(updatedCompany);
  }

  async deleteCompany(id: string): Promise<boolean> {
    const initialLength = this.companies.length;
    this.companies = this.companies.filter(company => company.id !== id);
    return Promise.resolve(this.companies.length !== initialLength);
  }
}
