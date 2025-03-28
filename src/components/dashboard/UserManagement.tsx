
import { useAuth } from '@/context/AuthContext';
import { useUserManagement } from '@/application/hooks/useUserManagement';
import UserManagementHeader from './user-management/UserManagementHeader';
import UserSearchForm from './user-management/UserSearchForm';
import UserTable from './user-management/UserTable';
import ResultsCount from './user-management/ResultsCount';
import AccessRestricted from './user-management/AccessRestricted';

const UserManagement = () => {
  const { user } = useAuth();
  const {
    searchQuery,
    setSearchQuery,
    filteredUsers,
    handleSearch,
    handleInviteUser,
    handleEditUser,
    handleDeleteUser
  } = useUserManagement();
  
  // Check if the current user is a company admin
  if (user?.role !== 'company_admin') {
    return <AccessRestricted />;
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
