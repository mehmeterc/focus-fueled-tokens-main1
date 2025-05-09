import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';

const ANTI_COIN_MINT = process.env.REACT_APP_ANTI_COIN_MINT || 'AntiCoinMint11111111111111111111111111111111';
const RPC_URL = 'https://api.devnet.solana.com';

export function useAntiCoinBalance(walletAddress?: string | null) {
  const [balance, setBalance] = useState<number | null>(null);
  useEffect(() => {
    if (!walletAddress) {
      setBalance(null);
      return;
    }
    const fetchBalance = async () => {
      try {
        const connection = new Connection(RPC_URL);
        const mint = new PublicKey(ANTI_COIN_MINT);
        const owner = new PublicKey(walletAddress);
        const ata = await getAssociatedTokenAddress(mint, owner);
        const account = await getAccount(connection, ata);
        setBalance(Number(account.amount));
      } catch (e) {
        setBalance(0);
      }
    };
    fetchBalance();
  }, [walletAddress]);
  return balance;
}
