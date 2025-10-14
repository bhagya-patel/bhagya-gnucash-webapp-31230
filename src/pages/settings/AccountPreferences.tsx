import { AccountHeader } from '@/components/AccountHeader';
import { Banknote, FileText, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AccountPreferencesProps {
  onBack: () => void;
  defaultCurrency: string;
  onSetCurrency: (currency: string) => void;
  onCreateDefaultAccounts: () => void;
  onImportXML: () => void;
  onExportCSV: () => void;
  onDeleteAllAccounts: () => void;
}

export const AccountPreferences = ({
  onBack,
  defaultCurrency,
  onSetCurrency,
  onCreateDefaultAccounts,
  onImportXML,
  onExportCSV,
  onDeleteAllAccounts
}: AccountPreferencesProps) => {
  return (
    <div className="flex flex-col h-screen bg-background">
      <AccountHeader
        title="Account Preferences"
        color="#4CAF50"
        showBack
        showMenu={false}
        onBack={onBack}
      />
      <div className="flex-1 overflow-y-auto bg-background">
        <Button
          variant="ghost"
          className="w-full justify-start px-6 py-6 h-auto hover:bg-secondary/80 transition-smooth rounded-none border-b border-border group"
          onClick={() => onSetCurrency(defaultCurrency)}
        >
          <Banknote className="h-6 w-6 mr-4 text-muted-foreground" />
          <div className="flex-1 text-left">
            <p className="font-medium text-foreground text-base">Default currency</p>
            <p className="text-sm text-muted-foreground">{defaultCurrency}</p>
          </div>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start px-6 py-6 h-auto hover:bg-secondary/80 transition-smooth rounded-none border-b border-border"
          onClick={() => {
            onCreateDefaultAccounts();
            toast.success('Default account structure created');
          }}
        >
          <div className="flex-1 text-left">
            <p className="font-medium text-foreground text-base">Create default accounts</p>
            <p className="text-sm text-muted-foreground">Creates default GnuCash commonly-used account structure</p>
          </div>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start px-6 py-6 h-auto hover:bg-secondary/80 transition-smooth rounded-none border-b border-border"
          onClick={() => {
            onImportXML();
            toast.info('Import functionality coming soon');
          }}
        >
          <FileText className="h-6 w-6 mr-4 text-muted-foreground" />
          <div className="flex-1 text-left">
            <p className="font-medium text-foreground text-base">Import GnuCash XML</p>
            <p className="text-sm text-muted-foreground">Import account structure from GnuCash XML</p>
          </div>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start px-6 py-6 h-auto hover:bg-secondary/80 transition-smooth rounded-none border-b border-border"
          onClick={() => {
            onExportCSV();
            toast.info('Export functionality coming soon');
          }}
        >
          <Upload className="h-6 w-6 mr-4 text-muted-foreground" />
          <div className="flex-1 text-left">
            <p className="font-medium text-foreground text-base">Export as CSV</p>
            <p className="text-sm text-muted-foreground">Export all accounts (without transactions) to CSV</p>
          </div>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start px-6 py-6 h-auto hover:bg-destructive/10 transition-smooth rounded-none"
          onClick={() => {
            if (confirm('Are you sure? This will delete all accounts and transactions!')) {
              onDeleteAllAccounts();
              toast.success('All accounts deleted');
            }
          }}
        >
          <Trash2 className="h-6 w-6 mr-4 text-destructive" />
          <div className="flex-1 text-left">
            <p className="font-medium text-destructive text-base">Delete all accounts</p>
            <p className="text-sm text-muted-foreground">Delete all accounts in the database. All transactions will be deleted as well.</p>
          </div>
        </Button>
      </div>
    </div>
  );
};
