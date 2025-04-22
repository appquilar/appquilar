
import { useState } from 'react';
import { toast } from 'sonner';
import { CompanyUser } from '@/domain/models/CompanyUser';
import { MOCK_USERS } from '@/infrastructure/services/mockData/companyUserMockData';

export const useUserManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter users based on search query with null checks
  const filteredUsers = MOCK_USERS.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (user?.name?.toLowerCase() || '').includes(query) ||
      (user?.email?.toLowerCase() || '').includes(query)
    );
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we might call an API endpoint here
  };
  
  const handleInviteUser = () => {
    toast.info("User invitation form would open here");
  };
  
  const handleEditUser = (userId: string) => {
    toast.info(`Editing user ${userId}`);
  };
  
  const handleDeleteUser = (userId: string) => {
    toast.success(`User ${userId} removed from company`);
  };
  
  return {
    searchQuery,
    setSearchQuery,
    filteredUsers,
    handleSearch,
    handleInviteUser,
    handleEditUser,
    handleDeleteUser
  };
};
