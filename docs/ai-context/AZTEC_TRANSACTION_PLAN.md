# Aztec Transaction Processing Plan

## Overview
This document outlines the plan for processing payroll payments on the Aztec Network using private and public USDC transfers.

## Transaction Flow

### 1. **Balance Check**
- Read Aztec USDC balance (private + public)
- Verify sufficient funds for payroll
- Show balance breakdown to user

### 2. **Transaction Types**

#### A. Public Transfers (Transparent)
- Use `token.methods.transfer(recipient, amount).send()`
- Visible on-chain
- Cheaper gas costs
- Faster processing

#### B. Private Transfers (Shielded)
- Use `token.methods.transfer_to_private(recipient, amount).send()`
- Zero-knowledge proofs hide amount and participants
- Higher gas costs
- Longer processing time

#### C. Batch Transfers (Multiple Recipients)
- Process multiple employees in a single transaction
- Use BatchCall from @nemi-fi/wallet-sdk
- More efficient than individual transactions

### 3. **Implementation Steps**

#### Phase 1: Single Transfer Hook (✓ Research Done)
Based on Homan bridge pattern:
```typescript
const tx = await tokenContract.methods
  .transfer(recipientAddress, amountInWei)
  .send()
  .wait()
```

Key components:
- TokenContract instance from `@aztec/noir-contracts.js/Token`
- AztecAddress for recipient
- Amount in smallest unit (6 decimals for USDC)
- Transaction receipt with txHash

#### Phase 2: Batch Payroll Processing
```typescript
import { BatchCall } from '@nemi-fi/wallet-sdk/eip1193';

const batchedTx = new BatchCall(aztecAccount, [
  token.methods.transfer(employee1Address, amount1),
  token.methods.transfer(employee2Address, amount2),
  // ... more transfers
]);

const receipt = await batchedTx.send().wait({ timeout: 200000 });
```

#### Phase 3: UI Flow
1. **Payroll Selection Page**
   - List all employees
   - Select employees to pay
   - Show individual amounts
   - Display total payroll amount
   - Check balance vs payroll needs

2. **Transfer Type Selection**
   - Choose Public or Private transfer
   - Explain differences (privacy vs cost)
   - Show estimated gas costs

3. **Confirmation & Processing**
   - Review transaction details
   - Submit transaction
   - Show progress (pending → mining → confirmed)
   - Display transaction hash and Aztecscan link

4. **Post-Transaction**
   - Update balance
   - Mark payments in database
   - Show success/failure for each employee
   - Download payment report

### 4. **Required Contracts & Setup**

#### USDC Token Contract
```typescript
import { TokenContract } from '@aztec/noir-contracts.js/Token';
import { Contract } from '@nemi-fi/wallet-sdk/eip1193';
import { AztecAddress } from '@aztec/aztec.js';

class L2Token extends Contract.fromAztec(TokenContract as any) {}

// Initialize contract
const tokenAddress = AztecAddress.fromString(AZTEC_USDC_ADDRESS);
const token = await L2Token.at(tokenAddress, aztecAccount);
```

#### Contract Store (State Management)
- Store token contract instance
- Cache token metadata (decimals, symbol, name)
- Reset on wallet disconnect

### 5. **Error Handling**

Common errors to handle:
- Insufficient balance
- Invalid recipient address
- Transaction timeout (200s default)
- Network issues (testnet down)
- User rejection
- Gas estimation failures

### 6. **Transaction Monitoring**

Track transaction states:
1. **Pending**: Transaction submitted to mempool
2. **Mining**: Being processed by sequencer
3. **Confirmed**: Included in block
4. **Failed**: Transaction reverted

### 7. **Database Integration**

After successful transaction:
- Update payment status in Supabase
- Record transaction hash
- Store timestamp
- Link to Aztecscan URL
- Generate payment receipt

### 8. **Required Environment Variables**

```env
VITE_AZTEC_USDC_ADDRESS=<token-contract-address>
VITE_AZTEC_NODE_URL=https://aztec-alpha-testnet-fullnode.zkv.xyz/
```

### 9. **Testing Plan**

1. **Testnet Testing** (when available)
   - Test single transfer
   - Test batch transfers (2-3 employees)
   - Test with insufficient balance
   - Test transaction failures
   - Verify balance updates

2. **UI Testing**
   - Loading states
   - Error states
   - Success states
   - Transaction tracking

### 10. **Next Steps (Priority Order)**

1. ✅ Create Aztec balance hook
2. ✅ Update dashboard to show Aztec balance
3. **Install @aztec/noir-contracts.js package**
4. **Get USDC token contract address for testnet**
5. **Create useAztecTransfer hook**
6. **Build payroll transaction interface**
7. **Implement batch transaction processing**
8. **Add transaction status tracking**
9. **Integrate with database for payment records**
10. **Test on Aztec testnet (when available)**

## Key Differences from Ethereum

| Feature | Ethereum | Aztec |
|---------|----------|-------|
| Privacy | Public | Private & Public |
| Address Format | 0x... (20 bytes) | 0x... (32 bytes) |
| Transaction Type | Always public | Choose private/public |
| Gas Token | ETH | ETH (on L1 for fees) |
| Confirmation Time | ~12s | ~30-60s |
| Block Explorer | Etherscan | Aztecscan |

## Resources

- Aztec Docs: https://docs.aztec.network
- Noir Contracts: https://github.com/AztecProtocol/aztec-packages/tree/master/noir-projects/noir-contracts
- Homan Bridge Reference: https://github.com/holonym-foundation/aztec-bridge
- Wallet SDK: https://github.com/nemi-fi/wallet-sdk
