import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  value: any;
  onSave: (v: any) => void;
};

export function ScheduleModal({ open, onOpenChange, value, onSave }: Props) {
  const v = value || { enabled: false, every: 1, unit: 'week', days: ['TUE'], until: 'forever' };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border">
        <DialogHeader>
          <DialogTitle>Repeat Weekly</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">Enable</div>
            <Switch checked={v.enabled} onCheckedChange={(x) => onSave({ ...v, enabled: Boolean(x) })} />
          </div>

          <div className="flex items-center gap-2">
            <span>Every</span>
            <Input type="number" className="w-20" value={v.every} onChange={(e) => onSave({ ...v, every: Number(e.target.value) })} />
            <Select value={v.unit} onValueChange={(x) => onSave({ ...v, unit: x })}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="day">day</SelectItem>
                <SelectItem value="week">week</SelectItem>
                <SelectItem value="month">month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
              <Button key={d} variant={v.days?.includes(d) ? 'default' : 'outline'} onClick={() => {
                const set = new Set(v.days || []);
                if (set.has(d)) set.delete(d); else set.add(d);
                onSave({ ...v, days: Array.from(set) });
              }}>{d}</Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span>End</span>
            <Select value={v.until} onValueChange={(x) => onSave({ ...v, until: x })}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="forever">Forever</SelectItem>
                <SelectItem value="until">Until…</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>CANCEL</Button>
            <Button onClick={() => onOpenChange(false)}>OK</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ScheduleModal;


