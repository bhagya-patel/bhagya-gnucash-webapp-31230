-- Fix search_path security warning
CREATE OR REPLACE FUNCTION public.update_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = extract(epoch from now()) * 1000;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;