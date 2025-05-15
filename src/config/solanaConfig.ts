import { PublicKey, clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

// --- Network Configuration ---
export const SOLANA_NETWORK = WalletAdapterNetwork.Devnet;
export const SOLANA_RPC_ENDPOINT = clusterApiUrl(SOLANA_NETWORK);

// --- Token Configuration ---
// USDC Mint Address on Devnet (your custom token)
export const USDC_MINT_ADDRESS = new PublicKey('Aw2wzYHb2p5TUhPPHxwZ3rvYzyvFwfa3cwZ266BnE57S');
export const USDC_DECIMALS = 6; // Standard USDC decimals

// AntiCoin Configuration (using same token for demo)
export const ANTI_COIN_MINT_ADDRESS = new PublicKey('Aw2wzYHb2p5TUhPPHxwZ3rvYzyvFwfa3cwZ266BnE57S');
export const ANTI_COIN_DECIMALS = 6;
export const ANTI_COIN_TREASURY_TOKEN_ACCOUNT_ADDRESS = new PublicKey('QH7ZUEXJBGeuC2RxNio4MKt5gSTvnTc6is15mZ9Mn7i');

// Mint Authority for demo purposes only
export const ANTI_COIN_MINT_AUTHORITY_BYTES = new Uint8Array([
  206, 18, 111, 170, 219, 33, 23, 239, 129, 219, 115, 73, 129, 120, 101, 153,
  192, 158, 205, 168, 85, 117, 108, 12, 175, 253, 153, 104, 84, 175, 238, 13,
  173, 70, 6, 218, 171, 138, 10, 95, 181, 251, 115, 193, 132, 227, 64, 154,
  188, 189, 27, 22, 41, 233, 99, 87, 62, 163, 107, 2, 226, 174, 184, 248
]);

// --- Cafe/Application Wallet ---
// This is the wallet address that will receive USDC payments
export const CAFE_USDC_WALLET_ADDRESS = new PublicKey('5nPa39fpiea4gBeFpZn3tTtY19jvq17EVLgb5yJuShwj');

// --- AntiCoin Logic ---
export const ANTICOIN_USDC_EQUIVALENCE = 100; // How many AntiCoins 1 USDC is worth
export const DEMO_CAFE_VIRTUAL_HOURLY_RATE_USDC = 5; // Virtual USDC/hr rate for calculation

// Helper to get the actual mint address (with localStorage fallback)
export const getAntiCoinMintAddress = (): PublicKey => {
  const stored = localStorage.getItem('antiCoinMintAddress');
  return stored ? new PublicKey(stored) : ANTI_COIN_MINT_ADDRESS;
};

// --- UI Configuration ---
export const SOLANA_TOAST_DURATION = 5000; // 5 seconds for toasts

console.log('✅ Solana Config Loaded');
