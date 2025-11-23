import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MockUserSettingsRepository } from '@/infrastructure/repositories/MockUserSettingsRepository';

/**
 * Hook to check if user has configured their address
 */
export const useUserAddress = () => {
  const { user } = useAuth();
  const [hasAddress, setHasAddress] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAddress = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const repository = new MockUserSettingsRepository();
        const settings = await repository.getUserSettingsByUserId(user.id);
        
        const addressExists = !!(
          settings?.address?.street ||
          settings?.address?.city ||
          settings?.address?.country
        );
        
        setHasAddress(addressExists);
      } catch (error) {
        console.error('Error checking address:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAddress();
  }, [user?.id]);

  return { hasAddress, isLoading };
};
