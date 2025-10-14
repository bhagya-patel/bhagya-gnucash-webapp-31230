import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionSchedule } from '@/types/transaction';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TransactionScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: TransactionSchedule;
  onSave: (schedule: TransactionSchedule) => void;
}

const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export function TransactionScheduleModal({ open, onOpenChange, value, onSave }: TransactionScheduleModalProps) {
  const [schedule, setSchedule] = useState<TransactionSchedule>(value);

  const handleSave = () => {
    onSave(schedule);
    onOpenChange(false);
  };

  const toggleDay = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold uppercase tracking-wider">
            REPEAT {schedule.frequency_type}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm">Every</Label>
            <Input
              type="number"
              min="1"
              value={schedule.frequency_value}
              onChange={(e) => setSchedule(prev => ({ ...prev, frequency_value: parseInt(e.target.value) || 1 }))}
              className="w-20"
            />
            <Select
              value={schedule.frequency_type}
              onValueChange={(value: 'DAILY' | 'WEEKLY' | 'MONTHLY') => 
                setSchedule(prev => ({ ...prev, frequency_type: value }))
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">day(s)</SelectItem>
                <SelectItem value="WEEKLY">week(s)</SelectItem>
                <SelectItem value="MONTHLY">month(s)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {schedule.frequency_type === 'WEEKLY' && (
            <div className="space-y-2">
              <Label className="text-sm">Days of week</Label>
              <div className="grid grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <Button
                    key={day}
                    type="button"
                    variant={schedule.days_of_week.includes(day) ? 'default' : 'outline'}
                    onClick={() => toggleDay(day)}
                    className="h-10"
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm">Duration</Label>
            <Select
              value={schedule.end_type}
              onValueChange={(value: 'FOREVER' | 'UNTIL_DATE') => 
                setSchedule(prev => ({ ...prev, end_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FOREVER">Forever</SelectItem>
                <SelectItem value="UNTIL_DATE">Until...</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {schedule.end_type === 'UNTIL_DATE' && (
            <div className="space-y-2">
              <Label className="text-sm">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !schedule.end_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {schedule.end_date ? format(schedule.end_date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={schedule.end_date}
                    onSelect={(date) => setSchedule(prev => ({ ...prev, end_date: date }))}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            CANCEL
          </Button>
          <Button onClick={handleSave}>
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
