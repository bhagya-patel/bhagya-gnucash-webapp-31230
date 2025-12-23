-- Add updated_at column to accounts table
ALTER TABLE public.accounts 
ADD COLUMN updated_at bigint DEFAULT (extract(epoch from now()) * 1000);

-- Update existing records to have updated_at equal to created_at
UPDATE public.accounts SET updated_at = created_at WHERE updated_at IS NULL;

-- Make updated_at NOT NULL after setting values
ALTER TABLE public.accounts ALTER COLUMN updated_at SET NOT NULL;

-- Create trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = extract(epoch from now()) * 1000;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER accounts_updated_at_trigger
BEFORE UPDATE ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_accounts_updated_at();