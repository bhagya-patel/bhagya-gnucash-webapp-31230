import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { formatCurrencyINR } from '@/lib/utils';
import { Account } from '@/types/account';
import { Transaction } from '@/lib/mockData';

export function LineChartReport({ accounts, transactions, options }: { accounts: Account[]; transactions: Transaction[]; options: { showLegend: boolean; showLabels: boolean; }; }) {
  const now = new Date();
  const months: string[] = [];
  const monthKeys: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.toLocaleString('en-US', { month: 'short' })} ${String(d.getFullYear()).slice(-2)}`);
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  // Running balances by type
  const byKey = new Map<string, { assets: number; liabilities: number }>();
  for (const key of monthKeys) byKey.set(key, { assets: 0, liabilities: 0 });

  for (const t of transactions) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    for (const mk of monthKeys) {
      if (mk >= key) {
        const accum = byKey.get(mk)!;
        if (t.type === 'ASSET') accum.assets += t.amount;
        if (t.type === 'LIABILITY') accum.liabilities += t.amount;
      }
    }
  }

  const data = months.map((m, i) => {
    const mk = monthKeys[i];
    const { assets, liabilities } = byKey.get(mk)!;
    const net = assets - Math.abs(liabilities);
    return { month: m, netWorth: net };
  });

  const hasData = data.some(d => d.netWorth !== 0);
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


