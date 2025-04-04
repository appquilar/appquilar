
import { useState, useEffect, useCallback } from 'react';
import { CompanyStats } from '@/domain/repositories/StatsRepository';
import { StatsService } from '@/application/services/StatsService';
import { ApiStatsRepositoryFactory } from '@/infrastructure/repositories/ApiStatsRepository';

/**
 * Custom hook for fetching and managing company statistics
 */
export const useCompanyStats = (companyId: string = '1') => {
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const statsService = StatsService.getInstance();

  // Function to switch to API implementation
  const switchToApiImplementation = useCallback((apiBaseUrl: string = '/api') => {
    StatsService.setRepositoryFactory(new ApiStatsRepositoryFactory(apiBaseUrl));
  }, []);

  // Function to load stats data
  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const companyStats = await statsService.getCompanyStats(companyId);
      setStats(companyStats);
    } catch (err) {
      console.error('Error loading company stats:', err);
      setError('Error al cargar estadísticas');
    } finally {
      setIsLoading(false);
    }
  }, [companyId, statsService]);

  // Load stats on component mount or when companyId changes
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Function to load stats for a specific period
  const loadStatsByPeriod = useCallback(async (startDate: Date, endDate: Date) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const periodStats = await statsService.getStatsByPeriod(companyId, startDate, endDate);
      setStats(periodStats);
      return periodStats;
    } catch (err) {
      console.error('Error loading period stats:', err);
      setError('Error al cargar estadísticas del período');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [companyId, statsService]);

  // Function to reload stats
  const refreshStats = useCallback(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    isLoading,
    error,
    loadStatsByPeriod,
    refreshStats,
    switchToApiImplementation
  };
};
