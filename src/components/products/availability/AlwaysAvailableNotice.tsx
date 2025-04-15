
import React from 'react';
import { AlarmCheck } from 'lucide-react';

const AlwaysAvailableNotice = () => {
  return (
    <div className="bg-green-50 text-green-800 p-4 rounded-lg border border-green-200 flex items-center gap-2 mb-4">
      <AlarmCheck className="h-5 w-5" />
      <span>Este producto está siempre disponible para alquilar</span>
    </div>
  );
};

export default AlwaysAvailableNotice;
