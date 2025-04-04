
import { useState, useCallback } from 'react';
import { StatsService } from '@/application/services/StatsService';
import { MockStatsRepositoryFactory } from '@/infrastructure/repositories/MockStatsRepository';
import { ApiStatsRepositoryFactory } from '@/infrastructure/repositories/ApiStatsRepository';

type RepositoryType = 'mock' | 'api';

/**
 * Hook for managing stats repository configuration
 */
export const useStatsConfig = () => {
  const [currentType, setCurrentType] = useState<RepositoryType>('mock');
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('/api');
  
  // Switch to mock implementation
  const useMockRepository = useCallback(() => {
    StatsService.setRepositoryFactory(new MockStatsRepositoryFactory());
    setCurrentType('mock');
  }, []);
  
  // Switch to API implementation
  const useApiRepository = useCallback((baseUrl?: string) => {
    const url = baseUrl || apiBaseUrl;
    StatsService.setRepositoryFactory(new ApiStatsRepositoryFactory(url));
    setApiBaseUrl(url);
    setCurrentType('api');
  }, [apiBaseUrl]);
  
  // Update API base URL
  const updateApiBaseUrl = useCallback((url: string) => {
    setApiBaseUrl(url);
    if (currentType === 'api') {
      StatsService.setRepositoryFactory(new ApiStatsRepositoryFactory(url));
    }
  }, [currentType]);
  
  return {
    currentType,
    apiBaseUrl,
    useMockRepository,
    useApiRepository,
    updateApiBaseUrl
  };
};
