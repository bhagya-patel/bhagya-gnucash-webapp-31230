import { Account } from '@/types/account';
import { Transaction } from '@/lib/mockData';
import { formatCurrencyINR } from '@/lib/utils';

export function BalanceSheetReport({ accounts, transactions }: { accounts: Account[]; transactions: Transaction[]; }) {
  let assets = 0;
  let liabilities = 0;
  let equity = 0;

  for (const t of transactions) {
    if (t.type === 'ASSET') assets += t.amount;
    if (t.type === 'LIABILITY') liabilities += Math.abs(t.amount);
    if (t.type === 'EQUITY') equity += t.amount;
  }

  const netWorth = assets - liabilities;

  const Row = ({ label, value }: { label: string; value: number }) => (
    <div className="flex items-center justify-between bg-secondary/40 border border-border rounded-md px-4 py-3">
      <div className="text-lg font-semibold">{label}</div>
      <div className="text-lg font-bold">{formatCurrencyINR(value)}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="text-xl font-bold text-primary">Assets</div>
      <Row label="Total:" value={assets} />

      <div className="text-xl font-bold text-primary mt-4">Liabilities</div>
      <Row label="Total:" value={liabilities} />

      <div className="text-xl font-bold text-primary mt-4">Equity</div>
      <Row label="Total:" value={equity} />

      <div className="text-xl font-bold text-primary mt-4">Net Worth</div>
      <Row label="" value={netWorth} />
    </div>
  );
}


