-- Drop the existing function with cascade
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Recreate the trigger first (this will be created after the function)
-- Create comprehensive default chart of accounts function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_assets_id uuid;
  v_current_assets_id uuid;
  v_equity_id uuid;
  v_expenses_id uuid;
  v_auto_id uuid;
  v_entertainment_id uuid;
  v_insurance_id uuid;
  v_taxes_id uuid;
  v_utilities_id uuid;
  v_income_id uuid;
  v_liabilities_id uuid;
  v_timestamp bigint;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  
  v_timestamp := extract(epoch from now()) * 1000;
  
  -- Create top-level Assets account
  INSERT INTO public.accounts (user_id, name, account_type, color, currency, created_at)
  VALUES (new.id, 'Assets', 'ASSET', '#2196F3', 'INR (Indian Rupee)', v_timestamp)
  RETURNING id INTO v_assets_id;
  
  -- Create Current-Assets sub-account
  INSERT INTO public.accounts (user_id, name, account_type, color, currency, parent_id, created_at)
  VALUES (new.id, 'Current-Assets', 'ASSET', '#2196F3', 'INR (Indian Rupee)', v_assets_id, v_timestamp)
  RETURNING id INTO v_current_assets_id;
  
  -- Create asset accounts under Current-Assets
  INSERT INTO public.accounts (user_id, name, account_type, color, currency, parent_id, created_at)
  VALUES 
    (new.id, 'Cash in wallet', 'CASH', '#2196F3', 'INR (Indian Rupee)', v_current_assets_id, v_timestamp),
    (new.id, 'Checking Account', 'BANK', '#2196F3', 'INR (Indian Rupee)', v_current_assets_id, v_timestamp),
    (new.id, 'Saving Account', 'BANK', '#2196F3', 'INR (Indian Rupee)', v_current_assets_id, v_timestamp);
  
  -- Create top-level Equity account
  INSERT INTO public.accounts (user_id, name, account_type, color, currency, created_at)
  VALUES (new.id, 'Equity', 'EQUITY', '#FF9800', 'INR (Indian Rupee)', v_timestamp)
  RETURNING id INTO v_equity_id;
  
  -- Create Opening Balance under Equity
  INSERT INTO public.accounts (user_id, name, account_type, color, currency, parent_id, created_at)
  VALUES (new.id, 'Opening Balance', 'EQUITY', '#FF9800', 'INR (Indian Rupee)', v_equity_id, v_timestamp);
  
  -- Create top-level Expenses account
  INSERT INTO public.accounts (user_id, name, account_type, color, currency, created_at)
  VALUES (new.id, 'Expenses', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_timestamp)
  RETURNING id INTO v_expenses_id;
  
  -- Create main expense accounts
  INSERT INTO public.accounts (user_id, name, account_type, color, currency, parent_id, created_at)
  VALUES 
    (new.id, 'Adjustment', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp),
    (new.id, 'Bank Service Charge', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp),
    (new.id, 'Books', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp),
    (new.id, 'Cable', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp),
    (new.id, 'Charity', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp),
    (new.id, 'Clothes', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp),
    (new.id, 'Computer', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp),
    (new.id, 'Dining', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp),
    (new.id, 'Education', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp),
    (new.id, 'Gifts', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp),
    (new.id, 'Groceries', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp),
    (new.id, 'Hobbies', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp),
    (new.id, 'Laundry/Dry Cleaning', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp),
    (new.id, 'Medical Expenses', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp),
    (new.id, 'Miscellaneous', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp),
    (new.id, 'Online Services', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp),
    (new.id, 'Phone', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp),
    (new.id, 'Public Transportation', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp),
    (new.id, 'Subscriptions', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp),
    (new.id, 'Supplies', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp);
  
  -- Create Auto expense account with sub-accounts
  INSERT INTO public.accounts (user_id, name, account_type, color, currency, parent_id, created_at)
  VALUES (new.id, 'Auto', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp)
  RETURNING id INTO v_auto_id;
  
  INSERT INTO public.accounts (user_id, name, account_type, color, currency, parent_id, created_at)
  VALUES 
    (new.id, 'Fees', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_auto_id, v_timestamp),
    (new.id, 'Parking', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_auto_id, v_timestamp),
    (new.id, 'Petrol', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_auto_id, v_timestamp),
    (new.id, 'Repair and Maintenance', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_auto_id, v_timestamp);
  
  -- Create Entertainment expense account with sub-accounts
  INSERT INTO public.accounts (user_id, name, account_type, color, currency, parent_id, created_at)
  VALUES (new.id, 'Entertainment', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp)
  RETURNING id INTO v_entertainment_id;
  
  INSERT INTO public.accounts (user_id, name, account_type, color, currency, parent_id, created_at)
  VALUES 
    (new.id, 'Music/Movies', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_entertainment_id, v_timestamp),
    (new.id, 'Recreation', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_entertainment_id, v_timestamp),
    (new.id, 'Travel', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_entertainment_id, v_timestamp);
  
  -- Create Insurance expense account with sub-accounts
  INSERT INTO public.accounts (user_id, name, account_type, color, currency, parent_id, created_at)
  VALUES (new.id, 'Insurance', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp)
  RETURNING id INTO v_insurance_id;
  
  INSERT INTO public.accounts (user_id, name, account_type, color, currency, parent_id, created_at)
  VALUES 
    (new.id, 'Auto Insurance', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_insurance_id, v_timestamp),
    (new.id, 'Health Insurance', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_insurance_id, v_timestamp),
    (new.id, 'Life Insurance', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_insurance_id, v_timestamp);
  
  -- Create Taxes expense account with sub-accounts
  INSERT INTO public.accounts (user_id, name, account_type, color, currency, parent_id, created_at)
  VALUES (new.id, 'Taxes', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp)
  RETURNING id INTO v_taxes_id;
  
  INSERT INTO public.accounts (user_id, name, account_type, color, currency, parent_id, created_at)
  VALUES 
    (new.id, 'Federal', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_taxes_id, v_timestamp),
    (new.id, 'Medicare', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_taxes_id, v_timestamp),
    (new.id, 'Other Tax', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_taxes_id, v_timestamp),
    (new.id, 'Social Security', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_taxes_id, v_timestamp),
    (new.id, 'State/Province', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_taxes_id, v_timestamp);
  
  -- Create Utilities expense account with sub-accounts
  INSERT INTO public.accounts (user_id, name, account_type, color, currency, parent_id, created_at)
  VALUES (new.id, 'Utilities', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_expenses_id, v_timestamp)
  RETURNING id INTO v_utilities_id;
  
  INSERT INTO public.accounts (user_id, name, account_type, color, currency, parent_id, created_at)
  VALUES 
    (new.id, 'Electric', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_utilities_id, v_timestamp),
    (new.id, 'Garbage collection', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_utilities_id, v_timestamp),
    (new.id, 'Gas', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_utilities_id, v_timestamp),
    (new.id, 'Water', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', v_utilities_id, v_timestamp);
  
  -- Create top-level Income account
  INSERT INTO public.accounts (user_id, name, account_type, color, currency, created_at)
  VALUES (new.id, 'Income', 'INCOME', '#4CAF50', 'INR (Indian Rupee)', v_timestamp)
  RETURNING id INTO v_income_id;
  
  -- Create income accounts
  INSERT INTO public.accounts (user_id, name, account_type, color, currency, parent_id, created_at)
  VALUES 
    (new.id, 'Bonus', 'INCOME', '#4CAF50', 'INR (Indian Rupee)', v_income_id, v_timestamp),
    (new.id, 'Gifts Received', 'INCOME', '#4CAF50', 'INR (Indian Rupee)', v_income_id, v_timestamp),
    (new.id, 'Interest Income', 'INCOME', '#4CAF50', 'INR (Indian Rupee)', v_income_id, v_timestamp),
    (new.id, 'Other Income', 'INCOME', '#4CAF50', 'INR (Indian Rupee)', v_income_id, v_timestamp),
    (new.id, 'Salary', 'INCOME', '#4CAF50', 'INR (Indian Rupee)', v_income_id, v_timestamp);
  
  -- Create top-level Liabilities account
  INSERT INTO public.accounts (user_id, name, account_type, color, currency, created_at)
  VALUES (new.id, 'Liabilities', 'LIABILITY', '#9C27B0', 'INR (Indian Rupee)', v_timestamp)
  RETURNING id INTO v_liabilities_id;
  
  -- Create Credit card under Liabilities
  INSERT INTO public.accounts (user_id, name, account_type, color, currency, parent_id, created_at)
  VALUES (new.id, 'Credit card', 'CREDIT CARD', '#9C27B0', 'INR (Indian Rupee)', v_liabilities_id, v_timestamp);
  
  RETURN new;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();