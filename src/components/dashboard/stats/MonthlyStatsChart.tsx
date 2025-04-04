
import { useState } from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle, Card } from '@/components/ui/card';
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { MOCK_STATS } from './statsData';

interface DataPoint {
  day: string;
  [key: string]: any;
}

interface MonthlyStatsChartProps {
  title: string;
  description: string;
  data: DataPoint[];
  dataKey: string;
  chartColor: string;
  label: string;
  config: Record<string, any>;
}

// Custom tooltip component for the charts
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = payload[0].value;
    const name = payload[0].name;
    
    return (
      <div className="bg-background border border-border rounded-md shadow-md p-2 text-xs">
        <p className="font-medium">Día {data.day}</p>
        <p className="text-foreground">
          {name === 'views' ? 'Vistas' : 'Alquileres'}: <span className="font-medium">{value}</span>
        </p>
      </div>
    );
  }

  return null;
};

// Function to filter data for the selected month
const filterDataForMonth = (data: DataPoint[], date: Date): DataPoint[] => {
  const monthStr = format(date, 'MM');
  // In a real app, this would filter data from an API call based on the month
  // For mock data, we'll simulate it by shifting values randomly
  return data.map(item => {
    const randomFactor = 0.7 + Math.random() * 0.6; // between 0.7 and 1.3
    const value = Number(item[Object.keys(item).find(key => key !== 'day') as string]);
    return {
      ...item,
      [Object.keys(item).find(key => key !== 'day') as string]: Math.round(value * randomFactor)
    };
  });
};

// Ensures data is never undefined or empty
const ensureValidData = (data: DataPoint[] | undefined, currentDataKey: string): DataPoint[] => {
  if (!data || data.length === 0) {
    return currentDataKey === 'views' ? MOCK_STATS.monthlyViews : MOCK_STATS.monthlyRentals;
  }
  return data;
};

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
  const [chartData, setChartData] = useState<DataPoint[]>(ensureValidData(data, dataKey));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Generate days in current month for display
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    const prevMonth = subMonths(currentDate, 1);
    setCurrentDate(prevMonth);
    setChartData(filterDataForMonth(ensureValidData(data, dataKey), prevMonth));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    const nextMonth = addMonths(currentDate, 1);
    setCurrentDate(nextMonth);
    setChartData(filterDataForMonth(ensureValidData(data, dataKey), nextMonth));
  };
  
  // Handle month selection from calendar
  const handleSelectMonth = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
      setChartData(filterDataForMonth(ensureValidData(data, dataKey), date));
      setCalendarOpen(false);
    }
  };
  
  return (
    <div className="w-full h-full">
      <div className={isMobile ? "flex flex-col space-y-3" : "flex flex-row items-start justify-between"}>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className={`flex items-center ${isMobile ? "self-start" : "space-x-2"} gap-2`}>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={goToPreviousMonth}
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>{format(currentDate, 'MMMM yyyy', { locale: es })}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                selected={currentDate}
                onSelect={handleSelectMonth}
                initialFocus
                locale={es}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={goToNextMonth}
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="h-[350px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="day" 
              tickLine={false} 
              axisLine={false} 
              padding={{ left: 10, right: 10 }}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false}
              tick={{ fontSize: 12 }}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              name={dataKey}
              stroke={chartColor} 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0, fill: chartColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyStatsChart;
