# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in / Create account
3. Click "New Project"
4. Fill in:
   - **Name:** `aztec-payroll` (or your choice)
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to you
5. Click "Create new project" (takes ~2 minutes)

## Step 2: Run Database Migration

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

## Step 3: Get API Keys

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** tab
3. Copy these values:

   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon public key: eyJhbGc...
   service_role key: eyJhbGc... (keep secret!)
   ```

## Step 4: Configure Environment Variables

1. Create `.env` file in project root:

```bash
cp .env.example .env
```

2. Fill in the values:

```env
# Supabase
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API
API_PORT=3001
FRONTEND_URL=http://localhost:8080
```

## Step 5: Install Dependencies

```bash
yarn install
```

## Step 6: Test Connection

Create a test file to verify connection:

```typescript
// test-db.ts
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function test() {
  const { data, error } = await supabase
    .from('users')
    .select('count');

  if (error) {
    console.error('❌ Connection failed:', error);
  } else {
    console.log('✅ Connected to Supabase!');
    console.log('Users count:', data);
  }
}

test();
```

Run it:
```bash
tsx test-db.ts
```

## Step 7: Disable Email Confirmation (for Development)

For easier testing with wallet auth:

1. Go to **Authentication** > **Providers** > **Email**
2. Scroll down to **Email Confirmation**
3. Toggle OFF "Enable email confirmations"
4. Click Save

## Done! 🎉

Your database is ready. Now you can use the TypeScript client:

```typescript
// Example: Create a user
const { data: user } = await supabase
  .from('users')
  .insert({
    wallet_address: '0x...',
    wallet_type: 'metamask'
  })
  .select()
  .single();

// Example: Query organizations
const { data: orgs } = await supabase
  .from('organizations')
  .select('*, employees(count)')
  .eq('owner_id', user.id);
```

## Troubleshooting

**"relation does not exist"**
- Make sure you ran the migration SQL in Step 2

**"JWT expired" or auth errors**
- Check your API keys are correct in `.env`
- Make sure you're using the right key (anon for frontend, service_role for backend)

**Row Level Security blocking queries**
- For testing, you can temporarily disable RLS:
  ```sql
  ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
  ```
