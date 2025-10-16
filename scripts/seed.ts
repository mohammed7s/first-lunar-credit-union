import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load .env file
config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role to bypass RLS

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Make sure you have SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set');
  console.error('You need the SERVICE_ROLE_KEY from Supabase dashboard > Settings > API');
  process.exit(1);
}

console.log('Using Supabase URL:', supabaseUrl);
console.log('Using service role key for seeding (bypasses RLS)');

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Seeding database...\n');

  // 1. Create test user
  console.log('Creating test user...');
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      wallet_address: '0x742d35cc6634c0532925a3b844bc9e7595f0c4f3',
      wallet_type: 'metamask',
      name: 'Alice (Test Owner)'
    })
    .select()
    .single();

  if (userError && userError.code !== '23505') { // 23505 = unique violation (already exists)
    console.error('❌ Error creating user:', userError);
    return;
  }

  const userId = user?.id || (await supabase
    .from('users')
    .select('id')
    .eq('wallet_address', '0x742d35cc6634c0532925a3b844bc9e7595f0c4f3')
    .single()).data?.id;

  console.log('✅ User created:', userId);

  // 2. Create test organization
  console.log('\nCreating test organization...');
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: 'Acme Corp',
      owner_id: userId,
      treasury_address: '0x742d35cc6634c0532925a3b844bc9e7595f0c4f3',
      chain_id: 11155111
    })
    .select()
    .single();

  if (orgError && orgError.code !== '23505') {
    console.error('❌ Error creating organization:', orgError);
    return;
  }

  const orgId = org?.id || (await supabase
    .from('organizations')
    .select('id')
    .eq('name', 'Acme Corp')
    .single()).data?.id;

  console.log('✅ Organization created:', orgId);

  // 3. Create test employees
  console.log('\nCreating test employees...');
  const employees = [
    {
      org_id: orgId,
      wallet_address: '0x8f3a2b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
      name: 'Bob Smith',
      salary_amount: 4500
    },
    {
      org_id: orgId,
      wallet_address: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
      name: 'Carol Williams',
      salary_amount: 6000
    },
    {
      org_id: orgId,
      wallet_address: '0x9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
      name: 'David Brown',
      salary_amount: 5200
    }
  ];

  const { error: empError } = await supabase
    .from('employees')
    .upsert(employees, { onConflict: 'org_id,wallet_address' });

  if (empError) {
    console.error('❌ Error creating employees:', empError);
    return;
  }

  console.log(`✅ Created ${employees.length} employees`);

  // 4. Verify data
  console.log('\n📊 Database Summary:');
  const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const { count: orgCount } = await supabase.from('organizations').select('*', { count: 'exact', head: true });
  const { count: empCount } = await supabase.from('employees').select('*', { count: 'exact', head: true });

  console.log(`Users: ${userCount}`);
  console.log(`Organizations: ${orgCount}`);
  console.log(`Employees: ${empCount}`);

  console.log('\n✅ Seeding complete!');
}

seed().catch(console.error);
