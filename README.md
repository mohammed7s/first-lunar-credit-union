# First Lunar Credit Union (FLCU)

Private payroll on Aztec Network with income pledging for credit access.

## Links

- **📺 Video Demo:** https://youtu.be/0hRkdZ-1oPE
- **🌐 Live App:** https://first-lunar-credit-union.netlify.app/

## What It Does

Stablecoin payroll with privacy. Businesses pay employees via Ethereum → Human Bridge → Aztec private vaults. Employees can pledge future salary for credit, enforced automatically by smart contracts.

## Repository Structure

```
├── frontend/          # React app (Vite + shadcn/ui)
├── backend/           # Express API (not deployed yet)
├── contracts/         # Aztec Noir contracts (IncomeVault)
├── database/          # Supabase schemas
└── docs/              # Implementation specs
```

## Tech Stack

- **Frontend:** React, TypeScript, Aztec.js, Wagmi, Supabase
- **Contracts:** Noir (Aztec smart contracts)
- **Bridge:** Human Bridge (Ethereum Sepolia ↔ Aztec)
- **Database:** Supabase

## User Flows

**Individual:** Register → Receive private salary → Withdraw or pledge income

**Business:** Create org → Add employees → Process payroll → Bridge to Aztec → Employees receive privately

## Bridging Flow

```
Ethereum USDC → Human Bridge Portal → Aztec L2 → Employee Private Vault
```

Bridge contracts (Sepolia): Portal `0x069840ae...`, Token `0x93527f05...`

## Development

```bash
yarn install
yarn dev           # Frontend at localhost:8084
yarn build         # Production build
```

### Contracts
```bash
cd contracts
yarn install
yarn ccc          # Compile + codegen
yarn test         # Run tests
```

### Test Bridge
```bash
cd frontend
export TEST_PRIVATE_KEY=your_key
yarn test:bridge
```


