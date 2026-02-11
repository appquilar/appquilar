import { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { es } from 'date-fns/locale';

interface SpanishDateInputProps {
  id?: string;
  value: string;
  onChange: (nextIsoValue: string) => void;
  disabled?: boolean;
  className?: string;
  invalid?: boolean;
}

const DISPLAY_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const isoToDisplay = (value: string): string => {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) {
    return '';
  }

  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
};

const displayToIso = (value: string): string | null => {
  const normalized = value.trim().replace(/[.-]/g, '/');
  const match = DISPLAY_DATE_PATTERN.exec(normalized);

  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const candidate = new Date(`${year}-${month}-${day}T00:00:00`);

  if (Number.isNaN(candidate.getTime())) {
    return null;
  }

  if (
    candidate.getFullYear() !== Number(year) ||
    candidate.getMonth() + 1 !== Number(month) ||
    candidate.getDate() !== Number(day)
  ) {
    return null;
  }

  return `${year}-${month}-${day}`;
};

const SpanishDateInput = ({
  id,
  value,
  onChange,
  disabled,
  className,
  invalid,
}: SpanishDateInputProps) => {
  const [displayValue, setDisplayValue] = useState<string>(isoToDisplay(value));
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const normalizedPropValue = useMemo(() => isoToDisplay(value), [value]);
  const selectedDate = useMemo(() => {
    const match = ISO_DATE_PATTERN.exec(value);
    if (!match) {
      return undefined;
    }

    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0);
  }, [value]);

  useEffect(() => {
    setDisplayValue(normalizedPropValue);
  }, [normalizedPropValue]);

  const handleChange = (nextValue: string) => {
    setDisplayValue(nextValue);

    if (!nextValue.trim()) {
      onChange('');
      return;
    }

    const nextIso = displayToIso(nextValue);
    if (nextIso) {
      onChange(nextIso);
      return;
    }

    onChange('');
  };

  const handleBlur = () => {
    if (!displayValue.trim()) {
      onChange('');
      return;
    }

    const nextIso = displayToIso(displayValue);
    if (nextIso) {
      onChange(nextIso);
      setDisplayValue(isoToDisplay(nextIso));
      return;
    }

    onChange('');
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) {
      return;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const isoValue = `${year}-${month}-${day}`;

    onChange(isoValue);
    setDisplayValue(isoToDisplay(isoValue));
    setIsCalendarOpen(false);
  };

  return (
    <div className="relative">
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder="dd/mm/aaaa"
        value={displayValue}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={handleBlur}
        disabled={disabled}
        aria-invalid={invalid}
        className={cn('pr-11', invalid ? 'border-destructive' : undefined, className)}
      />

      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
            disabled={disabled}
            aria-label="Abrir calendario"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleCalendarSelect}
            locale={es}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SpanishDateInput;
