
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { MOCK_STATS } from './statsData';

export interface DataPoint {
  day: string;
  [key: string]: any;
}

// Function to generate data for all days in the month
export const generateCompleteMonthData = (date: Date, dataKey: string, baseData: DataPoint[]): DataPoint[] => {
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date)
  });
  
  // Create an array with entries for all days in the month
  return daysInMonth.map(day => {
    const dayStr = format(day, 'dd');
    // Find existing data for this day or create new entry with zero value
    const existingData = baseData.find(item => item.day === dayStr);
    if (existingData) {
      return existingData;
    } else {
      const newPoint: DataPoint = { day: dayStr };
      newPoint[dataKey] = 0;
      return newPoint;
    }
  });
};

// Function to filter data for the selected month
export const filterDataForMonth = (data: DataPoint[], date: Date, dataKey: string): DataPoint[] => {
  // In a real app, this would filter data from an API call based on the month
  // For mock data, we'll simulate it by shifting values randomly
  const transformedData = data.map(item => {
    const randomFactor = 0.7 + Math.random() * 0.6; // between 0.7 and 1.3
    const value = Number(item[Object.keys(item).find(key => key !== 'day') as string]);
    return {
      ...item,
      [Object.keys(item).find(key => key !== 'day') as string]: Math.round(value * randomFactor)
    };
  });
  
  // Ensure we have data for all days in the month
  return generateCompleteMonthData(date, dataKey, transformedData);
};

// Ensures data is never undefined or empty
export const ensureValidData = (data: DataPoint[] | undefined, currentDataKey: string): DataPoint[] => {
  if (!data || data.length === 0) {
    return currentDataKey === 'views' ? MOCK_STATS.monthlyViews : MOCK_STATS.monthlyRentals;
  }
  return data;
};
