
/**
 * Helper functions for date manipulation
 */

/**
 * Format a date to ISO string (YYYY-MM-DD)
 */
export const formatToISODate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Format a date to local date string (DD/MM/YYYY)
 */
export const formatToLocalDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Parse a local date string (DD/MM/YYYY) to a Date object
 */
export const parseLocalDate = (dateStr: string): Date => {
  const parts = dateStr.split('/');
  return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
};

/**
 * Check if a date is between two dates (inclusive)
 */
export const isDateBetween = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date <= endDate;
};

/**
 * Get an array of date strings between two dates
 */
export const getDateRangeArray = (startDate: Date, endDate: Date): string[] => {
  const dates = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(formatToISODate(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

/**
 * Check if a date is in an array of date strings
 */
export const isDateInArray = (date: Date, dateArray: string[]): boolean => {
  const dateString = formatToISODate(date);
  return dateArray.includes(dateString);
};
