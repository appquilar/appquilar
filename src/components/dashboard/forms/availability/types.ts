
/**
 * Types related to product availability
 */

export interface TimeRange {
  id: string;
  startTime: string;  // Not optional to match Product model
  endTime: string;    // Not optional to match Product model
}

export type WeekdayId = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface WeekdayLabel {
  id: WeekdayId;
  label: string;
}

export const daysOfWeek: WeekdayLabel[] = [
  { id: 'monday', label: 'Lunes' },
  { id: 'tuesday', label: 'Martes' },
  { id: 'wednesday', label: 'Miércoles' },
  { id: 'thursday', label: 'Jueves' },
  { id: 'friday', label: 'Viernes' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' },
];

export type DaySchedules = Record<WeekdayId, TimeRange[]>;
