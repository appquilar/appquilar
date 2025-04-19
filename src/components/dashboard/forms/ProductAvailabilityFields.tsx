
import React, { useState, useEffect } from 'react';
import { Control, useWatch, useFormContext } from 'react-hook-form';
import { ProductFormValues } from './productFormSchema';
import { FormField, FormLabel, FormDescription } from '@/components/ui/form';
import AlwaysAvailableToggle from './availability/AlwaysAvailableToggle';
import WeeklySchedule from './availability/WeeklySchedule';
import UnavailableDates from './availability/UnavailableDates';
import { DaySchedules, TimeRange, WeekdayId } from './availability/types';

interface ProductAvailabilityFieldsProps {
  control: Control<ProductFormValues>;
}

const ProductAvailabilityFields = ({ control }: ProductAvailabilityFieldsProps) => {
  // Get the setValue method from useFormContext
  const { setValue } = useFormContext<ProductFormValues>();

  // State to track time ranges for each day
  const [timeRanges, setTimeRanges] = useState<DaySchedules>({
    monday: [{ id: 'monday-1', startTime: '08:00', endTime: '18:00' }],
    tuesday: [{ id: 'tuesday-1', startTime: '08:00', endTime: '18:00' }],
    wednesday: [{ id: 'wednesday-1', startTime: '08:00', endTime: '18:00' }],
    thursday: [{ id: 'thursday-1', startTime: '08:00', endTime: '18:00' }],
    friday: [{ id: 'friday-1', startTime: '08:00', endTime: '18:00' }],
    saturday: [{ id: 'saturday-1', startTime: '08:00', endTime: '18:00' }],
    sunday: [{ id: 'sunday-1', startTime: '08:00', endTime: '18:00' }],
  });

  // State to track which days are selected
  const [selectedDays, setSelectedDays] = useState<Record<WeekdayId, boolean>>({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });

  const isAlwaysAvailable = useWatch({
    control,
    name: "isAlwaysAvailable",
    defaultValue: true
  });

  // Update availability schedule in form when timeRanges or selectedDays change
  useEffect(() => {
    // Only update when product isn't set to always available
    if (isAlwaysAvailable) return;

    // Create availability schedule object from selected days and time ranges
    const schedule: Record<string, Array<{ startTime: string; endTime: string }>> = {};

    Object.entries(selectedDays).forEach(([day, isSelected]) => {
      if (isSelected) {
        // Map the TimeRange[] to the format expected by the form schema (without the id field)
        schedule[day] = timeRanges[day as WeekdayId].map(range => ({
          startTime: range.startTime || '08:00', // Always provide a default value
          endTime: range.endTime || '18:00'      // Always provide a default value
        }));
      }
    });

    // Properly update the form value using setValue
    setValue("availabilitySchedule", schedule, { 
      shouldDirty: true,
      shouldValidate: true
    });
  }, [timeRanges, selectedDays, isAlwaysAvailable, setValue]);

  // Add a new time range for a specific day
  const addTimeRange = (day: WeekdayId) => {
    const newRanges = [...(timeRanges[day] || [])];
    const newId = `${day}-${newRanges.length + 1}`;
    newRanges.push({ id: newId, startTime: '08:00', endTime: '18:00' });
    setTimeRanges({
      ...timeRanges,
      [day]: newRanges
    });
  };

  // Remove a time range for a specific day
  const removeTimeRange = (day: WeekdayId, rangeId: string) => {
    const newRanges = timeRanges[day].filter(range => range.id !== rangeId);
    setTimeRanges({
      ...timeRanges,
      [day]: newRanges
    });
  };

  // Update a time range value
  const updateTimeRange = (day: WeekdayId, rangeId: string, field: 'startTime' | 'endTime', value: string) => {
    const newRanges = timeRanges[day].map(range => 
      range.id === rangeId 
        ? { ...range, [field]: value || (field === 'startTime' ? '08:00' : '18:00') } 
        : range
    );
    setTimeRanges({
      ...timeRanges,
      [day]: newRanges
    });
  };

  // Toggle day selection
  const toggleDaySelection = (day: WeekdayId, checked: boolean) => {
    setSelectedDays({
      ...selectedDays,
      [day]: checked
    });
  };

  return (
    <div className="space-y-6 overflow-visible">
      <FormLabel className="text-base">Disponibilidad</FormLabel>
      <FormDescription>
        Establece cuándo este producto está disponible para alquilar.
      </FormDescription>

      {/* Global always available switch */}
      <AlwaysAvailableToggle control={control} />

      {/* Days of week availability */}
      <FormField
        control={control}
        name="isAlwaysAvailable"
        render={({ field }) => (
          <div className={field.value ? 'opacity-50 pointer-events-none' : ''}>
            {/* Weekly schedule */}
            <div>
              <WeeklySchedule
                selectedDays={selectedDays}
                timeRanges={timeRanges}
                onToggleDaySelection={toggleDaySelection}
                onAddTimeRange={addTimeRange}
                onRemoveTimeRange={removeTimeRange}
                onUpdateTimeRange={updateTimeRange}
              />
            </div>
            
            {/* Unavailable dates */}
            <div className="mt-6">
              <UnavailableDates control={control} />
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default ProductAvailabilityFields;
