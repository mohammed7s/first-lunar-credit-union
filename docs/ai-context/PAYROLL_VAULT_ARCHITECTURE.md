# PayrollVault Contract Architecture for Aztec

## Executive Summary

Due to Aztec's privacy model where **private state is encrypted per-user**, we cannot use a single vault contract for all employees. Instead, each employee gets their **own PayrollVault contract instance** deployed when they sign up. This acts as a smart contract wallet that:

1. Receives payroll payments from employers
2. Tracks employee's private balance
3. Enforces pledges to external parties (creditors, lenders)
4. Generates zero-knowledge proofs of balance
5. Allows withdrawal of available funds

## Why Per-User Contract Instances?

### Aztec's Privacy Model
```
❌ Single Vault for All Employees
- Private state is encrypted to specific addresses
- Vault can't see individual balances
- Can't enforce user-specific pledges
- Breaks privacy guarantees

✅ Per-Employee Vault Instance
- Each employee has their own contract
- Private state encrypted to employee
- Employee's vault enforces their pledges
- Full privacy maintained
```

### Contract Class vs Instance
```
Contract Class (PayrollVault)
    ↓ (deployed once, used by all)
Contract Instance 1 (Alice's Vault)
Contract Instance 2 (Bob's Vault)
Contract Instance 3 (Charlie's Vault)
...
```

## Contract Structure

### PayrollVault Contract (Noir)

```noir
// PayrollVault.nr
contract PayrollVault {
    use dep::aztec::prelude::*;
    use dep::aztec::protocol_types::{
        address::AztecAddress,
        traits::{Serialize, Deserialize}
    };

    // Storage structure
    #[storage]
    struct Storage {
        // Owner of this vault (employee)
        owner: PublicMutable<AztecAddress, Context>,

        // Private token balances (Map of token → balance)
        private_balances: Map<AztecAddress, PrivateMutable<ValueNote, Context>, Context>,

        // Public token balances (for transparency if needed)
        public_balances: Map<AztecAddress, PublicMutable<u128, Context>, Context>,

        // Pledges (Map of creditor → pledge info)
        pledges: Map<AztecAddress, PrivateMutable<PledgeNote, Context>, Context>,

        // Total pledged amounts per token
        total_pledged: Map<AztecAddress, PublicMutable<u128, Context>, Context>,
    }

    // Custom note for pledge information
    struct PledgeNote {
        creditor: AztecAddress,
        token: AztecAddress,
        total_amount: u128,
        amount_remaining: u128,
        percentage_per_payment: u8,  // 0-100, e.g., 20 = 20%
        priority: u8,  // Higher = paid first
        active: bool,
    }

    // Initialize the vault
    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor(owner: AztecAddress) {
        storage.owner.write(owner);
    }

    // Receive payment from employer
    #[aztec(private)]
    fn receive_payment(
        token: AztecAddress,
        amount: u128,
        payer: AztecAddress
    ) -> u128 {
        // Only callable by registered employers (TODO: add employer registry)

        // 1. Get all active pledges
        let pledges = get_active_pledges(token);

        // 2. Calculate total deductions based on pledges
        let deductions = calculate_deductions(amount, pledges);

        // 3. Transfer deductions to creditors
        for deduction in deductions {
            transfer_to_creditor(
                token,
                deduction.creditor,
                deduction.amount
            );

            // Update pledge remaining amount
            update_pledge_remaining(
                deduction.creditor,
                deduction.amount
            );
        }

        // 4. Credit net amount to employee's private balance
        let net_amount = amount - deductions.total;
        increment_private_balance(token, net_amount);

        // 5. Emit event
        emit_payment_received(token, amount, net_amount, deductions);

        net_amount
    }

    // Add a pledge (employee authorizes deduction)
    #[aztec(private)]
    fn add_pledge(
        creditor: AztecAddress,
        token: AztecAddress,
        total_amount: u128,
        percentage_per_payment: u8,
        priority: u8
    ) {
        // Only owner can add pledges
        assert(context.msg_sender() == storage.owner.read());
        assert(percentage_per_payment <= 100);

        // Create pledge note
        let pledge = PledgeNote {
            creditor,
            token,
            total_amount,
            amount_remaining: total_amount,
            percentage_per_payment,
            priority,
            active: true,
        };

        // Store pledge
        storage.pledges.at(creditor).write(pledge);

        // Update total pledged
        let current_total = storage.total_pledged.at(token).read();
        storage.total_pledged.at(token).write(
            current_total + total_amount
        );
    }

    // Remove pledge (when paid off or cancelled)
    #[aztec(private)]
    fn remove_pledge(creditor: AztecAddress) {
        assert(context.msg_sender() == storage.owner.read());

        let pledge = storage.pledges.at(creditor).read();

        // Update total pledged
        let current_total = storage.total_pledged.at(pledge.token).read();
        storage.total_pledged.at(pledge.token).write(
            current_total - pledge.amount_remaining
        );

        // Mark as inactive
        pledge.active = false;
        storage.pledges.at(creditor).write(pledge);
    }

    // Withdraw available balance
    #[aztec(private)]
    fn withdraw(
        token: AztecAddress,
        amount: u128,
        recipient: AztecAddress
    ) {
        // Only owner can withdraw
        assert(context.msg_sender() == storage.owner.read());

        // Check available balance (total - pledged)
        let total = storage.private_balances.at(token).read();
        let pledged = storage.total_pledged.at(token).read();
        let available = total - pledged;

        assert(amount <= available, "Insufficient available balance");

        // Transfer tokens
        decrement_private_balance(token, amount);
        Token::at(token).transfer(recipient, amount).call(&mut context);
    }

    // Get available balance (unconstrained/view function)
    unconstrained fn get_available_balance(
        token: AztecAddress,
        owner: AztecAddress
    ) -> u128 {
        let total = storage.private_balances.at(token).read();
        let pledged = storage.total_pledged.at(token).read();

        if (total > pledged) {
            total - pledged
        } else {
            0
        }
    }

    // Generate proof that balance is above threshold
    #[aztec(private)]
    fn prove_balance_above_threshold(
        token: AztecAddress,
        threshold: u128
    ) -> bool {
        let balance = storage.private_balances.at(token).read();

        // The proof is generated automatically by Aztec
        // We just return the boolean comparison
        // The ZK proof proves this is true without revealing balance
        balance >= threshold
    }

    // Get total pledged amount (view)
    unconstrained fn get_total_pledged(token: AztecAddress) -> u128 {
        storage.total_pledged.at(token).read()
    }

    // Get pledge details
    unconstrained fn get_pledge(creditor: AztecAddress) -> PledgeNote {
        storage.pledges.at(creditor).read()
    }

    // Internal: Calculate deductions based on pledges
    fn calculate_deductions(
        payment_amount: u128,
        pledges: Vec<PledgeNote>
    ) -> DeductionPlan {
        // Sort pledges by priority (highest first)
        let sorted = sort_by_priority(pledges);

        let mut remaining = payment_amount;
        let mut deductions = Vec::new();

        for pledge in sorted {
            if (!pledge.active || remaining == 0) continue;

            // Calculate deduction for this pledge
            let max_by_percentage = (payment_amount * pledge.percentage_per_payment) / 100;
            let max_by_remaining = pledge.amount_remaining;
            let max_by_available = remaining;

            let deduction = min(max_by_percentage, min(max_by_remaining, max_by_available));

            if (deduction > 0) {
                deductions.push(Deduction {
                    creditor: pledge.creditor,
                    amount: deduction,
                });
                remaining -= deduction;
            }
        }

        DeductionPlan {
            deductions,
            total: payment_amount - remaining,
        }
    }

    // Helper structures
    struct Deduction {
        creditor: AztecAddress,
        amount: u128,
    }

    struct DeductionPlan {
        deductions: Vec<Deduction>,
        total: u128,
    }
}
```

## Deployment Flow

### 1. Factory Contract (Optional)

```noir
// PayrollVaultFactory.nr
contract PayrollVaultFactory {
    // Keep track of deployed vaults
    #[storage]
    struct Storage {
        vaults: Map<AztecAddress, AztecAddress, Context>,  // owner → vault
    }

    #[aztec(public)]
    fn deploy_vault_for_employee(employee: AztecAddress) -> AztecAddress {
        // Check if vault already exists
        let existing = storage.vaults.at(employee).read();
        assert(existing.is_zero(), "Vault already exists");

        // Deploy new PayrollVault instance
        let vault_address = PayrollVault::deploy(employee);

        // Store mapping
        storage.vaults.at(employee).write(vault_address);

        vault_address
    }

    unconstrained fn get_vault(employee: AztecAddress) -> AztecAddress {
        storage.vaults.at(employee).read()
    }
}
```

### 2. Employee Onboarding Flow

```typescript
// Frontend: Employee signs up
async function onboardEmployee(employeeWalletAddress: AztecAddress) {
  // 1. Deploy PayrollVault instance for employee
  const factory = await PayrollVaultFactory.at(FACTORY_ADDRESS);

  const vaultAddress = await factory.methods
    .deploy_vault_for_employee(employeeWalletAddress)
    .send()
    .wait();

  // 2. Store vault address in database
  await db.employees.update(employeeId, {
    aztec_vault_address: vaultAddress.toString(),
  });

  // 3. Employee can now receive payments to their vault
  return vaultAddress;
}
```

## Employer Payment Flow

```typescript
// Employer processes payroll
async function processPayrollBatch(payments: Payment[]) {
  for (const payment of payments) {
    const employee = await db.employees.findOne({ id: payment.employeeId });

    // Get employee's vault address
    const vaultAddress = employee.aztec_vault_address;

    // Get PayrollVault contract instance
    const vault = await PayrollVault.at(vaultAddress, employerAccount);

    // Send payment to vault (vault handles pledge deductions)
    const tx = await vault.methods
      .receive_payment(
        USDC_TOKEN_ADDRESS,
        parseUnits(payment.amount, 6),
        employerAccount.address
      )
      .send()
      .wait();

    // Vault automatically:
    // 1. Calculates pledge deductions
    // 2. Pays creditors
    // 3. Credits net amount to employee

    console.log(`Paid ${payment.amount} to ${employee.name}'s vault`);
    console.log(`Net amount after pledges: ${tx.returnValue}`);
  }
}
```

## Employee Pledge Management

```typescript
// Employee adds a pledge
async function addPledge(
  creditorAddress: AztecAddress,
  totalAmount: string,
  percentagePerPayment: number,
  priority: number
) {
  const { aztecAccount } = useAztecWallet();

  // Get employee's vault
  const vaultAddress = await getMyVaultAddress();
  const vault = await PayrollVault.at(vaultAddress, aztecAccount);

  // Add pledge
  const tx = await vault.methods
    .add_pledge(
      creditorAddress,
      parseUnits(totalAmount, 6),
      percentagePerPayment,
      priority
    )
    .send()
    .wait();

  // Store in database for UI
  await db.pledges.create({
    employee_id: employeeId,
    creditor_address: creditorAddress.toString(),
    total_amount: totalAmount,
    percentage_per_payment: percentagePerPayment,
    priority,
    status: 'active',
  });
}
```

## Balance Proof Generation

```typescript
// Employee generates proof of balance
async function generateBalanceProof(threshold: string) {
  const vault = await PayrollVault.at(vaultAddress, aztecAccount);

  // Generate ZK proof that balance >= threshold
  // WITHOUT revealing actual balance
  const proof = await vault.methods
    .prove_balance_above_threshold(
      USDC_TOKEN_ADDRESS,
      parseUnits(threshold, 6)
    )
    .simulate();

  // proof is boolean: true if balance >= threshold
  // The ZK proof can be verified by anyone without revealing balance
  return proof;
}

// Use case: Apply for loan
const canAfford = await generateBalanceProof("5000");
if (canAfford) {
  console.log("Employee has >= $5000 USDC (exact amount private)");
  // Share proof with lender
}
```

## Database Schema

```sql
-- Employee vault addresses
ALTER TABLE employees ADD COLUMN aztec_vault_address TEXT;

-- Pledges table
CREATE TABLE pledges (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  creditor_address TEXT NOT NULL,
  creditor_name TEXT,
  token_address TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  amount_remaining NUMERIC NOT NULL,
  percentage_per_payment INTEGER NOT NULL, -- 0-100
  priority INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'active', 'completed', 'cancelled'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pledge deductions (history)
CREATE TABLE pledge_deductions (
  id UUID PRIMARY KEY,
  pledge_id UUID REFERENCES pledges(id),
  payment_id UUID, -- References payroll_payments
  amount_deducted NUMERIC NOT NULL,
  tx_hash TEXT NOT NULL,
  block_number BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payroll payments (track net amounts)
CREATE TABLE payroll_payments (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  gross_amount NUMERIC NOT NULL,
  total_deductions NUMERIC NOT NULL,
  net_amount NUMERIC NOT NULL,
  vault_address TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Frontend Components

### PledgeManager Component
```typescript
const PledgeManager = () => {
  const { pledges, addPledge, removePledge } = usePledges();

  return (
    <Card>
      <h3>My Pledges</h3>

      {pledges.map(pledge => (
        <div key={pledge.id}>
          <p>Creditor: {pledge.creditor_name}</p>
          <p>Remaining: ${pledge.amount_remaining}</p>
          <p>Deduction: {pledge.percentage_per_payment}% per paycheck</p>
          <Progress
            value={pledge.total_amount - pledge.amount_remaining}
            max={pledge.total_amount}
          />
          {pledge.status === 'active' && (
            <Button onClick={() => removePledge(pledge.id)}>Cancel</Button>
          )}
        </div>
      ))}

      <Button onClick={handleAddPledge}>Add New Pledge</Button>
    </Card>
  );
};
```

### VaultBalance Component
```typescript
const VaultBalance = () => {
  const { getAvailableBalance, getTotalBalance, getTotalPledged } = useVault();

  const totalBalance = await getTotalBalance(USDC_ADDRESS);
  const totalPledged = await getTotalPledged(USDC_ADDRESS);
  const available = totalBalance - totalPledged;

  return (
    <Card>
      <h3>Vault Balance</h3>

      <div className="balance-total">
        <p>Total Balance</p>
        <p className="amount">${formatUnits(totalBalance, 6)}</p>
      </div>

      <div className="balance-breakdown">
        <div>
          <p>Pledged</p>
          <p>${formatUnits(totalPledged, 6)}</p>
        </div>
        <div>
          <p>Available</p>
          <p>${formatUnits(available, 6)}</p>
        </div>
      </div>

      <Button onClick={handleWithdraw}>Withdraw Available</Button>
    </Card>
  );
};
```

## Implementation Phases

### Phase 1: Contract Development
- [ ] Write PayrollVault.nr contract
- [ ] Write Factory contract (optional)
- [ ] Set up Aztec Sandbox for local testing
- [ ] Test contract functions locally

### Phase 2: Deployment & Testing
- [ ] Deploy to Aztec testnet
- [ ] Test vault deployment
- [ ] Test receive_payment flow
- [ ] Test pledge management
- [ ] Test withdrawals

### Phase 3: Frontend Integration
- [ ] Create useVault hook
- [ ] Create usePledges hook
- [ ] Build VaultBalance component
- [ ] Build PledgeManager component
- [ ] Update payroll flow to use vaults

### Phase 4: Database Integration
- [ ] Add vault_address to employees table
- [ ] Create pledges table
- [ ] Create deductions tracking
- [ ] Build admin dashboard for monitoring

## Key Advantages

1. **Privacy**: Each employee's balance is private, encrypted to them
2. **Enforcement**: Pledges are enforced automatically by smart contract
3. **Flexibility**: Employee controls their pledges
4. **Transparency**: Proofs can verify properties without revealing amounts
5. **Trustless**: No need to trust employer to honor pledges

## Security Considerations

1. **Authorization**: Only vault owner can add/remove pledges
2. **Limits**: Percentage limits prevent complete balance drain
3. **Priority**: Ensures fair distribution among creditors
4. **Emergency**: Owner can cancel pledges if needed
5. **Immutability**: Once deployed, contract logic can't change

## Next Steps

1. Set up Aztec development environment (Sandbox + Noir compiler)
2. Write and test PayrollVault contract
3. Deploy to testnet when available
4. Build frontend integration
5. Test end-to-end flow with real payments

This architecture provides a robust, privacy-preserving system for payroll with automatic pledge enforcement!
