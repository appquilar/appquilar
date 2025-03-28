
/**
 * Company user model representing a user with access to company features
 */
export interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: 'company_admin' | 'company_user';
  status: 'active' | 'invited' | 'deactivated';
  dateAdded: string;
}
