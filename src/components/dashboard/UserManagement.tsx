
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/application/hooks/useUsers';
import UserManagementHeader from './user-management/UserManagementHeader';
import UserSearchForm from './user-management/UserSearchForm';
import UserTable from './user-management/UserTable';
import ResultsCount from './user-management/ResultsCount';
import AccessRestricted from './user-management/AccessRestricted';

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
      <UserManagementHeader onInvite={handleInviteUser} />
      
      <UserSearchForm 
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        onSubmit={handleSearch}
      />
      
      <UserTable 
        users={filteredUsers}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />
      
      <ResultsCount filteredUsers={filteredUsers} />
    </div>
  );
};

export default UserManagement;
