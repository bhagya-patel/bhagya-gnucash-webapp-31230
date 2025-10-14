import { AccountHeader } from '@/components/AccountHeader';
import { FolderOpen, CloudUpload, RotateCcw, Share2, Mail, FileText, Trash2, FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AppSettings } from '@/types/book';
import { toast } from 'sonner';

interface BackupPreferencesProps {
  onBack: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export const BackupPreferences = ({ onBack, settings, onUpdateSettings }: BackupPreferencesProps) => {
  return (
    <div className="flex flex-col h-screen bg-background">
      <AccountHeader
        title="Backup Preferences"
        color="#4CAF50"
        showBack
        showMenu={false}
        onBack={onBack}
      />
      <div className="flex-1 overflow-y-auto bg-background">
        {/* Backup Section */}
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-4">Backup</h3>

          <Button
            variant="ghost"
            className="w-full justify-start px-0 py-4 h-auto hover:bg-transparent border-b border-border"
            onClick={() => toast.info('Select backup file functionality coming soon')}
          >
            <FolderOpen className="h-6 w-6 mr-4 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground text-base">Select backup file</p>
              <p className="text-sm text-muted-foreground">backup.{Date.now()}.xac</p>
            </div>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start px-0 py-4 h-auto hover:bg-transparent border-b border-border"
            onClick={() => toast.success('Backup created successfully')}
          >
            <CloudUpload className="h-6 w-6 mr-4 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground text-base">Create Backup</p>
              <p className="text-sm text-muted-foreground">Create a backup of the active book</p>
            </div>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start px-0 py-4 h-auto hover:bg-transparent border-b border-border"
            onClick={() => toast.info('Restore backup functionality coming soon')}
          >
            <RotateCcw className="h-6 w-6 mr-4 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground text-base">Restore Backup...</p>
              <p className="text-sm text-muted-foreground">Restore most recent backup of active book</p>
            </div>
          </Button>

          <div className="flex items-center justify-between py-4 border-b border-border">
            <div className="flex items-start gap-4">
              <Share2 className="h-6 w-6 text-muted-foreground mt-1" />
              <div>
                <p className="font-medium text-foreground text-base">Enable Dropbox</p>
                <p className="text-sm text-muted-foreground">Enable exporting to Dropbox</p>
              </div>
            </div>
            <Switch checked={false} />
          </div>

          <div className="flex items-center justify-between py-4 border-b border-border">
            <div className="flex items-start gap-4">
              <CloudUpload className="h-6 w-6 text-muted-foreground mt-1" />
              <div>
                <p className="font-medium text-foreground text-base">Enable ownCloud</p>
                <p className="text-sm text-muted-foreground">Enable exporting to ownCloud</p>
              </div>
            </div>
            <Switch checked={false} />
          </div>

          <div className="flex items-center justify-between py-4 border-b border-border">
            <div className="flex items-start gap-4">
              <Trash2 className="h-6 w-6 text-muted-foreground mt-1" />
              <div>
                <p className="font-medium text-foreground text-base">When delete transaction?</p>
                <p className="text-sm text-muted-foreground">Backup active book when delete a transaction?</p>
              </div>
            </div>
            <Switch
              checked={settings.backupOnDelete}
              onCheckedChange={(checked) => 
                onUpdateSettings({ ...settings, backupOnDelete: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between py-4">
            <div className="flex items-start gap-4">
              <FileText className="h-6 w-6 text-muted-foreground mt-1" />
              <div>
                <p className="font-medium text-foreground text-base">When importing a book?</p>
                <p className="text-sm text-muted-foreground">Backup the active book before importing a book?</p>
              </div>
            </div>
            <Switch
              checked={settings.backupOnImport}
              onCheckedChange={(checked) => 
                onUpdateSettings({ ...settings, backupOnImport: checked })
              }
            />
          </div>
        </div>

        {/* Export Section */}
        <div className="px-6 py-4">
          <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-4">Export</h3>

          <Button
            variant="ghost"
            className="w-full justify-start px-0 py-4 h-auto hover:bg-transparent border-b border-border"
          >
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground text-base">Default Export Format</p>
              <p className="text-sm text-muted-foreground">{settings.defaultExportFormat}</p>
            </div>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start px-0 py-4 h-auto hover:bg-transparent border-b border-border"
          >
            <Mail className="h-6 w-6 mr-4 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground text-base">Default export email</p>
              <p className="text-sm text-muted-foreground">
                The default email address to send exports to. You can still change this when you export.
              </p>
            </div>
          </Button>

          <div className="flex items-center justify-between py-4 border-b border-border">
            <div className="flex items-start gap-4">
              <FileText className="h-6 w-6 text-muted-foreground mt-1" />
              <div>
                <p className="font-medium text-foreground text-base">Export all transactions</p>
                <p className="text-sm text-muted-foreground">
                  By default, only new transactions since last export will be exported. Check this option to export all transactions
                </p>
              </div>
            </div>
            <Switch
              checked={settings.exportAllTransactions}
              onCheckedChange={(checked) => 
                onUpdateSettings({ ...settings, exportAllTransactions: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between py-4 border-b border-border">
            <div className="flex items-start gap-4">
              <FileX className="h-6 w-6 text-muted-foreground mt-1" />
              <div>
                <p className="font-medium text-foreground text-base">Delete exported transactions</p>
                <p className="text-sm text-muted-foreground">
                  All exported transactions will be deleted when exporting is completed
                </p>
              </div>
            </div>
            <Switch
              checked={settings.deleteExportedTransactions}
              onCheckedChange={(checked) => 
                onUpdateSettings({ ...settings, deleteExportedTransactions: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between py-4">
            <div className="flex items-start gap-4">
              <FileText className="h-6 w-6 text-muted-foreground mt-1" />
              <div>
                <p className="font-medium text-foreground text-base">Use XML OFX header</p>
                <p className="text-sm text-muted-foreground">
                  Enable this option when exporting to third-party application other than GnuCash for desktop
                </p>
              </div>
            </div>
            <Switch
              checked={settings.useXMLOFXHeader}
              onCheckedChange={(checked) => 
                onUpdateSettings({ ...settings, useXMLOFXHeader: checked })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
