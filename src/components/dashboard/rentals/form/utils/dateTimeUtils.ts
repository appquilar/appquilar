
import { format } from 'date-fns';

/**
 * Formats a date for display
 */
export const formatDate = (date: Date): string => {
  return format(date, 'dd/MM/yyyy');
};

/**
 * Formats a time for display
 */
export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

/**
 * Handles hour selection for a date
 */
export const handleHourChange = (field: any, date: Date, hour: string) => {
  const [h, m] = hour.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(h, m);
  field.onChange(newDate);
};

/**
 * Creates time options for select in 15-minute increments
 */
export const generateTimeOptions = (): string[] => {
  return Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });
};
