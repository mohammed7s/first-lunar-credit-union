// types/pledge_note.nr
use dep::aztec::prelude::AztecAddress;

pub struct PledgeNote {
    pub creditor: AztecAddress,
    pub token: AztecAddress,
    pub total_amount: u128,
    pub amount_remaining: u128,
    pub percentage_per_payment: u8,  // 0-100
    pub priority: u8,                 // Higher = paid first
    pub active: bool,
}

impl PledgeNote {
    pub fn new(
        creditor: AztecAddress,
        token: AztecAddress,
        total_amount: u128,
        amount_remaining: u128,
        percentage_per_payment: u8,
        priority: u8,
        active: bool
    ) -> Self {
        Self {
            creditor,
            token,
            total_amount,
            amount_remaining,
            percentage_per_payment,
            priority,
            active,
        }
    }

    pub fn empty() -> Self {
        Self {
            creditor: AztecAddress::zero(),
            token: AztecAddress::zero(),
            total_amount: 0,
            amount_remaining: 0,
            percentage_per_payment: 0,
            priority: 0,
            active: false,
        }
    }
}

// types/mod.nr
pub mod pledge_note;
