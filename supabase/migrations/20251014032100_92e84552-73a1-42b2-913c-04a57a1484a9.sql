-- Drop the old check constraint if it exists
ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS valid_account_type;

-- Add new check constraint with all valid account types
ALTER TABLE public.accounts ADD CONSTRAINT valid_account_type 
CHECK (account_type IN (
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
));