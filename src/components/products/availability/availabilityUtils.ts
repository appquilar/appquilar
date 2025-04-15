
import { format, isWithinInterval, parseISO, isWeekend } from 'date-fns';
import { AvailabilityPeriod } from '@/domain/models/Product';

/**
 * Check if a date is within any of the available periods
 */
export const isDateAvailable = (
  date: Date, 
  availabilityPeriods: AvailabilityPeriod[] = [], 
  isAlwaysAvailable: boolean = false,
  unavailableDates: string[] = []
): boolean => {
  // If product is marked as always available, all future dates are available
  if (isAlwaysAvailable) {
    return date >= new Date(new Date().setHours(0, 0, 0, 0));
  }
  
  // Check if the date is in the unavailable dates list
  if (unavailableDates && unavailableDates.includes(format(date, 'yyyy-MM-dd'))) {
    return false;
  }
  
  return availabilityPeriods.some(period => {
    if (period.status !== 'available') return false;
    
    const start = parseISO(period.startDate);
    const end = parseISO(period.endDate);
    
    // Check if the date is a weekend and if weekends are excluded
    if (isWeekend(date) && !period.includeWeekends) return false;
    
    return isWithinInterval(date, { start, end });
  });
};

/**
 * Check if a date is within any of the unavailable periods
 */
export const isDateUnavailable = (
  date: Date, 
  availabilityPeriods: AvailabilityPeriod[] = [], 
  isAlwaysAvailable: boolean = false,
  unavailableDates: string[] = []
): boolean => {
  // If product is marked as always available, no dates are unavailable
  if (isAlwaysAvailable) return false;
  
  // Check if the date is in the unavailable dates list
  if (unavailableDates && unavailableDates.includes(format(date, 'yyyy-MM-dd'))) {
    return true;
  }
  
  return availabilityPeriods.some(period => {
    if (period.status === 'available') return false;
    
    const start = parseISO(period.startDate);
    const end = parseISO(period.endDate);
    
    return isWithinInterval(date, { start, end });
  });
};
