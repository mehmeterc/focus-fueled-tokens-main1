import { clusterApiUrl, PublicKey, Keypair } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

// --- Network Configuration ---
export const SOLANA_NETWORK = WalletAdapterNetwork.Devnet;
export const SOLANA_RPC_ENDPOINT = clusterApiUrl(SOLANA_NETWORK);

// --- Token Configuration ---
// USDC Mint Address on Devnet
export const USDC_MINT_ADDRESS = new PublicKey('Aw2wzYHb2p5TUhPPHxwZ3rvYzyvFwfa3cwZ266BnE57S'); // Your custom Devnet USDC
export const USDC_DECIMALS = 6; // Standard USDC decimals

// AntiCoin Configuration
// TODO: For production, generate this securely and store the private key on a server.
// For demo purposes, we'll generate one here. You should run a script to create a persistent one.
const ANTI_COIN_MINT_AUTHORITY_BYTES = new Uint8Array([
  // Replace with your actual secret key bytes for a persistent mint authority
  // Example (DO NOT USE THIS KEY FOR ANYTHING REAL):
  206, 18, 111, 170, 219, 33, 23, 239, 129, 219, 115, 73, 129, 120, 101, 153,
  192, 158, 205, 168, 85, 117, 108, 12, 175, 253, 153, 104, 84, 175, 238, 13,
  173, 70, 6, 218, 171, 138, 10, 95, 181, 251, 115, 193, 132, 227, 64, 154,
  188, 189, 27, 22, 41, 233, 99, 87, 62, 163, 107, 2, 226, 174, 184, 248
]);
export const ANTI_COIN_MINT_AUTHORITY_KEYPAIR = Keypair.fromSecretKey(ANTI_COIN_MINT_AUTHORITY_BYTES);

// This will be created by you once using a script or the `solanaService.createAntiCoinMint()` function
// then hardcode it here after creation for the app to use.
// Using a fixed AntiCoin mint address for development purposes
export const ANTI_COIN_MINT_ADDRESS = new PublicKey('Aw2wzYHb2p5TUhPPHxwZ3rvYzyvFwfa3cwZ266BnE57S');

// Since we're using a constant now, we'll use localStorage to track the real mint address
// This function is kept for backwards compatibility but modified to use localStorage
export const setAntiCoinMintAddress = (mintAddress: PublicKey) => {
  // Store in localStorage for persistence across sessions
  localStorage.setItem('antiCoinMintAddress', mintAddress.toBase58());
  console.log('AntiCoin Mint Address set to:', mintAddress.toBase58());
};

// Helper to get the actual mint address (either from localStorage or fallback to constant)
export const getAntiCoinMintAddress = (): PublicKey => {
  const stored = localStorage.getItem('antiCoinMintAddress');
  return stored ? new PublicKey(stored) : ANTI_COIN_MINT_ADDRESS;
};

export const ANTI_COIN_DECIMALS = 9; // Standard SPL token decimals
export const ANTI_COIN_EARN_RATE_PER_HOUR = 10; // 10 AntiCoin per hour of focus
export const ANTICOIN_USDC_EQUIVALENCE = 100; // How many AntiCoins 1 USDC is worth (e.g., 100 means 1 USDC = 100 AntiCoins)
export const DEMO_CAFE_VIRTUAL_HOURLY_RATE_USDC = 5; // Virtual USDC/hr rate for AntiCoin calculation if cafe rate is 0

// --- Cafe/Application Wallet ---
// This is the wallet address that will receive USDC payments.
// TODO: Replace with your cafe's actual Solana public key.
export const CAFE_USDC_WALLET_ADDRESS = new PublicKey('5nPa39fpiea4gBeFpZn3tTtY19jvq17EVLgb5yJuShwj'); // Dev wallet that will receive USDC payments

// --- UI Configuration ---
export const SOLANA_TOAST_DURATION = 5000; // 5 seconds for toasts

/**
 * IMPORTANT SECURITY WARNING:
 * The ANTI_COIN_MINT_AUTHORITY_KEYPAIR is included here for DEMONSTRATION PURPOSES ONLY.
 * In a production environment, the private key for the mint authority MUST NEVER be exposed 
 * in the client-side code. All minting operations should be handled by a secure backend server 
 * that holds the private key.
 */
console.warn(
  'SECURITY WARNING: ANTI_COIN_MINT_AUTHORITY_KEYPAIR is exposed in client-side code. '+ 
  'This is for DEMO PURPOSES ONLY. Secure this in a backend for production.'
);

// Helper to generate a new keypair for one-time mint creation if needed
export const generateAndLogTempKeypair = () => {
  const newKeypair = Keypair.generate();
  console.log('Generated new Keypair Public Key:', newKeypair.publicKey.toBase58());
  console.log('Generated new Keypair Secret Key (DO NOT SHARE OR COMMIT):', JSON.stringify(Array.from(newKeypair.secretKey)));
  return newKeypair;
};
// Call this if you need to generate a new one for ANTI_COIN_MINT_AUTHORITY_KEYPAIR
// generateAndLogTempKeypair(); 

// Call this if you need to generate a new one for CAFE_USDC_WALLET_ADDRESS
// generateAndLogTempKeypair();
