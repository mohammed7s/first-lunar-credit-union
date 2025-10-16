-- Disable Row Level Security temporarily
-- We're using wallet-based auth, not Supabase Auth, so auth.uid() returns null
-- TODO: Re-enable RLS when implementing proper Supabase Auth with SIWE

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_batches DISABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "View owned organizations" ON organizations;
DROP POLICY IF EXISTS "Create organizations" ON organizations;
DROP POLICY IF EXISTS "Update owned organizations" ON organizations;
DROP POLICY IF EXISTS "Org owners manage employees" ON employees;
DROP POLICY IF EXISTS "Users view own employment" ON employees;
DROP POLICY IF EXISTS "Org owners manage payroll" ON payroll_batches;
DROP POLICY IF EXISTS "Org owners view payroll items" ON payroll_items;
DROP POLICY IF EXISTS "Org owners view transactions" ON transactions;
