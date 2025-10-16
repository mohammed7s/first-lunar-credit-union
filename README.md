# First Lunar Credit Union (FLCU)

A privacy-preserving payroll system on Aztec Network where employees can receive salary payments and pledge a percentage of their income to external creditors with automatic enforcement via smart contracts.

## Monorepo Structure

```
first-lunar-credit-union/
├── frontend/          # React + Vite frontend application
├── backend/           # Express API server
├── contracts/         # Aztec Noir smart contracts
├── database/          # Supabase migrations and schemas
├── shared/            # Shared types and utilities
├── docs/              # Documentation and AI context
│   └── ai-context/    # Specifications and architecture docs
├── scripts/           # Build and deployment scripts
└── package.json       # Root workspace configuration
```

## Tech Stack

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **Aztec SDK** - Privacy-preserving blockchain
- **Wagmi** - Ethereum wallet integration
- **Supabase** - Database client

### Backend
- **Express** - API server
- **TypeScript** - Type safety
- **Supabase** - Database
- **SIWE** - Sign-In with Ethereum

### Contracts
- **Noir** - Aztec smart contract language
- **Aztec Network** - Privacy-first L2

## Getting Started

### Prerequisites

- **Node.js** v18+ and npm/yarn - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **Aztec Sandbox** (for contract development) - [Aztec Docs](https://docs.aztec.network/)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd first-lunar-credit-union

# Install all workspace dependencies
yarn install
```

### Development

```bash
# Run frontend only (http://localhost:8084)
yarn dev

# Run backend only (http://localhost:3001)
yarn api:dev

# Run both frontend and backend concurrently
yarn dev:all
```

### Building

```bash
# Build frontend
yarn build

# Build backend
yarn api:build

# Build both
yarn build:all
```

### Working with Workspaces

Each folder (frontend, backend, shared) is a separate workspace with its own package.json.

```bash
# Add a package to frontend only
yarn workspace frontend add <package-name>

# Add a package to backend only
yarn workspace backend add <package-name>

# Run a script in a specific workspace
yarn workspace frontend <script-name>
yarn workspace backend <script-name>
```

## Environment Variables

Each workspace has its own `.env` file for easy separation when migrating to separate repos.

### Frontend Environment Variables

```bash
cd frontend
cp .env.example .env
```

Key variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_SEPOLIA_RPC_URL` - Ethereum Sepolia RPC URL
- `VITE_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID

### Backend Environment Variables

```bash
cd backend
cp .env.example .env
```

Key variables:
- `API_PORT` - Backend API port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `JWT_SECRET` - JWT signing secret

## Project Features

### Core Functionality
1. **Privacy-First Payroll** - Employees receive payments on Aztec Network
2. **Pledge Management** - Pledge future income to creditors
3. **Automatic Enforcement** - Smart contracts enforce pledge deductions
4. **Balance Proofs** - Generate ZK proofs of balance without revealing amounts
5. **Multi-Wallet Support** - Obsidian (Aztec) + Ethereum wallets

### Architecture Highlights
- **Per-Employee Vaults** - Each employee gets their own PayrollVault contract instance
- **Private State** - All balances encrypted to employee
- **Priority System** - Pledges processed by priority order
- **Percentage Deductions** - Flexible % of each paycheck

## Documentation

See `docs/ai-context/` for detailed specifications:
- `PAYROLL_VAULT_ARCHITECTURE.md` - Complete architectural design
- `PAYROLL_VAULT_IMPLEMENTATION_SPEC.md` - Implementation guide
- `AZTEC_TRANSACTION_PLAN.md` - Transaction flow patterns
- `SUPABASE_SETUP.md` - Database schema and setup

## Deployment

### Frontend
```bash
yarn build
# Deploy dist/ folder to your hosting provider
```

### Backend
```bash
yarn api:build
# Deploy with PM2, Docker, or your preferred method
```

### Contracts
See `contracts/` folder for Aztec contract deployment instructions.

## Contributing

This is a monorepo structure that makes it easy to:
- Work on frontend/backend independently
- Share types and utilities via `shared/` workspace
- Split into separate repos in the future if needed

Each workspace is self-contained and can be moved to its own repository.

## License

[Your License Here]
