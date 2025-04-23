/**
 * Company user model representing a user with access to company features
 */
export interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: 'company_admin' | 'company_user';
  status: 'pending' | 'accepted' | 'expired' | 'active' | 'invited' | 'deactivated';
  dateAdded: string;
  companyId: string;
  imageUrl?: string;
}

/**
 * Invitation form data for inviting users to a company
 */
export interface UserInvitationFormData {
  email: string;
  role: 'company_admin' | 'company_user';
  companyId: string;
}
