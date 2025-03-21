
import { CardContent, CardDescription, CardHeader, CardTitle, Card } from '@/components/ui/card';
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

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
        <p className="font-medium">Day {data.day}</p>
        <p className="text-foreground">
          {name === 'views' ? 'Views' : 'Rentals'}: <span className="font-medium">{value}</span>
        </p>
      </div>
    );
  }

  return null;
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer 
          config={config} 
          className="h-full"
        >
          <LineChart 
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <XAxis 
              dataKey="day" 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `${value}`}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false}
              width={30}
              tick={{ fontSize: 12 }}
            />
            <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" vertical={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              name={dataKey}
              stroke={`var(--color-${dataKey})`} 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlyStatsChart;
