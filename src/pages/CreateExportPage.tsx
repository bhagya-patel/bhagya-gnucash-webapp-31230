import { useMemo, useState, useEffect } from 'react';
import { AccountHeader } from '@/components/AccountHeader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScheduleModal } from '@/reports/ScheduleModal';
import { compressFile, generateExportFile, handleExport } from '@/reports/exportUtils';
import { OwnCloudModal, OwnCloudCredentials } from '@/components/OwnCloudModal';
import { DateTimePicker } from '@/components/DateTimePicker';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

type Destination = 'LOCAL' | 'GOOGLE_DRIVE' | 'DROPBOX' | 'OWNCLOUD';
type Format = 'CSV' | 'QIF' | 'XML';

export const CreateExportPage = ({ onBack }: { onBack: () => void }) => {
  const [destination, setDestination] = useState<Destination>('LOCAL');
  const [filename, setFilename] = useState('transactions');
  const [format, setFormat] = useState<Format>('XML');
  const [deleteAfter, setDeleteAfter] = useState(false);
  const [compress, setCompress] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [schedule, setSchedule] = useState<any>(null);
  
  // New state for enhanced features
  const [ownCloudModalOpen, setOwnCloudModalOpen] = useState(false);
  const [ownCloudCredentials, setOwnCloudCredentials] = useState<OwnCloudCredentials | null>(null);
  const [qifSinceDate, setQifSinceDate] = useState(new Date());
  const [qifAllTime, setQifAllTime] = useState(false);

  // Watch for destination changes to open ownCloud modal
  useEffect(() => {
    if (destination === 'OWNCLOUD' && !ownCloudCredentials) {
      setOwnCloudModalOpen(true);
    }
  }, [destination, ownCloudCredentials]);

  const onSave = async () => {
    try {
      // For OAuth destinations, just open the OAuth URL
      if (destination === 'GOOGLE_DRIVE' || destination === 'DROPBOX') {
        await handleExport(destination, new Blob(), filename);
        return;
      }

      // For ownCloud, check if credentials are available
      if (destination === 'OWNCLOUD' && !ownCloudCredentials) {
        toast.error('Please configure ownCloud credentials first');
        setOwnCloudModalOpen(true);
        return;
      }

      // For LOCAL and OWNCLOUD with credentials, generate and export file
      const file = await generateExportFile(format, { 
        mock: true,
        sinceDate: format === 'QIF' && !qifAllTime ? qifSinceDate : undefined
      });
      const finalFile = compress ? await compressFile(file) : file;
      await handleExport(destination, finalFile, filename, ownCloudCredentials || undefined);
      
      toast.success('Export completed successfully');
    } catch (error) {
      toast.error('Export failed: ' + (error as Error).message);
    }
  };

  const handleOwnCloudSave = (credentials: OwnCloudCredentials) => {
    setOwnCloudCredentials(credentials);
    setOwnCloudModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <AccountHeader title="Export Transactions" color="#2e7d32" showBack onBack={onBack} showSave onSave={onSave} />

      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">EXPORT TO:</Label>
          <Select value={destination} onValueChange={(v) => setDestination(v as Destination)}>
            <SelectTrigger className="bg-card border-2 border-border h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOCAL">Save As (Local Download)</SelectItem>
              <SelectItem value="GOOGLE_DRIVE">Google Drive</SelectItem>
              <SelectItem value="DROPBOX">Dropbox</SelectItem>
              <SelectItem value="OWNCLOUD">ownCloud</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">Save As...</Label>
          <Input value={filename} onChange={(e) => setFilename(e.target.value)} className="bg-card border-2 border-border h-12" placeholder="Book_1.20251007" />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">FORMAT</Label>
          <Select value={format} onValueChange={(v) => setFormat(v as Format)}>
            <SelectTrigger className="bg-card border-2 border-border h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CSV">Comma-separated values (CSV)</SelectItem>
              <SelectItem value="QIF">Quicken Interchange Format (QIF)</SelectItem>
              <SelectItem value="XML">GnuCash XML</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* QIF-specific conditional section */}
        {format === 'QIF' && (
          <div className="space-y-3">
            <DateTimePicker
              value={qifSinceDate}
              onChange={setQifSinceDate}
              disabled={qifAllTime}
              label="SINCE"
            />
            
            <div className="flex items-center gap-3">
              <Switch 
                checked={qifAllTime} 
                onCheckedChange={setQifAllTime}
              />
              <span>All time</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Generates separate QIF files per currency
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Label className="text-sm font-semibold">Options</Label>
          <div className="flex items-center gap-3">
            <Checkbox checked={deleteAfter} onCheckedChange={(v) => setDeleteAfter(Boolean(v))} />
            <span>Delete transactions after export</span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox checked={compress} onCheckedChange={(v) => setCompress(Boolean(v))} />
            <span>Compress the data (.zip)</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">RECURRENCE</Label>
          <Button variant="outline" className="w-full h-12 justify-between" onClick={() => setScheduleOpen(true)}>
            <span>{schedule ? 'Schedule configured' : 'Tap to create schedule'}</span>
          </Button>
        </div>

        <ScheduleModal open={scheduleOpen} onOpenChange={setScheduleOpen} value={schedule} onSave={setSchedule} />
        
        <OwnCloudModal 
          open={ownCloudModalOpen} 
          onOpenChange={setOwnCloudModalOpen} 
          onSave={handleOwnCloudSave}
        />
      </div>
    </div>
  );
};

export default CreateExportPage;


