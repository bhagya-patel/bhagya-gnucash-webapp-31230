import { useState } from 'react';
import { Account } from '@/types/account';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

interface QuickBalanceDialogProps {
  account: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateBalance: (accountId: string, newBalance: number) => void;
}

export const QuickBalanceDialog = ({
  account,
  open,
  onOpenChange,
  onUpdateBalance
}: QuickBalanceDialogProps) => {
  const [amount, setAmount] = useState('');

  const handleSubmit = () => {
    if (!account || !amount) return;
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return;
    
    const newBalance = account.balance + numAmount;
    onUpdateBalance(account.id, newBalance);
    setAmount('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border shadow-material-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Adjust Balance</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-foreground font-semibold">Account</Label>
            <div className="text-base text-muted-foreground">{account?.name}</div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-foreground font-semibold">Current Balance</Label>
            <div 
              className={`text-2xl font-bold ${
                account && account.balance >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              ₹{account?.balance.toFixed(2)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-foreground font-semibold">
              Amount (+ or -)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 1000 or -500"
              className="bg-background border-2 border-border text-foreground h-12 text-base"
            />
          </div>

          {amount && !isNaN(parseFloat(amount)) && account && (
            <div className="space-y-2">
              <Label className="text-foreground font-semibold">New Balance</Label>
              <div 
                className={`text-2xl font-bold ${
                  (account.balance + parseFloat(amount)) >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                ₹{(account.balance + parseFloat(amount)).toFixed(2)}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setAmount('');
                onOpenChange(false);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={!amount || isNaN(parseFloat(amount))}
            >
              Update Balance
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
