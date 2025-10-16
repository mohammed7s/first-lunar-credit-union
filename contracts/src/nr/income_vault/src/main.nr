use aztec::macros::aztec;

// TODO: Re-enable when implementing pledge logic
// pub mod types;

#[aztec]
pub contract IncomeVault {
    use aztec::{
        context::PrivateContext,
        macros::{
            functions::{initializer, private, public, internal, utility},
            storage::storage
        },
        protocol_types::{
            address::AztecAddress,
            traits::FromField,
        },
        state_vars::{
            PublicMutable,
            PublicImmutable,
            PrivateMutable,
            PrivateImmutable,
            Map
        },
    };
    use dep::value_note::value_note::ValueNote;
    use dep::token::Token;
    // TODO: Re-enable when implementing pledge logic
    // use crate::types::pledge_note::PledgeNote;

    // Constants
    //pub global MAX_PLEDGES_PER_PAYMENT: u8 = 10;

    #[storage]
    struct Storage<Context> {
        // Owner of this vault (employee) - public for simplicity
        owner: PublicImmutable<AztecAddress, Context>,

        // Token balances: Map<token_address_field, balance_note>
        balances: Map<Field, PrivateMutable<ValueNote, Context>, Context>,

        // TODO: Add pledge storage when implementing pledge logic
        // pledges: Map<Field, PrivateMutable<PledgeNote, Context>, Context>,
        // active_pledge_count: Map<Field, PublicMutable<u8, Context>, Context>,
    }

    ////////////////////////////////
    ////////// CONSTRUCTOR /////////
    ////////////////////////////////

    #[public]
    #[initializer]
    fn constructor(owner_address: AztecAddress) {
        // Initialize owner (public storage)
        storage.owner.initialize(owner_address);
    }

    /////////////////////////////
    ////////// PRIVATE //////////
    /////////////////////////////

    ////////// RECEIVE PAYMENT //////////

    /**
     * Receive payment and automatically process pledge deductions
     * CORE FUNCTION - implements "first dibs" logic
     *
     * For now: Simple version without pledge deductions
     * TODO: Add pledge processing logic later
     */
    #[private]
    fn receive_payment(
        token: AztecAddress,
        amount: u128
    ) -> pub u128 {
        let self_address = context.this_address();

        // Transfer tokens from payer (msg_sender) to vault
        // Using transfer() which doesn't require authwit since payer is calling directly
        Token::at(token)
            .transfer(self_address, amount)
            .call(&mut context);

        // TODO: Process pledge deductions here
        // For now, all amount goes to owner

        // Return net amount received
        amount
    }

    ////////// PLEDGE MANAGEMENT //////////
    // TODO: Implement pledge logic later

    // /**
    //  * Add a new pledge
    //  */
    // #[private]
    // fn add_pledge(
    //     creditor: AztecAddress,
    //     token: AztecAddress,
    //     total_amount: u128,
    //     percentage_per_payment: u8,
    //     priority: u8
    // ) {
    //     // TODO:
    //     // 1. Check authorization (only owner)
    //     // 2. Validate inputs
    //     // 3. Create pledge note
    //     // 4. Store pledge
    //     // 5. Update total_pledged
    //     // 6. Increment pledge count
    // }

    // /**
    //  * Remove a pledge (mark as inactive)
    //  */
    // #[private]
    // fn remove_pledge(
    //     creditor: AztecAddress,
    //     token: AztecAddress
    // ) {
    //     // TODO:
    //     // 1. Check authorization (only owner)
    //     // 2. Get existing pledge
    //     // 3. Mark as inactive
    //     // 4. Update total_pledged
    //     // 5. Decrement pledge count
    // }

    ////////// WITHDRAWAL //////////

    /**
     * Withdraw available balance
     */
    #[private]
    fn withdraw(
        token: AztecAddress,
        amount: u128,
        recipient: AztecAddress
    ) {
        // TODO:
        // 1. Check authorization (only owner)
        // 2. Get total balance
        // 3. Get total pledged
        // 4. Calculate available = total - pledged
        // 5. Check amount <= available
        // 6. Decrement balance
        // 7. Transfer tokens
    }

    ////////// DEPOSIT //////////

    /**
     * Deposit tokens into vault (for testing/manual top-ups)
     * Only owner can deposit
     */
    #[private]
    fn deposit(
        token: AztecAddress,
        amount: u128
    ) {
        let caller = context.msg_sender();
        let self_address = context.this_address();

        // Authorization: only owner can deposit
        let owner = storage.owner.read();
        assert(caller == owner, "Unauthorized: not vault owner");

        // Transfer tokens from caller to vault
        // Using transfer() which doesn't require authwit since caller is msg_sender
        Token::at(token)
            .transfer(self_address, amount)
            .call(&mut context);
    }

    ////////////////////////////
    ////////// PUBLIC //////////
    ////////////////////////////

    /**
     * Update total pledged amount (internal)
     */
    #[public]
    #[internal]
    fn _update_total_pledged(
        token: Field,
        amount: u128,
        is_add: bool
    ) {
        // TODO: Add or subtract from total_pledged
    }

    /**
     * Increment active pledge count (internal)
     */
    #[public]
    #[internal]
    fn _increment_pledge_count(token: Field) {
        // TODO: Increment counter
    }

    /**
     * Decrement active pledge count (internal)
     */
    #[public]
    #[internal]
    fn _decrement_pledge_count(token: Field) {
        // TODO: Decrement counter
    }

    ////////////////////////////
    ///////// LIBRARY //////////
    ////////////////////////////

    // TODO: Uncomment when PledgeNote is defined
    // /**
    //  * Get active pledges sorted by priority (helper)
    //  */
    // #[contract_library_method]
    // fn _get_active_pledges_sorted(
    //     token: Field
    // ) -> [PledgeNote; MAX_PLEDGES_PER_PAYMENT] {
    //     // TODO: Fetch and sort active pledges
    //     [PledgeNote::empty(); MAX_PLEDGES_PER_PAYMENT]
    // }

    // /**
    //  * Update pledge remaining amount after deduction
    //  */
    // #[contract_library_method]
    // fn _update_pledge_remaining(
    //     context: &mut PrivateContext,
    //     pledges_storage: Map<Field, PrivateMutable<PledgeNote, &mut PrivateContext>, &mut PrivateContext>,
    //     self_address: AztecAddress,
    //     creditor: AztecAddress,
    //     token: Field,
    //     deduction: u128
    // ) {
    //     // TODO:
    //     // 1. Get pledge
    //     // 2. Update remaining amount
    //     // 3. If fully paid, mark inactive
    //     // 4. Save pledge
    // }

    /**
     * Increment balance for a token
     */
    #[contract_library_method]
    fn _increment_balance(
        context: &mut PrivateContext,
        balances_storage: Map<Field, PrivateMutable<ValueNote, &mut PrivateContext>, &mut PrivateContext>,
        self_address: AztecAddress,
        token: Field,
        amount: u128
    ) {
        // TODO:
        // 1. Check if balance exists
        // 2. If exists, update; else create new
    }

    /**
     * Decrement balance for a token
     */
    #[contract_library_method]
    fn _decrement_balance(
        context: &mut PrivateContext,
        balances_storage: Map<Field, PrivateMutable<ValueNote, &mut PrivateContext>, &mut PrivateContext>,
        self_address: AztecAddress,
        token: Field,
        amount: u128
    ) {
        // TODO:
        // 1. Get balance
        // 2. Check sufficient funds
        // 3. Subtract amount
        // 4. Save balance
    }

    /**
     * Check if balance note is initialized
     */
    #[contract_library_method]
    unconstrained fn _check_balance_initialized(token: Field) -> bool {
        // TODO: Check nullifier exists
        false
    }

    /**
     * Compute unique key for pledge storage
     */
    #[contract_library_method]
    fn _compute_pledge_key(creditor: AztecAddress, token: Field) -> Field {
        // TODO: Hash creditor + token
        0
    }

    /**
     * Minimum of two u128 values
     */
    #[contract_library_method]
    fn _min_u128(a: u128, b: u128) -> u128 {
        if a < b { a } else { b }
    }

    ////////////////////////////
    ///////// UTILITY //////////
    ////////////////////////////

    /**
     * Get total balance for a token
     */
    #[utility]
    unconstrained fn get_balance(token: AztecAddress) -> pub u128 {
        // TODO: Read and return balance
        0
    }

    /**
     * Get available balance (total - pledged)
     */
    #[utility]
    unconstrained fn get_available_balance(token: AztecAddress) -> pub u128 {
        // TODO: Return total - pledged
        0
    }

    // TODO: Uncomment when PledgeNote is defined
    // /**
    //  * Get pledge details for a creditor
    //  */
    // #[utility]
    // pub unconstrained fn get_pledge(
    //     creditor: AztecAddress,
    //     token: AztecAddress
    // ) -> PledgeNote {
    //     // TODO: Return pledge note
    //     PledgeNote::empty()
    // }

    /**
     * Get total pledged amount for a token
     */
    #[utility]
    unconstrained fn get_total_pledged(token: AztecAddress) -> pub u128 {
        // TODO: Read from public storage
        0
    }

    /**
     * Get owner address
     */
    #[utility]
    unconstrained fn get_owner() -> pub AztecAddress {
        storage.owner.read()
    }

    /**
     * Get active pledge count
     */
    #[utility]
    unconstrained fn get_pledge_count(token: AztecAddress) -> pub u8 {
        // TODO: Read counter
        0
    }
}

