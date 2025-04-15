
import React from 'react';

const CalendarLegend = () => {
  return (
    <div className="flex flex-wrap gap-3 mt-4 text-sm">
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
        <span>Disponible</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
        <span>No disponible</span>
      </div>
    </div>
  );
};

export default CalendarLegend;
