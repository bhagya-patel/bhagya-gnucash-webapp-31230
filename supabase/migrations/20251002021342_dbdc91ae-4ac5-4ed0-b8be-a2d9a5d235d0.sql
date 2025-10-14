-- Create accounts table with user association
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT DEFAULT '',
  parent_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  currency TEXT NOT NULL,
  notes TEXT DEFAULT '',
  placeholder BOOLEAN DEFAULT false,
  hidden BOOLEAN DEFAULT false,
  favorite BOOLEAN DEFAULT false,
  balance NUMERIC DEFAULT 0,
  created_at BIGINT NOT NULL,
  CONSTRAINT valid_account_type CHECK (account_type IN ('ASSET', 'EQUITY', 'EXPENSE', 'INCOME', 'LIABILITY'))
);

-- Enable Row Level Security
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own accounts" 
ON public.accounts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own accounts" 
ON public.accounts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" 
ON public.accounts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts" 
ON public.accounts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  
  -- Create default accounts for new user
  INSERT INTO public.accounts (user_id, name, account_type, color, currency, created_at)
  VALUES
    (new.id, 'Assets', 'ASSET', '#2196F3', 'INR (Indian Rupee)', extract(epoch from now()) * 1000),
    (new.id, 'Equity', 'EQUITY', '#FF9800', 'INR (Indian Rupee)', extract(epoch from now()) * 1000),
    (new.id, 'Expenses', 'EXPENSE', '#F44336', 'INR (Indian Rupee)', extract(epoch from now()) * 1000),
    (new.id, 'Income', 'INCOME', '#4CAF50', 'INR (Indian Rupee)', extract(epoch from now()) * 1000),
    (new.id, 'Liabilities', 'LIABILITY', '#9C27B0', 'INR (Indian Rupee)', extract(epoch from now()) * 1000);
  
  RETURN new;
END;
$$;

-- Trigger to create profile and default accounts on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();