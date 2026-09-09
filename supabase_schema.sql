-- ============================================================================
-- EXPENSEX – SUPABASE POSTGRESQL SCHEMA & ROW LEVEL SECURITY (RLS)
-- Run this script in your Supabase Project: SQL Editor -> New Query -> Run
-- ============================================================================

-- 1. Create Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    type TEXT NOT NULL CHECK (type IN ('Income', 'Expense', 'income', 'expense')),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Index on user_id and date for fast querying
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 4. Drop Existing Policies if any (ensures clean idempotent script)
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;

-- 5. Create RLS Policies

-- SELECT Policy: A user can only view their own transactions
CREATE POLICY "Users can view their own transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT Policy: A user can only insert records belonging to their user_id
CREATE POLICY "Users can insert their own transactions"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE Policy: A user can only update their own transactions
CREATE POLICY "Users can update their own transactions"
ON public.transactions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE Policy: A user can only delete their own transactions
CREATE POLICY "Users can delete their own transactions"
ON public.transactions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Grant appropriate permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
