import { useMemo, useState } from 'react';
import { AccountHeader } from '@/components/AccountHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { Card } from '@/components/ui/card';

type ExportItem = {
  id: string;
  name: string;
  destination: string;
  format: string;
  nextRun?: string;
};

export const ScheduledActionsPage = ({ onMenuClick, onCreate }: { onMenuClick?: () => void; onCreate: () => void; }) => {
  const [tab, setTab] = useState<'TRANSACTIONS' | 'EXPORTS'>('EXPORTS');
  const exportsData: ExportItem[] = [];

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <AccountHeader title="Scheduled Actions" color="#2e7d32" onMenuClick={onMenuClick} />

      <div className="p-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList>
            <TabsTrigger value="TRANSACTIONS">TRANSACTIONS</TabsTrigger>
            <TabsTrigger value="EXPORTS">EXPORTS</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-6 min-h-[400px] relative">
          {tab === 'EXPORTS' ? (
            exportsData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-primary text-lg">No scheduled exports to display</div>
            ) : (
              <div className="grid gap-3">
                {exportsData.map((e) => (
                  <Card key={e.id} className="p-4 bg-card border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{e.name}</div>
                        <div className="text-sm text-muted-foreground">{e.destination} • {e.format}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">Next: {e.nextRun || '—'}</div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-64 text-primary text-lg">No recurring transactions to display.</div>
          )}

          {tab === 'EXPORTS' && (
            <div className="fixed right-6 bottom-6">
              <FloatingActionButton onClick={onCreate} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduledActionsPage;


