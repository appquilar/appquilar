
/**
 * Formats a Date object to ISO date string (YYYY-MM-DD)
 */
export const formatToISODate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
