import { PublicKey, SystemProgram } from '@solana/web3.js';

// --- Constants --- //

// Solana Network (devnet, testnet, or mainnet-beta)
export const SOLANA_NETWORK = 'devnet'; // Or 'testnet', 'mainnet-beta'
export const SOLANA_RPC_ENDPOINT = `https://api.${SOLANA_NETWORK}.solana.com`;

// USDC Information (Devnet for now - replace with Mainnet for production)
// Mainnet USDC Mint: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
// Devnet USDC Mint: Gh9ZwEmdkyNcLxlGPAhL2cjeYjiraDbP4G9GDmS4aRca (This one is common for devnet, check a faucet)
// You can also create your own dummy USDC on devnet for testing using spl-token-cli
export const USDC_MINT_ADDRESS = new PublicKey('Gh9ZwEmdkyNcLxlGPAhL2cjeYjiraDbP4G9GDmS4aRca'); // Example Devnet USDC
export const USDC_DECIMALS = 6; // USDC typically has 6 decimals

// AntiCoin Information (Placeholder - will be created later)
export const ANTICOIN_MINT_ADDRESS = SystemProgram.programId; // VALID PLACEHOLDER
export const ANTICOIN_DECIMALS = 9; // Example: 9 decimals for AntiCoin

// AntiCoin Solana Program (Placeholder - will be deployed later)
export const ANTICOIN_PROGRAM_ID = SystemProgram.programId; // VALID PLACEHOLDER

// Treasury Wallet Address (where USDC payments will go)
// Generate a new keypair for this or use an existing organizational wallet
export const TREASURY_WALLET_ADDRESS = SystemProgram.programId; // VALID PLACEHOLDER. Replace with your app's treasury wallet

// Hourly rate for focus time in USDC (used for AntiCoin calculation)
// This should match the rate used in your application if it's fixed,
// or fetched if it's dynamic. For the Solana program, it might be an on-chain config.
export const FOCUS_HOURLY_RATE_USDC = 1; // Example: 1 USDC per hour of focus
