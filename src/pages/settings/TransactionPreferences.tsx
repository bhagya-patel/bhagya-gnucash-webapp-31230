import { AccountHeader } from '@/components/AccountHeader';
import { ArrowRightLeft, Repeat, Minimize2, Scale, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AppSettings } from '@/types/book';
import { toast } from 'sonner';

interface TransactionPreferencesProps {
  onBack: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onDeleteAllTransactions: () => void;
}

export const TransactionPreferences = ({
  onBack,
  settings,
  onUpdateSettings,
  onDeleteAllTransactions
}: TransactionPreferencesProps) => {
  return (
    <div className="flex flex-col h-screen bg-background">
      <AccountHeader
        title="Transaction Preferences"
        color="#4CAF50"
        showBack
        showMenu={false}
        onBack={onBack}
      />
      <div className="flex-1 overflow-y-auto bg-background">
        <Button
          variant="ghost"
          className="w-full justify-start px-6 py-6 h-auto hover:bg-secondary/80 transition-smooth rounded-none border-b border-border"
        >
          <div className="flex-1 text-left">
            <p className="font-medium text-foreground text-base">Default Transaction Type</p>
            <p className="text-sm text-muted-foreground">{settings.defaultTransactionType}</p>
          </div>
        </Button>

        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-4">
              <Repeat className="h-6 w-6 text-muted-foreground mt-1" />
              <div>
                <p className="font-medium text-foreground text-base">Activate Double Entry</p>
                <p className="text-sm text-muted-foreground">All transactions will be a transfer from one account to another</p>
              </div>
            </div>
            <Switch
              checked={settings.doubleEntryEnabled}
              onCheckedChange={(checked) => 
                onUpdateSettings({ ...settings, doubleEntryEnabled: checked })
              }
            />
          </div>
        </div>

        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-4">
              <Minimize2 className="h-6 w-6 text-muted-foreground mt-1" />
              <div>
                <p className="font-medium text-foreground text-base">Enable compact view</p>
                <p className="text-sm text-muted-foreground">Enable to always use compact view for transactions list</p>
              </div>
            </div>
            <Switch
              checked={settings.compactViewEnabled}
              onCheckedChange={(checked) => 
                onUpdateSettings({ ...settings, compactViewEnabled: checked })
              }
            />
          </div>
        </div>

        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-4">
              <Scale className="h-6 w-6 text-muted-foreground mt-1" />
              <div>
                <p className="font-medium text-foreground text-base">Save account opening balances</p>
                <p className="text-sm text-muted-foreground">Enable to save the current account balance (before deleting transactions) as new opening balance after deleting transactions</p>
              </div>
            </div>
            <Switch
              checked={settings.saveAccountOpeningBalances}
              onCheckedChange={(checked) => 
                onUpdateSettings({ ...settings, saveAccountOpeningBalances: checked })
              }
            />
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start px-6 py-6 h-auto hover:bg-destructive/10 transition-smooth rounded-none"
          onClick={() => {
            if (confirm('Are you sure? All transactions in all accounts will be deleted!')) {
              onDeleteAllTransactions();
              toast.success('All transactions deleted');
            }
          }}
        >
          <Trash2 className="h-6 w-6 mr-4 text-destructive" />
          <div className="flex-1 text-left">
            <p className="font-medium text-destructive text-base">Delete all transactions</p>
            <p className="text-sm text-muted-foreground">All transactions in all accounts will be deleted!</p>
          </div>
        </Button>
      </div>
    </div>
  );
};
