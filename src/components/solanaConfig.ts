import { PublicKey } from '@solana/web3.js'

export const SOLANA_RPC_ENDPOINT = 'https://api.devnet.solana.com' // Using Devnet for now

// --- USDC Configuration ---
// Your custom Devnet USDC token
export const USDC_MINT_ADDRESS = new PublicKey('Aw2wzYHb2p5TUhPPHxwZ3rvYzyvFwfa3cwZ266BnE57S')
export const USDC_DECIMALS = 6

// --- Cafe Treasury Wallet ---
export const CAFE_TREASURY_WALLET_ADDRESS = new PublicKey('5nPa39fpiea4gBeFpZn3tTtY19jvq17EVLgb5yJuShwj')

// --- AntiCoin Configuration ---
// Your SPL AntiCoin token created on Devnet
export const ANTI_COIN_MINT_ADDRESS = new PublicKey('Aw2wzYHb2p5TUhPPHxwZ3rvYzyvFwfa3cwZ266BnE57S') // Same as USDC for now
export const ANTI_COIN_DECIMALS = 6

// Treasury token account holding AntiCoin supply
export const ANTI_COIN_TREASURY_TOKEN_ACCOUNT_ADDRESS = new PublicKey('QH7ZUEXJBGeuC2RxNio4MKt5gSTvnTc6is15mZ9Mn7i')

// --- AntiCoin Logic ---
export const ANTICOIN_USDC_EQUIVALENCE = 0.5 // 1 AntiCoin = 0.5 USDC worth of focus time

// For cafes with no hourly rate, we simulate value
export const DEMO_CAFE_VIRTUAL_HOURLY_RATE_USDC = 2

console.log('✅ Solana Config Loaded.')
