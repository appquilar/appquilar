
import React from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';
import ChartTooltip from './ChartTooltip';
import { DataPoint } from './ChartDateUtils';

interface LineChartDisplayProps {
  data: DataPoint[];
  dataKey: string;
  chartColor: string;
  isMobile: boolean;
}

const LineChartDisplay: React.FC<LineChartDisplayProps> = ({ 
  data, 
  dataKey, 
  chartColor,
  isMobile 
}) => {
  return (
    <div className="h-full w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={data}
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
          className="px-2 sm:px-6"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="day" 
            tickLine={false} 
            axisLine={false} 
            padding={{ left: 10, right: 10 }}
            tick={{ fontSize: isMobile ? 10 : 12 }}
            interval={isMobile ? 3 : 1} // On mobile, show fewer days to avoid crowding
          />
          <YAxis 
            tickLine={false} 
            axisLine={false}
            tick={{ fontSize: isMobile ? 10 : 12 }}
            width={30} // Smaller width for Y-axis on mobile
            padding={{ top: 10, bottom: 10 }}
          />
          <Tooltip content={<ChartTooltip />} />
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
  );
};

export default LineChartDisplay;
