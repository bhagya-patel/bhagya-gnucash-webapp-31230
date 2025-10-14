import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatCurrencyINR } from '@/lib/utils';
import { Account } from '@/types/account';
import { Transaction } from '@/lib/mockData';

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function BarChartReport({ accounts, transactions, options }: { accounts: Account[]; transactions: Transaction[]; options: { showLegend: boolean; showLabels: boolean; }; }) {
  const now = new Date();
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.toLocaleString('en-US', { month: 'short' })} ${String(d.getFullYear()).slice(-2)}`);
  }

  const monthKeyToIndex = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthKeyToIndex.set(key, months.length - 1 - (5 - i));
  }

  const data = months.map(m => ({ month: m, income: 0, expenses: 0 }));

  for (const t of transactions) {
    const key = getMonthKey(t.date);
    const idx = monthKeyToIndex.get(key);
    if (idx === undefined) continue;
    if (t.type === 'INCOME') data[idx].income += Math.max(0, t.amount);
    if (t.type === 'EXPENSE') data[idx].expenses += Math.abs(Math.min(0, t.amount));
  }

  const hasData = data.some(d => d.income > 0 || d.expenses > 0);
  if (!hasData) {
    return <div className="flex items-center justify-center h-96 text-muted-foreground">No chart data available</div>;
  }

  return (
    <div className="h-[420px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
          <Tooltip formatter={(v: number) => formatCurrencyINR(v)} />
          {options.showLegend && <Legend />}
          <Bar dataKey="income" fill="#42A5F5" name="Income" />
          <Bar dataKey="expenses" fill="#EF5350" name="Expenses" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


