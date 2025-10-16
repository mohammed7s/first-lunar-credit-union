# PayrollVault Smart Contract Implementation Specification

## Project Context

We are building a **privacy-preserving payroll system** on Aztec Network where employees can receive salary payments and pledge a percentage of their income to external creditors (lenders, friends, etc.). The pledge enforcement happens automatically via smart contract when payroll is received.

## Core Problem Statement

**Challenge**: Employees want to borrow money or get salary advances, pledging future income as collateral. Traditional solutions require trust. We need a **trustless, privacy-preserving** way to:

1. Enforce automatic deductions from salary
2. Keep employee balances private
3. Allow employees to control their pledges
4. Generate proofs of balance without revealing amounts

## Architecture Decision: Per-Employee Vault Instances

**Why Not a Single Vault?**
- Aztec's private state is encrypted per-address
- A single vault cannot track multiple employees' private balances
- Privacy model is inherently account-centric

**Solution: Each Employee Gets Their Own Vault Contract**
```
Employee Signs Up
    ↓
Deploy PayrollVault Instance (unique contract address for employee)
    ↓
Employer sends salary → Employee's Vault Address (not employee's wallet)
    ↓
Vault automatically enforces pledges and pays creditors
    ↓
Remaining funds stay in vault (private balance)
    ↓
Employee withdraws available funds to their wallet
```

## Contract Requirements

### Contract Name: `PayrollVault`

### Core Functionality

#### 1. **Initialization**
```noir
#[aztec(private)]
#[aztec(initializer)]
fn constructor(owner: AztecAddress)
```
- Sets the owner (employee) of this vault instance
- Owner is the only one who can manage pledges and withdraw

#### 2. **Receive Payment** (Most Critical Function)
```noir
#[aztec(private)]
fn receive_payment(
    token: AztecAddress,
    amount: u128,
    from: AztecAddress
) -> u128
```

**Behavior:**
1. Accept payment from employer
2. Get all active pledges for this token
3. Sort pledges by priority (highest first)
4. For each pledge:
   - Calculate deduction: `min(pledge.percentage * amount / 100, pledge.amount_remaining, available_funds)`
   - Transfer to creditor
   - Update pledge.amount_remaining
   - If fully paid, mark pledge as inactive
5. Credit remaining amount to owner's private balance
6. Return net amount (for frontend display)

**Example:**
```
Payment: $2000 USDC
Pledge 1: 15% to Lender A (owes $1000, priority 1)
Pledge 2: 10% to Friend B (owes $500, priority 2)

Deductions:
- Lender A: $300 (15% of $2000)
- Friend B: $200 (10% of $2000)
- Total deductions: $500

Net to employee: $1500
```

#### 3. **Add Pledge**
```noir
#[aztec(private)]
fn add_pledge(
    creditor: AztecAddress,
    token: AztecAddress,
    total_amount: u128,
    percentage_per_payment: u8,  // 0-100
    priority: u8
)
```

**Validation:**
- Only owner can call
- percentage_per_payment <= 100
- Store pledge in private state

#### 4. **Remove Pledge**
```noir
#[aztec(private)]
fn remove_pledge(creditor: AztecAddress)
```

**Behavior:**
- Mark pledge as inactive
- Update total_pledged counter

#### 5. **Withdraw**
```noir
#[aztec(private)]
fn withdraw(
    token: AztecAddress,
    amount: u128,
    recipient: AztecAddress
)
```

**Validation:**
- Only owner can withdraw
- Check: `amount <= (total_balance - total_pledged_remaining)`
- Transfer tokens to recipient

#### 6. **View Functions**
```noir
#[aztec(private)]
unconstrained fn get_balance(token: AztecAddress, owner: AztecAddress) -> u128

#[aztec(private)]
unconstrained fn get_available_balance(token: AztecAddress, owner: AztecAddress) -> u128

#[aztec(private)]
unconstrained fn get_pledge(creditor: AztecAddress, owner: AztecAddress) -> PledgeInfo

#[aztec(private)]
unconstrained fn get_total_pledged(token: AztecAddress, owner: AztecAddress) -> u128
```

#### 7. **Balance Proof** (Advanced Feature - Optional for MVP)
```noir
#[aztec(private)]
fn prove_balance_above_threshold(
    token: AztecAddress,
    threshold: u128
) -> bool
```

**Purpose:** Generate ZK proof that balance >= threshold without revealing exact balance

## Storage Structure

Based on Aztec patterns from Counter tutorial and token contracts:

```noir
use dep::aztec::macros::aztec;

#[aztec]
pub contract PayrollVault {
    use dep::aztec::{
        macros::{functions::{initializer, private, utility}, storage::storage},
        protocol_types::{address::AztecAddress, traits::ToField},
        state_vars::{Map, PrivateMutable, PublicMutable},
    };
    use dep::value_note::value_note::ValueNote;

    // Custom note type for pledges
    struct PledgeNote {
        creditor: AztecAddress,
        token: AztecAddress,
        total_amount: u128,
        amount_remaining: u128,
        percentage_per_payment: u8,
        priority: u8,
        active: bool,
    }

    #[storage]
    struct Storage<Context> {
        // Owner of this vault
        owner: PrivateMutable<AztecAddress, Context>,

        // Token balances: token_address → balance
        balances: Map<AztecAddress, PrivateMutable<ValueNote, Context>, Context>,

        // Pledges: creditor_address → pledge_info
        pledges: Map<AztecAddress, PrivateMutable<PledgeNote, Context>, Context>,

        // Total pledged per token (for quick available balance calculation)
        total_pledged: Map<AztecAddress, PublicMutable<u128, Context>, Context>,
    }

    // ... functions here
}
```

## Key Technical Considerations

### 1. **Note Management**
- Use `ValueNote` for token balances
- Create custom `PledgeNote` for pledge information
- Private state is automatically encrypted to owner

### 2. **Token Transfers**
- When paying creditors, call token contract's transfer function
- Require authwit (authorization witness) for transfers from vault
- Example pattern from token contracts:
```noir
Token::at(token_address).transfer(recipient, amount).call(&mut context)
```

### 3. **Sorting Pledges**
- Need to implement sorting by priority
- Process highest priority pledges first
- Stop when funds run out

### 4. **Edge Cases to Handle**
- Payment amount = 0
- No active pledges
- Insufficient funds for all pledges (partial fulfillment)
- Pledge fully paid (remove from active)
- Token contract doesn't exist
- Unauthorized access attempts

### 5. **Gas Optimization**
- Batch pledge updates
- Only update state when necessary
- Consider max number of pledges per payment (e.g., 5-10)

## Testing Requirements

### Test Suite Structure (using Aztec test framework)

```typescript
// test/PayrollVault.test.ts
import { describe, it, expect } from '@jest/globals';
import {
  createPXEClient,
  waitForPXE,
  AztecAddress
} from '@aztec/aztec.js';
import { getInitialTestAccountsWallets } from '@aztec/accounts/testing';
import { PayrollVaultContract } from '../artifacts/PayrollVault';
import { TokenContract } from '@aztec/noir-contracts.js/Token';

describe('PayrollVault', () => {
  let pxe: PXE;
  let owner, employer, creditor1, creditor2;
  let vault: PayrollVaultContract;
  let token: TokenContract;

  beforeAll(async () => {
    // Setup PXE and accounts
    pxe = createPXEClient('http://localhost:8080');
    await waitForPXE(pxe);

    [owner, employer, creditor1, creditor2] =
      await getInitialTestAccountsWallets(pxe);
  });

  // Test cases below...
});
```

### Required Test Cases

#### Basic Functionality
1. ✅ **Deploy vault with owner**
2. ✅ **Owner can add pledge**
3. ✅ **Owner can remove pledge**
4. ✅ **Non-owner cannot add/remove pledges**

#### Payment Processing
5. ✅ **Receive payment with no pledges** (full amount to employee)
6. ✅ **Receive payment with one pledge** (deduct percentage)
7. ✅ **Receive payment with multiple pledges** (priority order)
8. ✅ **Pledge fully paid off** (mark inactive, stop deductions)
9. ✅ **Insufficient funds for all pledges** (partial fulfillment by priority)

#### Withdrawal
10. ✅ **Owner can withdraw available balance**
11. ✅ **Cannot withdraw pledged amounts**
12. ✅ **Non-owner cannot withdraw**

#### Balance Queries
13. ✅ **Get total balance**
14. ✅ **Get available balance** (total - pledged)
15. ✅ **Get pledge details**

#### Edge Cases
16. ✅ **Handle zero payment amount**
17. ✅ **Handle percentage = 0**
18. ✅ **Handle percentage = 100** (all to creditor)
19. ✅ **Multiple payments in sequence** (pledge decreases correctly)

### Example Test Case

```typescript
it('should deduct pledge percentage and pay creditor', async () => {
  // Deploy vault for employee
  const vault = await PayrollVaultContract.deploy(
    owner.getAddress()
  ).send().deployed();

  // Deploy token contract
  const token = await TokenContract.deploy(
    owner,
    'USDC',
    'USDC',
    6
  ).send().deployed();

  // Mint tokens to employer
  await token.methods.mint_to_private(
    employer.getAddress(),
    parseUnits('10000', 6)
  ).send().wait();

  // Employee adds pledge: 20% to creditor1
  await vault.methods.add_pledge(
    creditor1.getAddress(),
    token.address,
    parseUnits('1000', 6),  // owes $1000
    20,  // 20% per payment
    1    // priority
  ).send({ origin: owner }).wait();

  // Employer pays $2000 salary
  await token.methods.transfer_private(
    vault.address,
    parseUnits('2000', 6)
  ).send({ origin: employer }).wait();

  await vault.methods.receive_payment(
    token.address,
    parseUnits('2000', 6),
    employer.getAddress()
  ).send({ origin: employer }).wait();

  // Verify creditor received $400 (20% of $2000)
  const creditorBalance = await token.methods
    .balance_of_private(creditor1.getAddress())
    .simulate();
  expect(creditorBalance).toBe(parseUnits('400', 6));

  // Verify employee received $1600 net
  const employeeBalance = await vault.methods
    .get_balance(token.address, owner.getAddress())
    .simulate();
  expect(employeeBalance).toBe(parseUnits('1600', 6));

  // Verify pledge remaining decreased
  const pledge = await vault.methods
    .get_pledge(creditor1.getAddress(), owner.getAddress())
    .simulate();
  expect(pledge.amount_remaining).toBe(parseUnits('600', 6));
});
```

## Reference Implementations

### Counter Contract Pattern
```noir
// From Aztec tutorial
#[storage]
struct Storage<Context> {
    counters: Map<AztecAddress, EasyPrivateUint<Context>, Context>,
}

#[private]
fn increment(owner: AztecAddress) {
    let counters = storage.counters;
    counters.at(owner).add(1, owner);
}

unconstrained fn get_counter(owner: AztecAddress) -> Field {
    storage.counters.at(owner).get_value()
}
```

### Token Transfer Pattern
```noir
// From Aztec token contracts
Token::at(token_address).transfer(to, amount).call(&mut context)
```

### Note Handling
```noir
// Reading private state
let value = storage.balances.at(token).read();

// Writing private state
storage.balances.at(token).write(new_value);

// Using Map
storage.pledges.at(creditor).write(pledge_note);
```

## Dependencies (Nargo.toml)

```toml
[package]
name = "payroll_vault"
type = "contract"
authors = ["Your Team"]

[dependencies]
aztec = { git="https://github.com/AztecProtocol/aztec-packages/", tag="v2.0.2", directory="noir-projects/aztec-nr/aztec" }
value_note = { git="https://github.com/AztecProtocol/aztec-packages/", tag="v2.0.2", directory="noir-projects/aztec-nr/value-note"}
```

## Build & Test Commands

```bash
# Compile contract
aztec-nargo compile

# Process contract (transpile for AVM, generate VKs)
aztec-postprocess-contract

# Generate TypeScript artifacts
aztec codegen -o artifacts target

# Run Noir tests (in-contract tests)
aztec test

# Run JavaScript/TypeScript tests
bun test  # or npm test / yarn test
```

## Success Criteria

### MVP Complete When:
1. ✅ Contract compiles without errors
2. ✅ All basic test cases pass
3. ✅ Can deploy vault on sandbox
4. ✅ Can add/remove pledges
5. ✅ Payment correctly deducts pledges
6. ✅ Can withdraw available balance
7. ✅ Privacy maintained (balances encrypted)

### Advanced Features (Post-MVP):
- Balance proof generation
- Multiple token support (currently single token)
- Pledge history/events
- Emergency pause mechanism
- Delegate withdrawal permissions

## Integration Points (For Later)

Once contract is complete, we'll integrate with:

1. **Frontend (React + TypeScript)**
   - Display vault balance
   - Add/remove pledge UI
   - Withdrawal interface
   - Transaction history

2. **Backend (Supabase)**
   - Store vault addresses per employee
   - Track pledge agreements
   - Payment history
   - Analytics

3. **Payroll System**
   - Batch payment processing
   - Employee vault address registry
   - Transaction monitoring

## Important Notes

### Aztec-Specific Considerations
- All private functions execute client-side
- Proofs are generated on client
- Public functions execute on-chain (use sparingly)
- Storage is either private (encrypted) or public (transparent)

### Privacy Guarantees
- Employee's balance: **Private** (encrypted to owner)
- Pledge amounts: **Private** (only owner knows)
- Creditor payments: **Private** (only creditor and owner know)
- Total pledged: Can be **public** for faster queries (or keep private)

### Security Checklist
- [ ] Only owner can manage pledges
- [ ] Only owner can withdraw
- [ ] Cannot withdraw pledged amounts
- [ ] Validate percentage <= 100
- [ ] Handle arithmetic overflow/underflow
- [ ] Validate token addresses exist
- [ ] Prevent reentrancy (if applicable)

## Expected Output

When complete, you should have:

```
payroll_vault/
├── src/
│   ├── main.nr                    # Main contract
│   ├── types/
│   │   └── pledge_note.nr         # Custom PledgeNote type
├── test/
│   └── PayrollVault.test.ts       # TypeScript tests
├── artifacts/
│   └── PayrollVault.ts            # Generated TS class
├── target/
│   └── payroll_vault.json         # Compiled artifact
├── Nargo.toml                     # Dependencies
└── README.md                      # Usage instructions
```

## Questions & Clarifications

If anything is unclear:
1. Reference the Aztec Counter tutorial: https://docs.aztec.network/tutorials/contract_tutorials/counter_contract
2. Check aztec-card repo for complex patterns
3. Ask in Aztec Discord: https://discord.gg/aztec
4. Review Aztec stdlib: https://github.com/AztecProtocol/aztec-packages/tree/master/noir-projects/aztec-nr

## Timeline Estimate

- **Basic contract structure**: 2-3 hours
- **Core functions (payment, pledge)**: 4-6 hours
- **Testing suite**: 3-4 hours
- **Debugging & refinement**: 2-3 hours
- **Total**: ~12-16 hours for solid MVP

## Final Notes

This is a **privacy-first** payroll system. The key innovation is automatic pledge enforcement while maintaining complete privacy of balances and amounts. Focus on getting the core payment flow working first (receive_payment with pledge deduction), then add management functions.

Good luck! 🚀
