
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/application/hooks/useUsers';
import UserManagementHeader from './user-management/UserManagementHeader';
import UserSearchForm from './user-management/UserSearchForm';
import UserTable from './user-management/UserTable';
import ResultsCount from './user-management/ResultsCount';
import AccessRestricted from './user-management/AccessRestricted';
import { CompanyUser } from '@/domain/models/CompanyUser';

const UserManagement = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const {
    users,
    isLoading,
    error,
    handleEditUser,
    handleDeleteUser,
    handleInviteUser
  } = useUsers();
  
  // Check if the current user is a company admin
  if (user?.role !== 'company_admin') {
    return <AccessRestricted />;
  }
  
  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // This is handled by the filter above, no need for API call
  };

  const onInviteUser = () => {
    // This would open a modal in a real app
    const newUserData: Partial<CompanyUser> = {
      email: 'newuser@example.com',
      role: 'company_user',
      status: 'invited',
      companyId: '1'
    };
    handleInviteUser(newUserData);
  };

  const onEditUser = (userId: string) => {
    // This would open a modal in a real app with the user's data
    const userData: Partial<CompanyUser> = {
      name: `Updated Name ${Date.now()}`
    };
    handleEditUser(userId, userData);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-destructive/10 text-destructive">
        {error}
      </div>
    );
  }
  
  return (
    <div className="space-y-6 max-w-full">
      <UserManagementHeader onInvite={onInviteUser} />
      
      <UserSearchForm 
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        onSubmit={handleSearch}
      />
      
      <UserTable 
        users={filteredUsers}
        onEdit={onEditUser}
        onDelete={handleDeleteUser}
      />
      
      <ResultsCount filteredUsers={filteredUsers} />
    </div>
  );
};

export default UserManagement;
