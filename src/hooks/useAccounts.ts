import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Account, AccountType } from '@/types/account';

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async (): Promise<Account[]> => {
      const { data, error } = await (supabase as any)
        .from('accounts')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      return (data || []).map((acc: any) => ({
        id: acc.id,
        name: acc.name,
        accountType: acc.account_type as AccountType,
        parentId: acc.parent_id,
        color: acc.color,
        currency: acc.currency,
        balance: Number(acc.balance || 0),
        hidden: acc.hidden || false,
        favorite: acc.favorite || false,
        placeholder: acc.placeholder || false,
        notes: acc.notes || '',
        description: acc.description || '',
        createdAt: acc.created_at,
        updatedAt: acc.updated_at,
      }));
    },
  });
}

// Helper function to get all child accounts recursively
export function getChildAccounts(accounts: Account[], parentId: string): Account[] {
  const children: Account[] = [];
  for (const acc of accounts) {
    if (acc.parentId === parentId) {
      children.push(acc);
      children.push(...getChildAccounts(accounts, acc.id));
    }
  }
  return children;
}

// Helper to get top-level accounts by type
export function getAccountsByType(accounts: Account[], type: string): Account[] {
  return accounts.filter(a => 
    a.accountType.toUpperCase() === type.toUpperCase() && !a.parentId
  );
}

// Helper to calculate total balance for an account and its children
export function calculateTotalBalance(accounts: Account[], accountId: string): number {
  const account = accounts.find(a => a.id === accountId);
  if (!account) return 0;
  
  const children = getChildAccounts(accounts, accountId);
  const childrenTotal = children.reduce((sum, child) => sum + child.balance, 0);
  
  return account.balance + childrenTotal;
}
