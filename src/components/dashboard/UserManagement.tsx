
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/application/hooks/useUsers';
import UserManagementHeader from './user-management/UserManagementHeader';
import UserSearchForm from './user-management/UserSearchForm';
import UserTable from './user-management/UserTable';
import ResultsCount from './user-management/ResultsCount';
import AccessRestricted from './user-management/AccessRestricted';
import InviteUserModal from './user-management/InviteUserModal';
import { toast } from 'sonner';

const UserManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const {
    users,
    isLoading,
    error,
    handleDeleteUser,
    handleInviteUser
  } = useUsers();
  
  if (user?.role !== 'company_admin') {
    return <AccessRestricted />;
  }
  
  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (user?.name?.toLowerCase() || '').includes(query) ||
      (user?.email?.toLowerCase() || '').includes(query) ||
      (user?.role?.toLowerCase() || '').includes(query)
    );
  });

  const onEditUser = (userId: string) => {
    navigate(`/dashboard/users/${userId}`);
  };

  const onViewUserProducts = (userId: string) => {
    navigate(`/dashboard/users/${userId}/products`);
  };

  const handleInviteSubmit = async (email: string, message: string) => {
    try {
      await handleInviteUser({
        email,
        role: 'company_user',
        companyId: '1'
      });
      toast.success('Invitación enviada correctamente');
    } catch (error) {
      toast.error('Error al enviar la invitación');
    }
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
      <UserManagementHeader onInvite={() => setIsInviteModalOpen(true)} />
      
      <UserSearchForm 
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        onSubmit={(e) => e.preventDefault()}
      />
      
      <UserTable 
        users={filteredUsers}
        onEdit={onEditUser}
        onDelete={handleDeleteUser}
        onViewProducts={onViewUserProducts}
      />
      
      <ResultsCount filteredUsers={filteredUsers} />

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInviteSubmit}
      />
    </div>
  );
};

export default UserManagement;
