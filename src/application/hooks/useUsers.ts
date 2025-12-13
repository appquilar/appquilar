
import { useState, useEffect } from 'react';
import { User, UserInvitationFormData } from '@/domain/models/User.ts';
import { UserService } from '@/application/services/UserService';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userService = UserService.getCurrentUser();

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const allUsers = await userService.getAllUsers();
        setUsers(allUsers || []); // Ensure we always have an array
      } catch (err) {
        console.error('Error loading users:', err);
        setError('Error al cargar usuarios');
        setUsers([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleEditUser = async (userId: string, userData: Partial<User>) => {
    try {
      const updatedUser = await userService.updateUser(userId, userData);
      setUsers(prev => prev.map(user => user.id === userId ? updatedUser : user));
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const success = await userService.deleteUser(userId);
      if (success) {
        setUsers(prev => prev.filter(user => user.id !== userId));
      }
      return success;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const handleInviteUser = async (userData: UserInvitationFormData): Promise<User> => {
    try {
      const newUser = await userService.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (error) {
      console.error('Error inviting user:', error);
      throw error;
    }
  };

  return {
    users,
    isLoading,
    error,
    handleEditUser,
    handleDeleteUser,
    handleInviteUser
  };
};
