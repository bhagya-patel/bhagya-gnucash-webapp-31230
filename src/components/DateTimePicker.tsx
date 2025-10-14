import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  disabled?: boolean;
  label?: string;
}

export const DateTimePicker = ({ value, onChange, disabled = false, label }: DateTimePickerProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [timeString, setTimeString] = useState(format(value, 'HH:mm'));

  const handleTimeChange = (time: string) => {
    setTimeString(time);
    const [hours, minutes] = time.split(':').map(Number);
    
    if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      const newDate = new Date(value);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate);
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const [hours, minutes] = timeString.split(':').map(Number);
      selectedDate.setHours(hours, minutes, 0, 0);
      onChange(selectedDate);
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-semibold">{label}</Label>}
      
      <div className="flex gap-2">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left font-normal bg-card border-2 border-border h-12",
                !value && "text-muted-foreground",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleDateSelect}
              disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <div className="relative flex-1">
          <Input
            type="time"
            value={timeString}
            onChange={(e) => handleTimeChange(e.target.value)}
            disabled={disabled}
            className={cn(
              "bg-card border-2 border-border h-12",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
          <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
