import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, Label as ReLabel } from 'recharts';
import { formatCurrencyINR } from '@/lib/utils';
import { Account } from '@/types/account';
import { getChildAccounts, calculateTotalBalance } from '@/hooks/useAccounts';

const COLORS = ['#66BB6A', '#26C6DA', '#FF7043', '#AB47BC', '#EC407A', '#42A5F5', '#FFA726', '#8D6E63'];

export function PieChartReport({ accounts, options }: { accounts: Account[]; options: { showLegend: boolean; showLabels: boolean; showPercentage: boolean; groupSmallSlices: boolean; }; }) {
  // Find the top-level Expenses account (case-insensitive, trimmed)
  const expenseParent = accounts.find(a => 
    a.name.trim().toLowerCase() === 'expenses' && 
    a.accountType.toUpperCase() === 'EXPENSE' && 
    !a.parentId
  );

  if (!expenseParent) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">No expense accounts found</div>
    );
  }

  // Get direct children of Expenses account (these are the categories we want to show)
  const expenseCategories = accounts.filter(a => a.parentId === expenseParent.id);

  // Calculate total balance for each category (including its children)
  const categoryBalances = expenseCategories
    .map(category => ({
      name: category.name,
      value: Math.abs(calculateTotalBalance(accounts, category.id))
    }))
    .filter(item => item.value > 0);

  // If no categories have balances but parent has balance, show parent as single item
  if (categoryBalances.length === 0 && Math.abs(expenseParent.balance) > 0) {
    const data = [{ name: 'Total Expenses', value: Math.abs(expenseParent.balance) }];
    const total = data[0].value;
    
    return (
      <div className="h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {options.showLegend && <Legend />}
            <Tooltip formatter={(v: number) => formatCurrencyINR(v)} />
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={140} label={options.showLabels}>
              <Cell fill={COLORS[0]} />
              {options.showLabels && (
                <ReLabel position="center" value={formatCurrencyINR(total)} />
              )}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  let data = categoryBalances;
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


