import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateTimePicker } from '@/components/DateTimePicker';
import { TransactionScheduleModal } from '@/components/TransactionScheduleModal';
import { Account } from '@/types/account';
import { TransactionSchedule } from '@/types/transaction';
import { Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedAccount?: Account | null;
  accounts: Account[];
  onSuccess?: () => void;
}

export function TransactionForm({ open, onOpenChange, preselectedAccount, accounts, onSuccess }: TransactionFormProps) {
  const [isReceive, setIsReceive] = useState(true);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [scheduleType, setScheduleType] = useState<string>('none');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedule, setSchedule] = useState<TransactionSchedule>({
    enabled: false,
    frequency_type: 'WEEKLY',
    frequency_value: 1,
    days_of_week: [],
    end_type: 'FOREVER'
  });
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when dialog opens/closes or preselected account changes
  useEffect(() => {
    if (open) {
      setIsReceive(true);
      setDescription('');
      setAmount('');
      setSelectedAccountId(preselectedAccount?.id || '');
      setTransactionDate(new Date());
      setNotes('');
      setScheduleType('none');
      setSchedule({
        enabled: false,
        frequency_type: 'WEEKLY',
        frequency_value: 1,
        days_of_week: [],
        end_type: 'FOREVER'
      });
    }
  }, [open, preselectedAccount]);

  const handleScheduleTypeChange = (value: string) => {
    setScheduleType(value);
    if (value !== 'none') {
      const frequencyType = value === 'daily' ? 'DAILY' : value === 'weekly' ? 'WEEKLY' : 'MONTHLY';
      setSchedule(prev => ({ ...prev, enabled: true, frequency_type: frequencyType }));
      setShowScheduleModal(true);
    } else {
      setSchedule(prev => ({ ...prev, enabled: false }));
    }
  };

  const handleSaveSchedule = (newSchedule: TransactionSchedule) => {
    setSchedule(newSchedule);
  };

  const handleSave = async () => {
    if (!description.trim()) {
      toast({ title: 'Description is required', variant: 'destructive' });
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: 'Valid amount is required', variant: 'destructive' });
      return;
    }
    if (!selectedAccountId) {
      toast({ title: 'Please select an account', variant: 'destructive' });
      return;
    }

    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'You must be logged in', variant: 'destructive' });
        return;
      }

      if (schedule.enabled) {
        // Create recurring transaction
        const { error: recurringError } = await supabase
          .from('recurring_transactions')
          .insert({
            user_id: user.id,
            account_id: selectedAccountId,
            description: description.trim(),
            amount: parseFloat(amount),
            transaction_type: isReceive ? 'RECEIVE' : 'SPEND',
            notes: notes.trim(),
            frequency_type: schedule.frequency_type,
            frequency_value: schedule.frequency_value,
            days_of_week: schedule.days_of_week,
            end_type: schedule.end_type,
            end_date: schedule.end_date?.toISOString(),
            next_occurrence: transactionDate.toISOString()
          });

        if (recurringError) throw recurringError;
        
        toast({ title: 'Recurring transaction created successfully' });
      } else {
        // Create single transaction
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            account_id: selectedAccountId,
            description: description.trim(),
            amount: parseFloat(amount),
            transaction_type: isReceive ? 'RECEIVE' : 'SPEND',
            transaction_date: transactionDate.toISOString(),
            notes: notes.trim()
          });

        if (transactionError) throw transactionError;
        
        toast({ title: 'Transaction created successfully' });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({ title: 'Failed to create transaction', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // Build account hierarchy display name
  const getAccountDisplayName = (account: Account): string => {
    const parts: string[] = [];
    let current: Account | undefined = account;
    
    while (current) {
      parts.unshift(current.name);
      current = accounts.find(a => a.id === current?.parentId);
    }
    
    return parts.join(':');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center justify-between">
              <span>New transaction</span>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" onClick={() => onOpenChange(false)}>
                  <X className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleSave} disabled={isSaving}>
                  <Check className="h-5 w-5" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Description */}
            <div className="space-y-2">
              <Label className="text-accent">Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                className="border-b-2 border-t-0 border-l-0 border-r-0 rounded-none px-0 focus-visible:ring-0 focus-visible:border-accent"
              />
            </div>

            {/* Amount and Receive/Spend Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-2xl">₹</span>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                  className="text-lg border-0 focus-visible:ring-0 px-0"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-medium", isReceive ? "text-muted-foreground" : "text-destructive")}>
                  {isReceive ? "Receive" : "Spend"}
                </span>
                <Switch
                  checked={!isReceive}
                  onCheckedChange={(checked) => setIsReceive(!checked)}
                />
              </div>
            </div>

            {/* Account Selection */}
            <div className="space-y-2">
              <Label>Account</Label>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {getAccountDisplayName(account)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date & Time */}
            <DateTimePicker
              value={transactionDate}
              onChange={setTransactionDate}
              label="Date & Time"
            />

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes (optional)"
                className="min-h-[80px]"
              />
            </div>

            {/* Schedule */}
            <div className="space-y-2">
              <Label>Schedule</Label>
              <Select value={scheduleType} onValueChange={handleScheduleTypeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tap to create schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No schedule</SelectItem>
                  <SelectItem value="daily">Repeat Daily</SelectItem>
                  <SelectItem value="weekly">Repeat Weekly</SelectItem>
                  <SelectItem value="monthly">Repeat Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {schedule.enabled && (
              <div className="text-sm text-muted-foreground">
                Repeats every {schedule.frequency_value} {schedule.frequency_type.toLowerCase()}
                {schedule.frequency_type === 'WEEKLY' && schedule.days_of_week.length > 0 && 
                  ` on ${schedule.days_of_week.join(', ')}`}
                {schedule.end_type === 'UNTIL_DATE' && schedule.end_date && 
                  ` until ${format(schedule.end_date, 'PPP')}`}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <TransactionScheduleModal
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
        value={schedule}
        onSave={handleSaveSchedule}
      />
    </>
  );
}
