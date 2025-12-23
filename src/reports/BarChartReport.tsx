import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatCurrencyINR } from '@/lib/utils';
import { Account } from '@/types/account';
import { calculateTotalBalance } from '@/hooks/useAccounts';

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function BarChartReport({ accounts, options }: { accounts: Account[]; options: { showLegend: boolean; showLabels: boolean; }; }) {
  // Find top-level Income and Expenses accounts (case-insensitive, trimmed)
  const incomeParent = accounts.find(a => 
    a.name.trim().toLowerCase() === 'income' && 
    a.accountType.toUpperCase() === 'INCOME' && 
    !a.parentId
  );
  const expenseParent = accounts.find(a => 
    a.name.trim().toLowerCase() === 'expenses' && 
    a.accountType.toUpperCase() === 'EXPENSE' && 
    !a.parentId
  );

  // Use parent balance directly, or calculate from children
  const totalIncome = incomeParent ? Math.abs(incomeParent.balance || calculateTotalBalance(accounts, incomeParent.id)) : 0;
  const totalExpenses = expenseParent ? Math.abs(expenseParent.balance || calculateTotalBalance(accounts, expenseParent.id)) : 0;

  // For demo, create 6 months of data
  const now = new Date();
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.toLocaleString('en-US', { month: 'short' })} ${String(d.getFullYear()).slice(-2)}`);
  }

  // Simulate monthly distribution (this would come from transaction history in a real app)
  const data = months.map((m, i) => ({
    month: m,
    income: i === months.length - 1 ? totalIncome : totalIncome * 0.8,
    expenses: i === months.length - 1 ? totalExpenses : totalExpenses * 0.8
  }));

  const hasData = totalIncome > 0 || totalExpenses > 0;
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


