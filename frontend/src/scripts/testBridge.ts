/**
 * Test script for Human Bridge integration
 * Tests deposit from Ethereum Sepolia to Aztec
 *
 * Run with: npx tsx src/scripts/testBridge.ts
 */

import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env file
try {
  const envPath = join(process.cwd(), '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        process.env[key] = value;
      }
    }
  });
  console.log('✅ Loaded .env file\n');
} catch (error) {
  console.log('⚠️  No .env file found, using environment variables\n');
}

// L1 Bridge Contract Addresses (Sepolia)
const BRIDGE_CONTRACTS = {
  PORTAL_SBT_CONTRACT: '0x983ad7bdc7701a77a6c22e2245d7eafe893b21fe',
  TOKEN_CONTRACT: '0x93527f0552bef5fafc340bceac6a5a37b6c34496',
  FEE_ASSET_HANDLER_CONTRACT: '0x57860b112fc6890c4ddfeccb83714aa988dc382c',
  PORTAL_CONTRACT: '0x069840ae19473e452792c8e17fee77d78a3fcecb',
};

// Use the bridge's token contract (not standard USDC)
const BRIDGE_TOKEN = BRIDGE_CONTRACTS.TOKEN_CONTRACT;

// ERC20 ABI (minimal - just what we need)
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

// Portal Bridge ABI (simplified)
const PORTAL_ABI = [
  'function depositToAztecPublic(bytes32 to, uint256 amount, bytes32 secretHash) payable',
  'function depositToAztecPrivate(bytes32 secretHashForRedeemingMintedNotes, uint256 amount, bytes32 secretHashForL2MessageConsumption) payable returns (bytes32)',
];

async function testBridgeDeposit() {
  console.log('🌉 Testing Human Bridge - Ethereum to Aztec Deposit\n');

  // Check for environment variables
  const rpcUrl = process.env.VITE_SEPOLIA_RPC_URL;
  const privateKey = process.env.TEST_PRIVATE_KEY;

  if (!rpcUrl) {
    console.error('❌ Error: VITE_SEPOLIA_RPC_URL not found in .env file');
    console.log('Please add VITE_SEPOLIA_RPC_URL to your .env file');
    process.exit(1);
  }

  if (!privateKey) {
    console.error('❌ Error: TEST_PRIVATE_KEY environment variable not set');
    console.log('Please set TEST_PRIVATE_KEY with your test wallet private key');
    console.log('Example: export TEST_PRIVATE_KEY=your_key_here');
    process.exit(1);
  }

  try {
    // Setup provider and wallet
    console.log('🔌 Connecting to Sepolia...');
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const address = wallet.address;

    console.log(`✅ Connected as: ${address}\n`);

    // Check ETH balance
    const ethBalance = await provider.getBalance(address);
    console.log(`💰 ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);

    if (ethBalance < ethers.parseEther('0.01')) {
      console.warn('⚠️  Warning: Low ETH balance. You need ETH for gas fees.');
    }

    // Setup Bridge Token contract
    console.log('\n📝 Setting up Bridge Token contract...');
    console.log(`Token address: ${BRIDGE_TOKEN}`);
    const tokenContract = new ethers.Contract(BRIDGE_TOKEN, ERC20_ABI, wallet);

    // Check token balance
    const tokenBalance = await tokenContract.balanceOf(address);
    const decimals = await tokenContract.decimals();
    const symbol = await tokenContract.symbol();

    console.log(`💵 ${symbol} Balance: ${ethers.formatUnits(tokenBalance, decimals)} ${symbol}`);

    if (tokenBalance === 0n) {
      console.warn('⚠️  Warning: No token balance.');
      console.log('You need to get bridge tokens first. This is a bridge-specific token at:');
      console.log(`   ${BRIDGE_TOKEN}`);
      console.log('\nCheck Sepolia Etherscan to see how to get these tokens.');
      return;
    }

    // Setup Portal contract
    console.log('\n🌉 Setting up Portal Bridge contract...');
    const portalContract = new ethers.Contract(
      BRIDGE_CONTRACTS.PORTAL_CONTRACT,
      PORTAL_ABI,
      wallet
    );

    // Amount to deposit (1 token for testing)
    const depositAmount = ethers.parseUnits('1', decimals);
    console.log(`\n💸 Preparing to deposit: ${ethers.formatUnits(depositAmount, decimals)} ${symbol}`);

    // Check allowance
    console.log('\n🔍 Checking token allowance for Portal...');
    const allowance = await tokenContract.allowance(address, BRIDGE_CONTRACTS.PORTAL_CONTRACT);
    console.log(`Current allowance: ${ethers.formatUnits(allowance, decimals)} ${symbol}`);

    if (allowance < depositAmount) {
      console.log('\n✍️  Approving token spend...');
      const approveTx = await tokenContract.approve(
        BRIDGE_CONTRACTS.PORTAL_CONTRACT,
        depositAmount
      );
      console.log(`Approval tx: ${approveTx.hash}`);
      console.log('⏳ Waiting for confirmation...');
      await approveTx.wait();
      console.log('✅ Approval confirmed!');
    } else {
      console.log('✅ Sufficient allowance already set');
    }

    // Generate random Aztec address and secret hash (for testing)
    // In production, this would be the actual recipient's Aztec address
    const aztecAddress = ethers.hexlify(ethers.randomBytes(32));
    const secretHash = ethers.hexlify(ethers.randomBytes(32));

    console.log('\n🔐 Test Parameters:');
    console.log(`Aztec Address (random): ${aztecAddress}`);
    console.log(`Secret Hash: ${secretHash}`);

    // Deposit to Aztec (public)
    console.log('\n🚀 Initiating bridge deposit...');
    console.log('⚠️  Note: Since Aztec testnet is down, this will only complete the L1 side');

    const depositTx = await portalContract.depositToAztecPublic(
      aztecAddress,
      depositAmount,
      secretHash,
      {
        gasLimit: 500000, // Set gas limit
      }
    );

    console.log(`\n📤 Deposit transaction sent: ${depositTx.hash}`);
    console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${depositTx.hash}`);
    console.log('⏳ Waiting for confirmation...');

    const receipt = await depositTx.wait();

    if (receipt.status === 1) {
      console.log('\n✅ SUCCESS! L1 deposit confirmed!');
      console.log(`Gas used: ${receipt.gasUsed.toString()}`);
      console.log(`Block number: ${receipt.blockNumber}`);
      console.log('\n📝 Summary:');
      console.log(`- Deposited: ${ethers.formatUnits(depositAmount, decimals)} ${symbol}`);
      console.log(`- From: ${address}`);
      console.log(`- To Aztec Address: ${aztecAddress}`);
      console.log(`- Portal Contract: ${BRIDGE_CONTRACTS.PORTAL_CONTRACT}`);
      console.log('\n⚠️  Note: The L2 (Aztec) part will complete once the testnet is back online');
    } else {
      console.log('\n❌ Transaction failed');
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.data) {
      console.error('Error data:', error.data);
    }
    process.exit(1);
  }
}

// Run the test
testBridgeDeposit()
  .then(() => {
    console.log('\n✨ Test complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
