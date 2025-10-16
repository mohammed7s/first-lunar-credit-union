-- Add email and aztec_address columns to users table
-- Run this in Supabase SQL Editor if you already ran 001_initial_schema.sql

-- Add email column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add aztec_address column with unique constraint
ALTER TABLE users
ADD COLUMN IF NOT EXISTS aztec_address TEXT UNIQUE;

-- Create index on aztec_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_aztec ON users(aztec_address);
