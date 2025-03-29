
/**
 * Company model representing product providers
 */
export interface Company {
  id: string;
  name: string;
  description: string;
  slug: string;
  fiscalId: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  categoryIds: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Form data structure for company creation/editing
 */
export interface CompanyFormData {
  name: string;
  description: string;
  slug: string;
  fiscalId: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  categoryIds: string[];
}
