import { Account } from '@/types/account';
import { formatCurrencyINR } from '@/lib/utils';
import { calculateTotalBalance } from '@/hooks/useAccounts';

export function BalanceSheetReport({ accounts }: { accounts: Account[]; }) {
  // Find top-level accounts (case-insensitive, trimmed)
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
  const equityParent = accounts.find(a => 
    a.name.trim().toLowerCase() === 'equity' && 
    a.accountType.toUpperCase() === 'EQUITY' && 
    !a.parentId
  );

  // Use parent balance directly, or calculate from children
  const assets = assetsParent ? (assetsParent.balance || calculateTotalBalance(accounts, assetsParent.id)) : 0;
  const liabilities = liabilitiesParent ? Math.abs(liabilitiesParent.balance || calculateTotalBalance(accounts, liabilitiesParent.id)) : 0;
  const equity = equityParent ? (equityParent.balance || calculateTotalBalance(accounts, equityParent.id)) : 0;

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


