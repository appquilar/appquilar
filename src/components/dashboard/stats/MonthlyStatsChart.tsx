
import { useState } from 'react';
import { subMonths, addMonths } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import LineChartDisplay from './LineChartDisplay';
import ChartDateControls from './ChartDateControls';
import { 
  ensureValidData, 
  filterDataForMonth, 
  generateCompleteMonthData, 
  DataPoint 
} from './ChartDateUtils';

interface MonthlyStatsChartProps {
  title: string;
  description: string;
  data: DataPoint[];
  dataKey: string;
  chartColor: string;
  label: string;
  config: Record<string, any>;
}

const MonthlyStatsChart = ({ 
  title, 
  description, 
  data, 
  dataKey, 
  chartColor, 
  label,
  config
}: MonthlyStatsChartProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  // Initialize with complete month data
  const [chartData, setChartData] = useState<DataPoint[]>(
    generateCompleteMonthData(
      currentDate, 
      dataKey, 
      ensureValidData(data, dataKey)
    )
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const prevMonth = subMonths(currentDate, 1);
    setCurrentDate(prevMonth);
    setChartData(filterDataForMonth(ensureValidData(data, dataKey), prevMonth, dataKey));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    const nextMonth = addMonths(currentDate, 1);
    setCurrentDate(nextMonth);
    setChartData(filterDataForMonth(ensureValidData(data, dataKey), nextMonth, dataKey));
  };
  
  // Handle month selection from calendar
  const handleSelectMonth = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
      setChartData(filterDataForMonth(ensureValidData(data, dataKey), date, dataKey));
      setCalendarOpen(false);
    }
  };
  
  return (
    <div className="w-full h-full">
      <div className={isMobile ? "flex flex-col space-y-3" : "flex flex-row items-start justify-between"}>
        <div className="invisible" aria-hidden="true">
          {/* Hidden placeholder to maintain layout */}
        </div>
        <ChartDateControls
          currentDate={currentDate}
          onPrevMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onSelectMonth={handleSelectMonth}
          calendarOpen={calendarOpen}
          setCalendarOpen={setCalendarOpen}
          isMobile={isMobile}
        />
      </div>
      <LineChartDisplay
        data={chartData}
        dataKey={dataKey}
        chartColor={chartColor}
        isMobile={isMobile}
      />
    </div>
  );
};

export default MonthlyStatsChart;
