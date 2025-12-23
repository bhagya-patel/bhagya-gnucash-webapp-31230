import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { formatCurrencyINR } from '@/lib/utils';
import { Account } from '@/types/account';
import { calculateTotalBalance } from '@/hooks/useAccounts';

export function LineChartReport({ accounts, options }: { accounts: Account[]; options: { showLegend: boolean; showLabels: boolean; }; }) {
  // Find top-level Assets and Liabilities accounts (case-insensitive, trimmed)
  const assetsParent = accounts.find(a => 
    a.name.trim().toLowerCase() === 'assets' && 
    a.accountType.toUpperCase() === 'ASSET' && 
    !a.parentId
  );
  const liabilitiesParent = accounts.find(a => 
    a.name.trim().toLowerCase() === 'liabilities' && 
    a.accountType.toUpperCase() === 'LIABILITY' && 
    !a.parentId
  );

  // Use parent balance directly, or calculate from children
  const totalAssets = assetsParent ? (assetsParent.balance || calculateTotalBalance(accounts, assetsParent.id)) : 0;
  const totalLiabilities = liabilitiesParent ? Math.abs(liabilitiesParent.balance || calculateTotalBalance(accounts, liabilitiesParent.id)) : 0;
  const netWorth = totalAssets - totalLiabilities;

  // Generate 12 months of historical data
  const now = new Date();
  const months: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.toLocaleString('en-US', { month: 'short' })} ${String(d.getFullYear()).slice(-2)}`);
  }

  // Simulate growth over time (in a real app, this would come from transaction history)
  const data = months.map((m, i) => {
    const progress = (i + 1) / months.length;
    return { 
      month: m, 
      netWorth: netWorth * progress 
    };
  });

  const hasData = Math.abs(netWorth) > 0;
  if (!hasData) {
    return <div className="flex items-center justify-center h-96 text-muted-foreground">No chart data available</div>;
  }

  return (
    <div className="h-[420px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(v: number) => formatCurrencyINR(v)} />
          {options.showLegend && <Legend />}
          <Line type="monotone" dataKey="netWorth" stroke="#66BB6A" name="Net Worth" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


