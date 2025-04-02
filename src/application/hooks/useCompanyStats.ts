
import { useState, useEffect } from 'react';
import { CompanyStats } from '@/domain/repositories/StatsRepository';
import { StatsService } from '@/application/services/StatsService';

export const useCompanyStats = (companyId: string = '1') => {
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const statsService = StatsService.getInstance();

  useEffect(() => {
    const loadStats = async () => {
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
    };

    loadStats();
  }, [companyId]);

  const loadStatsByPeriod = async (startDate: Date, endDate: Date) => {
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
  };

  return {
    stats,
    isLoading,
    error,
    loadStatsByPeriod
  };
};
