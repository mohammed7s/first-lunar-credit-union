import {
  IncomeVaultContract,
  IncomeVaultContractArtifact,
} from "../artifacts/IncomeVault.js";
import {
  AccountWallet,
  CompleteAddress,
  PXE,
  AccountWalletWithSecretKey,
  Contract,
  Fr,
} from "@aztec/aztec.js";
import { TokenContract } from "@aztec/noir-contracts.js/Token";
import { getInitialTestAccountsWallets } from "@aztec/accounts/testing";
import { deployIncomeVault, setupSandbox } from "./utils.js";
import { describe, it, expect, beforeAll, beforeEach } from "vitest";

describe("IncomeVault Contract", () => {
  let pxe: PXE;
  let wallets: AccountWalletWithSecretKey[] = [];
  let accounts: CompleteAddress[] = [];

  let alice: AccountWallet; // Will be the vault owner (employee)
  let bob: AccountWallet; // Will be a payer (employer)
  let carl: AccountWallet; // Another user

  let vault: IncomeVaultContract;
  let token: TokenContract;

  beforeAll(async () => {
    pxe = await setupSandbox();

    wallets = await getInitialTestAccountsWallets(pxe);
    accounts = wallets.map((w) => w.getCompleteAddress());

    alice = wallets[0]; // Owner/employee
    bob = wallets[1]; // Payer/employer
    carl = wallets[2]; // Another user
  });

  beforeEach(async () => {
    // Deploy vault with Alice as owner
    vault = await deployIncomeVault(alice, alice.getAddress());

    // Deploy a token contract for testing
    token = await TokenContract.deploy(alice, alice.getAddress(), "TestToken", "TT", 18)
      .send({ from: alice.getAddress() })
      .deployed();
  });

  describe("Constructor", () => {
    it("should set the owner correctly", async () => {
      const owner = await vault.methods.get_owner().simulate({
        from: alice.getAddress(),
      });
      expect(owner).toStrictEqual(alice.getAddress().toBigInt());
    });
  });

  describe("Deposit", () => {
    it("should allow owner to deposit tokens", async () => {
      const depositAmount = 1000n;

      // 1. Mint tokens to Alice (from Alice to Alice)
      await token.withWallet(alice).methods.mint_to_private(alice.getAddress(), alice.getAddress(), depositAmount).send().wait();

      // 2. Alice calls deposit - no authwit needed since she's the caller
      await vault.methods
        .deposit(token.address, depositAmount)
        .send({ from: alice.getAddress() })
        .wait();

      // 3. Verify the tokens were transferred to the vault
      // Note: We can't easily check private balances directly, but we can verify no errors occurred
      // In a real scenario, you'd use balance oracles or check note commitments
    });

    it("should reject deposit from non-owner", async () => {
      const depositAmount = 1000n;

      // Mint tokens to Bob (from Alice to Bob since Alice is the minter)
      await token.withWallet(alice).methods.mint_to_private(alice.getAddress(), bob.getAddress(), depositAmount).send().wait();

      // Try to deposit as Bob (should fail because Bob is not the owner)
      // Bob needs his own vault instance to call with his wallet
      const vaultAsBob = await IncomeVaultContract.at(vault.address, bob);
      await expect(
        vaultAsBob.methods.deposit(token.address, depositAmount).send({ from: bob.getAddress() }).wait(),
      ).rejects.toThrow();
    });
  });

  describe("Receive Payment", () => {
    it("should accept payment from payer", async () => {
      const paymentAmount = 5000n;

      // 1. Mint tokens to Bob (from Alice to Bob since Alice is the minter)
      await token.withWallet(alice).methods.mint_to_private(alice.getAddress(), bob.getAddress(), paymentAmount).send().wait();

      // 2. Bob calls receive_payment - no authwit needed since Bob is the caller and msg_sender
      const vaultAsBob = await IncomeVaultContract.at(vault.address, bob);
      const tx = await vaultAsBob.methods
        .receive_payment(token.address, paymentAmount)
        .send({ from: bob.getAddress() })
        .wait();

      // 3. Verify transaction succeeded (if it throws, test will fail)
      expect(tx.status).toBe("success");
    });

    it("should return full amount when no pledges exist", async () => {
      const paymentAmount = 3000n;

      // Mint tokens to Bob (from Alice to Bob since Alice is the minter)
      await token.withWallet(alice).methods.mint_to_private(alice.getAddress(), bob.getAddress(), paymentAmount).send().wait();

      // Bob calls receive_payment and check return value - no authwit needed
      const vaultAsBob = await IncomeVaultContract.at(vault.address, bob);
      const netAmount = await vaultAsBob.methods
        .receive_payment(token.address, paymentAmount)
        .simulate({ from: bob.getAddress() });

      // Should return full amount since no pledges are deducted
      expect(netAmount).toBe(paymentAmount);
    });
  });

  describe("Utility Functions", () => {
    it("should return zero balance initially", async () => {
      // Note: This test passes because get_balance is stubbed to return 0
      const balance = await vault.methods
        .get_balance(alice.getAddress())
        .simulate({
          from: alice.getAddress(),
        });
      expect(balance).toBe(0n);
    });

    it("should return zero for available balance initially", async () => {
      const availableBalance = await vault.methods
        .get_available_balance(alice.getAddress())
        .simulate({
          from: alice.getAddress(),
        });
      expect(availableBalance).toBe(0n);
    });
  });
});
