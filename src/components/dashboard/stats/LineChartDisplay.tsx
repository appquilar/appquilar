
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
    <div className="h-[350px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={data}
          margin={{ top: 10, right: 40, left: 20, bottom: 10 }}
          className="px-6" // Increased horizontal padding to prevent touching edges
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="day" 
            tickLine={false} 
            axisLine={false} 
            padding={{ left: 30, right: 30 }} // Increased padding for more space
            tick={{ fontSize: 12 }}
            interval={isMobile ? 2 : 1} // On mobile, show fewer days to avoid crowding
          />
          <YAxis 
            tickLine={false} 
            axisLine={false}
            tick={{ fontSize: 12 }}
            width={40} // Increased width for Y-axis
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
