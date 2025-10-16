-- Initial schema for Aztec Payroll
-- Run this once in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  wallet_type TEXT CHECK (wallet_type IN ('obsidian', 'metamask')) NOT NULL,
  name TEXT,
  email TEXT,
  aztec_address TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_aztec ON users(aztec_address);

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  treasury_address TEXT NOT NULL,
  chain_id INTEGER NOT NULL DEFAULT 11155111,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_owner ON organizations(owner_id);

-- Employees table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  wallet_address TEXT NOT NULL,
  name TEXT NOT NULL,
  salary_amount DECIMAL(20, 6) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_org_wallet UNIQUE (org_id, wallet_address)
);

CREATE INDEX idx_employees_org ON employees(org_id);
CREATE INDEX idx_employees_user ON employees(user_id);
CREATE INDEX idx_employees_wallet ON employees(wallet_address);

-- Payroll batches table
CREATE TABLE payroll_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  status TEXT CHECK (status IN ('draft', 'processing', 'completed', 'failed')) DEFAULT 'draft',
  total_amount DECIMAL(20, 6) NOT NULL DEFAULT 0,
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  executed_at TIMESTAMPTZ
);

CREATE INDEX idx_payroll_batches_org ON payroll_batches(org_id);
CREATE INDEX idx_payroll_batches_status ON payroll_batches(status);

-- Payroll items table
CREATE TABLE payroll_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES payroll_batches(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id),
  wallet_address TEXT NOT NULL,
  amount DECIMAL(20, 6) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
  error_message TEXT
);

CREATE INDEX idx_payroll_items_batch ON payroll_items(batch_id);
CREATE INDEX idx_payroll_items_employee ON payroll_items(employee_id);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES payroll_batches(id) ON DELETE SET NULL,
  tx_hash TEXT UNIQUE NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount DECIMAL(20, 6) NOT NULL,
  type TEXT CHECK (type IN ('payroll', 'deposit', 'other')) DEFAULT 'other',
  status TEXT CHECK (status IN ('pending', 'confirmed', 'failed')) DEFAULT 'pending',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_org ON transactions(org_id);
CREATE INDEX idx_transactions_hash ON transactions(tx_hash);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for organizations
CREATE POLICY "View owned organizations" ON organizations
  FOR SELECT USING (auth.uid()::text = owner_id::text);

CREATE POLICY "Create organizations" ON organizations
  FOR INSERT WITH CHECK (auth.uid()::text = owner_id::text);

CREATE POLICY "Update owned organizations" ON organizations
  FOR UPDATE USING (auth.uid()::text = owner_id::text);

-- RLS Policies for employees
CREATE POLICY "Org owners manage employees" ON employees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE id = employees.org_id AND owner_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users view own employment" ON employees
  FOR SELECT USING (user_id::text = auth.uid()::text);

-- RLS Policies for payroll batches
CREATE POLICY "Org owners manage payroll" ON payroll_batches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE id = payroll_batches.org_id AND owner_id::text = auth.uid()::text
    )
  );

-- RLS Policies for payroll items
CREATE POLICY "Org owners view payroll items" ON payroll_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM payroll_batches pb
      JOIN organizations o ON o.id = pb.org_id
      WHERE pb.id = payroll_items.batch_id AND o.owner_id::text = auth.uid()::text
    )
  );

-- RLS Policies for transactions
CREATE POLICY "Org owners view transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE id = transactions.org_id AND owner_id::text = auth.uid()::text
    )
  );
