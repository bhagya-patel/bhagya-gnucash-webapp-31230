import { useState } from 'react';
import { AccountHeader } from '@/components/AccountHeader';
import { Button } from '@/components/ui/button';
import { MoreVertical, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAccounts } from '@/hooks/useAccounts';
import { PieChartReport } from '../reports/PieChartReport';
import { BarChartReport } from '../reports/BarChartReport';
import { LineChartReport } from '../reports/LineChartReport';
import { BalanceSheetReport } from '../reports/BalanceSheetReport';

type ReportType = 'PIE_CHART' | 'BAR_CHART' | 'LINE_CHART' | 'BALANCE_SHEET';

export const ReportsPage = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const [active, setActive] = useState<ReportType>('PIE_CHART');
  const [options, setOptions] = useState({
    showLegend: true,
    showLabels: true,
    showPercentage: true,
    groupSmallSlices: true,
  });

  const { data: accounts, isLoading } = useAccounts();

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <AccountHeader title="Reports" color="#2e7d32" onMenuClick={onMenuClick} />

      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Button variant={active === 'PIE_CHART' ? 'default' : 'secondary'} onClick={() => setActive('PIE_CHART')}>PIE CHART</Button>
          <Button variant={active === 'BAR_CHART' ? 'default' : 'secondary'} onClick={() => setActive('BAR_CHART')}>BAR CHART</Button>
          <Button variant={active === 'LINE_CHART' ? 'default' : 'secondary'} onClick={() => setActive('LINE_CHART')}>LINE CHART</Button>
          <Button variant={active === 'BALANCE_SHEET' ? 'default' : 'secondary'} onClick={() => setActive('BALANCE_SHEET')}>SHEET</Button>

          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" aria-label="Chart options"><MoreVertical className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover">
                <DropdownMenuCheckboxItem checked={options.showLegend} onCheckedChange={(v) => setOptions({ ...options, showLegend: Boolean(v) })}>Show legend</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={options.showLabels} onCheckedChange={(v) => setOptions({ ...options, showLabels: Boolean(v) })}>Show labels</DropdownMenuCheckboxItem>
                {active === 'PIE_CHART' && (
                  <DropdownMenuCheckboxItem checked={options.showPercentage} onCheckedChange={(v) => setOptions({ ...options, showPercentage: Boolean(v) })}>Show percentage</DropdownMenuCheckboxItem>
                )}
                {active === 'PIE_CHART' && (
                  <DropdownMenuCheckboxItem checked={options.groupSmallSlices} onCheckedChange={(v) => setOptions({ ...options, groupSmallSlices: Boolean(v) })}>Group Smaller Slices</DropdownMenuCheckboxItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="bg-card rounded-md border border-border p-2 min-h-[420px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !accounts || accounts.length === 0 ? (
            <div className="flex items-center justify-center h-96 text-muted-foreground">
              No accounts found
            </div>
          ) : (
            <>
              {active === 'PIE_CHART' && (
                <PieChartReport accounts={accounts} options={options} />
              )}
              {active === 'BAR_CHART' && (
                <BarChartReport accounts={accounts} options={options} />
              )}
              {active === 'LINE_CHART' && (
                <LineChartReport accounts={accounts} options={options} />
              )}
              {active === 'BALANCE_SHEET' && (
                <BalanceSheetReport accounts={accounts} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;


