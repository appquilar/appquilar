
import { useState, useEffect } from 'react';
import { Company } from '@/domain/models/Company';
import { CompanyService } from '@/application/services/CompanyService';

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const companyService = CompanyService.getInstance();

  useEffect(() => {
    const loadCompanies = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const allCompanies = await companyService.getAllCompanies();
        setCompanies(allCompanies);
      } catch (err) {
        console.error('Error loading companies:', err);
        setError('Error al cargar empresas');
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanies();
  }, []);

  const getCompanyById = async (id: string) => {
    try {
      return await companyService.getCompanyById(id);
    } catch (err) {
      console.error(`Error fetching company with ID ${id}:`, err);
      throw err;
    }
  };

  const createCompany = async (companyData: any) => {
    try {
      const newCompany = await companyService.createCompany(companyData);
      setCompanies(prev => [...prev, newCompany]);
      return newCompany;
    } catch (err) {
      console.error('Error creating company:', err);
      throw err;
    }
  };

  const updateCompany = async (id: string, companyData: any) => {
    try {
      const updatedCompany = await companyService.updateCompany(id, companyData);
      setCompanies(prev => prev.map(company => 
        company.id === id ? updatedCompany : company
      ));
      return updatedCompany;
    } catch (err) {
      console.error(`Error updating company with ID ${id}:`, err);
      throw err;
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      const success = await companyService.deleteCompany(id);
      if (success) {
        setCompanies(prev => prev.filter(company => company.id !== id));
      }
      return success;
    } catch (err) {
      console.error(`Error deleting company with ID ${id}:`, err);
      throw err;
    }
  };

  return {
    companies,
    isLoading,
    error,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany
  };
};
