// Shared types between frontend and backend

export type WalletType = 'obsidian' | 'metamask';

export interface User {
  id: string;
  wallet_address: string;
  wallet_type: WalletType;
  name?: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  owner_id: string;
  treasury_address: string;
  chain_id: number;
  created_at: string;
}

export interface Employee {
  id: string;
  org_id: string;
  user_id?: string;
  wallet_address: string;
  name: string;
  salary_amount: number;
  is_active: boolean;
  created_at: string;
}

export type PayrollBatchStatus = 'draft' | 'processing' | 'completed' | 'failed';

export interface PayrollBatch {
  id: string;
  org_id: string;
  created_by: string;
  status: PayrollBatchStatus;
  total_amount: number;
  tx_hash?: string;
  created_at: string;
  executed_at?: string;
}

export type PayrollItemStatus = 'pending' | 'success' | 'failed';

export interface PayrollItem {
  id: string;
  batch_id: string;
  employee_id: string;
  wallet_address: string;
  amount: number;
  status: PayrollItemStatus;
  error_message?: string;
}

export type TransactionType = 'payroll' | 'deposit' | 'other';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export interface Transaction {
  id: string;
  org_id: string;
  batch_id?: string;
  tx_hash: string;
  from_address: string;
  to_address: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: string;
}
