import { Account } from '@/types/account';

export type Transaction = {
  id: string;
  date: string; // ISO date
  accountId: string;
  amount: number; // positive for inflow to the account, negative for outflow
  type: 'INCOME' | 'EXPENSE' | 'ASSET' | 'LIABILITY' | 'EQUITY';
};

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateMockAccounts(): Account[] {
  // Minimal fields used in UI
  const now = Date.now();
  const assets: Account[] = [
    { id: 'a_checking', name: 'Checking Account', accountType: 'ASSET', color: '#4CAF50', description: '', parentId: null, currency: 'INR (Indian Rupee)', notes: '', placeholder: false, hidden: false, favorite: false, balance: 0, createdAt: now, updatedAt: now },
    { id: 'a_savings', name: 'Savings Account', accountType: 'ASSET', color: '#4CAF50', description: '', parentId: null, currency: 'INR (Indian Rupee)', notes: '', placeholder: false, hidden: false, favorite: false, balance: 0, createdAt: now, updatedAt: now },
  ];

  const income: Account[] = [
    { id: 'i_salary', name: 'Salary', accountType: 'INCOME', color: '#2196F3', description: '', parentId: null, currency: 'INR (Indian Rupee)', notes: '', placeholder: false, hidden: false, favorite: false, balance: 0, createdAt: now, updatedAt: now },
    { id: 'i_freelance', name: 'Freelance', accountType: 'INCOME', color: '#2196F3', description: '', parentId: null, currency: 'INR (Indian Rupee)', notes: '', placeholder: false, hidden: false, favorite: false, balance: 0, createdAt: now, updatedAt: now },
  ];

  const expenses: Account[] = [
    { id: 'e_groceries', name: 'Groceries', accountType: 'EXPENSE', color: '#F44336', description: '', parentId: null, currency: 'INR (Indian Rupee)', notes: '', placeholder: false, hidden: false, favorite: false, balance: 0, createdAt: now, updatedAt: now },
    { id: 'e_rent', name: 'Rent', accountType: 'EXPENSE', color: '#F44336', description: '', parentId: null, currency: 'INR (Indian Rupee)', notes: '', placeholder: false, hidden: false, favorite: false, balance: 0, createdAt: now, updatedAt: now },
    { id: 'e_transport', name: 'Transport', accountType: 'EXPENSE', color: '#F44336', description: '', parentId: null, currency: 'INR (Indian Rupee)', notes: '', placeholder: false, hidden: false, favorite: false, balance: 0, createdAt: now, updatedAt: now },
    { id: 'e_utilities', name: 'Utilities', accountType: 'EXPENSE', color: '#F44336', description: '', parentId: null, currency: 'INR (Indian Rupee)', notes: '', placeholder: false, hidden: false, favorite: false, balance: 0, createdAt: now, updatedAt: now },
  ];

  const liabilities: Account[] = [
    { id: 'l_credit', name: 'Credit Card', accountType: 'LIABILITY', color: '#9C27B0', description: '', parentId: null, currency: 'INR (Indian Rupee)', notes: '', placeholder: false, hidden: false, favorite: false, balance: 0, createdAt: now, updatedAt: now },
    { id: 'l_loan', name: 'Personal Loan', accountType: 'LIABILITY', color: '#9C27B0', description: '', parentId: null, currency: 'INR (Indian Rupee)', notes: '', placeholder: false, hidden: false, favorite: false, balance: 0, createdAt: now, updatedAt: now },
  ];

  const equity: Account[] = [
    { id: 'eq_owner', name: 'Owner Equity', accountType: 'EQUITY', color: '#FF9800', description: '', parentId: null, currency: 'INR (Indian Rupee)', notes: '', placeholder: false, hidden: false, favorite: false, balance: 0, createdAt: now, updatedAt: now },
  ];

  return [...assets, ...income, ...expenses, ...liabilities, ...equity];
}

export function generateMockTransactions(accounts: Account[], months: number = 12): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const incomeAccounts = accounts.filter(a => a.accountType === 'INCOME');
  const expenseAccounts = accounts.filter(a => a.accountType === 'EXPENSE');
  const assetAccounts = accounts.filter(a => a.accountType === 'ASSET');
  const liabilityAccounts = accounts.filter(a => a.accountType === 'LIABILITY');

  for (let d = new Date(start); d <= now; d.setMonth(d.getMonth() + 1)) {
    // Income transactions each month
    const incomeCount = 2;
    for (let i = 0; i < incomeCount; i++) {
      const acc = pick(incomeAccounts);
      transactions.push({
        id: `t_inc_${d.getTime()}_${i}`,
        date: new Date(d.getFullYear(), d.getMonth(), 1 + i * 10).toISOString(),
        accountId: acc.id,
        amount: Math.round(randomBetween(30000, 80000)),
        type: 'INCOME',
      });
    }

    // Expense transactions per month
    const expCount = 10;
    for (let i = 0; i < expCount; i++) {
      const acc = pick(expenseAccounts);
      transactions.push({
        id: `t_exp_${d.getTime()}_${i}`,
        date: new Date(d.getFullYear(), d.getMonth(), 2 + i * 2).toISOString(),
        accountId: acc.id,
        amount: -Math.round(randomBetween(300, 8000)),
        type: 'EXPENSE',
      });
    }

    // Asset and liability monthly adjustments
    const asset = pick(assetAccounts);
    transactions.push({ id: `t_ass_${d.getTime()}`, date: new Date(d.getFullYear(), d.getMonth(), 28).toISOString(), accountId: asset.id, amount: Math.round(randomBetween(-5000, 5000)), type: 'ASSET' });
    const liability = pick(liabilityAccounts);
    transactions.push({ id: `t_liab_${d.getTime()}`, date: new Date(d.getFullYear(), d.getMonth(), 28).toISOString(), accountId: liability.id, amount: Math.round(randomBetween(-3000, 3000)), type: 'LIABILITY' });
  }

  return transactions;
}

export const MockDataService = {
  getAccounts(): Account[] {
    return generateMockAccounts();
  },
  getTransactions(): Transaction[] {
    const accounts = generateMockAccounts();
    return generateMockTransactions(accounts, 12);
  },
};


