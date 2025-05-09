import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { createMintToInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import dotenv from 'dotenv';
dotenv.config();

// ENV: ANTI_COIN_MINT, TREASURY_PRIVATE_KEY, RPC_URL
const ANTI_COIN_MINT = process.env.ANTI_COIN_MINT!;
const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY!;
const RPC_URL = process.env.RPC_URL || 'https://api.devnet.solana.com';

const connection = new Connection(RPC_URL);
const mint = new PublicKey(ANTI_COIN_MINT);
const treasury = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(TREASURY_PRIVATE_KEY)));

export async function mintAntiCoinToUser(userWalletAddress: string, amount: number) {
  const userWallet = new PublicKey(userWalletAddress);
  const ata = await getAssociatedTokenAddress(mint, userWallet);
  const ix = createMintToInstruction(mint, ata, treasury.publicKey, amount);
  const tx = new Transaction().add(ix);
  const sig = await sendAndConfirmTransaction(connection, tx, [treasury]);
  return sig;
}
