use aztec::{
    macros::notes::note,
    oracle::random::random,
    prelude::AztecAddress,
    protocol_types::traits::{Deserialize, Serialize},
};

#[note]
#[derive(Eq, Serialize, Deserialize)]
pub struct PledgeNote {
    owner: AztecAddress,
    creditor: AztecAddress,
    token: AztecAddress,
    total_amount: u128,
    amount_remaining: u128,
    percentage_per_payment: u8,
    priority: u8,
    active: bool,
    randomness: Field,
}

impl PledgeNote {
    pub fn new(
        owner: AztecAddress,
        creditor: AztecAddress,
        token: AztecAddress,
        total_amount: u128,
        percentage_per_payment: u8,
        priority: u8,
    ) -> Self {
        PledgeNote {
            owner,
            creditor,
            token,
            total_amount,
            amount_remaining: total_amount,
            percentage_per_payment,
            priority,
            active: true,
            randomness: unsafe { random() },
        }
    }
}
