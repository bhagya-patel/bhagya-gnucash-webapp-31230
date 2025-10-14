export interface Account {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  accountType: AccountType;
  currency: string;
  color: string;
  notes: string;
  placeholder: boolean;
  hidden: boolean;
  favorite: boolean;
  balance: number;
  createdAt: number;
}

export type AccountType = 
  | 'ASSET'
  | 'BANK'
  | 'CASH'
  | 'CREDIT CARD'
  | 'CURRENCY'
  | 'EQUITY'
  | 'EXPENSE'
  | 'INCOME'
  | 'LIABILITY'
  | 'MUTUAL FUND'
  | 'PAYABLE'
  | 'RECEIVABLE';

export const ACCOUNT_TYPES: AccountType[] = [
  'ASSET',
  'BANK',
  'CASH',
  'CREDIT CARD',
  'CURRENCY',
  'EQUITY',
  'EXPENSE',
  'INCOME',
  'LIABILITY',
  'MUTUAL FUND',
  'PAYABLE',
  'RECEIVABLE'
];

export const getAccountColor = (type: string): string => {
  const upperType = type.toUpperCase();
  if (upperType.includes('ASSET') || upperType.includes('BANK') || upperType.includes('CASH')) return '#2196F3';
  if (upperType.includes('EQUITY')) return '#FF9800';
  if (upperType.includes('EXPENSE')) return '#F44336';
  if (upperType.includes('INCOME')) return '#4CAF50';
  if (upperType.includes('LIABILITY') || upperType.includes('PAYABLE')) return '#9C27B0';
  return '#2196F3';
};

export const getTopLevelColor = (name: string): string => {
  const upperName = name.toUpperCase();
  if (upperName.includes('ASSET')) return '#2196F3';
  if (upperName.includes('EQUITY')) return '#FF9800';
  if (upperName.includes('EXPENSE')) return '#F44336';
  if (upperName.includes('INCOME')) return '#4CAF50';
  if (upperName.includes('LIABILIT')) return '#9C27B0';
  return '#4CAF50';
};
