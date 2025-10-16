import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common queries

export const db = {
  // Users
  users: {
    create: async (
      wallet_address: string,
      wallet_type: 'obsidian' | 'metamask',
      additionalData?: { name?: string; email?: string; aztec_address?: string }
    ) => {
      const userData = {
        wallet_address,
        wallet_type,
        ...(additionalData || {})
      };

      return supabase
        .from('users')
        .insert(userData)
        .select()
        .single();
    },

    getByWallet: async (wallet_address: string) => {
      return supabase
        .from('users')
        .select('*')
        .eq('wallet_address', wallet_address)
        .single();
    },

    getByAztecAddress: async (aztec_address: string) => {
      return supabase
        .from('users')
        .select('*')
        .eq('aztec_address', aztec_address)
        .single();
    },

    update: async (wallet_address: string, updates: any) => {
      return supabase
        .from('users')
        .update(updates)
        .eq('wallet_address', wallet_address)
        .select()
        .single();
    },
  },

  // Organizations
  organizations: {
    create: async (name: string, owner_id: string, treasury_address: string, chain_id: number) => {
      return supabase
        .from('organizations')
        .insert({ name, owner_id, treasury_address, chain_id })
        .select()
        .single();
    },

    getByOwner: async (owner_id: string) => {
      return supabase
        .from('organizations')
        .select('*, employees(count)')
        .eq('owner_id', owner_id);
    },

    getById: async (id: string) => {
      return supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();
    },
  },

  // Employees
  employees: {
    create: async (data: { org_id: string; wallet_address: string; name: string; salary_amount: number }) => {
      return supabase
        .from('employees')
        .insert(data)
        .select()
        .single();
    },

    getByOrg: async (org_id: string) => {
      return supabase
        .from('employees')
        .select('*')
        .eq('org_id', org_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
    },

    update: async (id: string, updates: any) => {
      return supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    },

    delete: async (id: string) => {
      return supabase
        .from('employees')
        .update({ is_active: false })
        .eq('id', id);
    },
  },

  // Payroll Batches
  payroll: {
    createBatch: async (org_id: string, created_by: string, employees: any[]) => {
      const total_amount = employees.reduce((sum, e) => sum + e.amount, 0);

      // Create batch
      const { data: batch, error: batchError } = await supabase
        .from('payroll_batches')
        .insert({ org_id, created_by, total_amount, status: 'draft' })
        .select()
        .single();

      if (batchError || !batch) return { data: null, error: batchError };

      // Create items
      const items = employees.map(emp => ({
        batch_id: batch.id,
        employee_id: emp.employee_id,
        wallet_address: emp.wallet_address,
        amount: emp.amount,
        status: 'pending',
      }));

      const { error: itemsError } = await supabase
        .from('payroll_items')
        .insert(items);

      if (itemsError) return { data: null, error: itemsError };

      return { data: batch, error: null };
    },

    getBatches: async (org_id: string) => {
      return supabase
        .from('payroll_batches')
        .select('*, payroll_items(count)')
        .eq('org_id', org_id)
        .order('created_at', { ascending: false });
    },

    updateBatchStatus: async (batch_id: string, status: string, tx_hash?: string) => {
      return supabase
        .from('payroll_batches')
        .update({
          status,
          tx_hash,
          executed_at: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', batch_id);
    },
  },
};
