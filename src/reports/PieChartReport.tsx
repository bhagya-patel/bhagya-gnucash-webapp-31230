import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, Label as ReLabel } from 'recharts';
import { formatCurrencyINR } from '@/lib/utils';
import { Account } from '@/types/account';
import { Transaction } from '@/lib/mockData';

const COLORS = ['#66BB6A', '#26C6DA', '#FF7043', '#AB47BC', '#EC407A', '#42A5F5', '#FFA726', '#8D6E63'];

export function PieChartReport({ accounts, transactions, options }: { accounts: Account[]; transactions: Transaction[]; options: { showLegend: boolean; showLabels: boolean; showPercentage: boolean; groupSmallSlices: boolean; }; }) {
  const expenseAccounts = accounts.filter(a => a.accountType === 'EXPENSE');
  const idToName = new Map(expenseAccounts.map(a => [a.id, a.name] as const));

  // Sum expenses by account (negative amounts become positive values for chart)
  const sums = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== 'EXPENSE') continue;
    const name = idToName.get(t.accountId);
    if (!name) continue;
    sums.set(name, (sums.get(name) || 0) + Math.abs(t.amount));
  }

  let data = Array.from(sums.entries()).map(([name, value]) => ({ name, value }));
  const total = data.reduce((a, b) => a + b.value, 0);

  if (options.groupSmallSlices && total > 0) {
    const big = data.filter(d => d.value / total >= 0.05);
    const small = data.filter(d => d.value / total < 0.05);
    const other = small.reduce((a, b) => a + b.value, 0);
    data = other > 0 ? [...big, { name: 'Other', value: other }] : big;
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">No chart data available</div>
    );
  }

  return (
    <div className="h-[420px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {options.showLegend && <Legend />}
          <Tooltip formatter={(v: number) => formatCurrencyINR(v)} />
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={140} label={options.showLabels ? (entry) => options.showPercentage ? `${entry.name} ${(entry.value / total * 100).toFixed(0)}%` : `${entry.name}` : false}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            {options.showLabels && (
              <ReLabel position="center" value={formatCurrencyINR(total)} />
            )}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}


