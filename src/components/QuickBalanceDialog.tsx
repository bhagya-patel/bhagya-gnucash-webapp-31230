import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus } from 'lucide-react';

interface QuickBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
  onSave: (newBalance: number) => void;
  accountName: string;
}

export function QuickBalanceDialog({ 
  open, 
  onOpenChange, 
  currentBalance, 
  onSave, 
  accountName 
}: QuickBalanceDialogProps) {
  const [amount, setAmount] = useState('');

  const handleAdd = () => {
    const value = parseFloat(amount);
    if (!isNaN(value) && value > 0) {
      onSave(currentBalance + value);
      setAmount('');
      onOpenChange(false);
    }
  };

  const handleSubtract = () => {
    const value = parseFloat(amount);
    if (!isNaN(value) && value > 0) {
      onSave(currentBalance - value);
      setAmount('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Adjust Balance - {accountName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Balance</Label>
            <div className={`text-2xl font-bold ${currentBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ₹{currentBalance.toFixed(2)}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleAdd}
              className="flex-1 bg-green-500 hover:bg-green-600"
              disabled={!amount || parseFloat(amount) <= 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
            <Button 
              onClick={handleSubtract}
              className="flex-1 bg-red-500 hover:bg-red-600"
              disabled={!amount || parseFloat(amount) <= 0}
            >
              <Minus className="h-4 w-4 mr-2" />
              Subtract
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
