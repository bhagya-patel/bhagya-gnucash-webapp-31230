import { useState } from 'react';
import { AccountHeader } from '@/components/AccountHeader';
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
  const [tab, setTab] = useState<'TRANSACTIONS' | 'EXPORTS'>('TRANSACTIONS');
  const exportsData: ExportItem[] = [];

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <AccountHeader title="Scheduled Actions" color="#2e7d32" onMenuClick={onMenuClick} />

      <div className="px-4 pt-4">
        <div className="flex border-b border-border">
          <button
            onClick={() => setTab('TRANSACTIONS')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
              tab === 'TRANSACTIONS'
                ? 'text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            TRANSACTIONS
            {tab === 'TRANSACTIONS' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
            )}
          </button>
          <button
            onClick={() => setTab('EXPORTS')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
              tab === 'EXPORTS'
                ? 'text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            EXPORTS
            {tab === 'EXPORTS' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
            )}
          </button>
        </div>

        <div className="mt-6 min-h-[400px] relative pb-20">
          {tab === 'EXPORTS' ? (
            exportsData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-orange-500 text-lg">No scheduled exports to display</div>
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
            <div className="flex items-center justify-center h-64 text-orange-500 text-lg">No recurring transactions to display.</div>
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


