
import React from 'react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const ChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
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

export default ChartTooltip;
