import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';

const ANTI_COIN_MINT_STRING = process.env.REACT_APP_ANTI_COIN_MINT || 'AntiCoinMint11111111111111111111111111111111';
const RPC_URL = process.env.REACT_APP_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export function useAntiCoinBalance(walletAddress?: string | null) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setBalance(null);
      setLoading(false);
      return;
    }

    const fetchBalance = async () => {
      setLoading(true);
      setError(null);
      try {
        const connection = new Connection(RPC_URL, 'confirmed');
        if (!ANTI_COIN_MINT_STRING) {
          throw new Error('Anti Coin Mint address is not defined. Check your .env file for REACT_APP_ANTI_COIN_MINT.');
        }
        const mintPublicKey = new PublicKey(ANTI_COIN_MINT_STRING);
        const ownerPublicKey = new PublicKey(walletAddress);
        
        const associatedTokenAccount = await getAssociatedTokenAddress(
          mintPublicKey,
          ownerPublicKey,
          false // allowOwnerOffCurve - set to true if the owner is a PDA
        );
        
        const accountInfo = await getAccount(connection, associatedTokenAccount);
        // Assuming the token has decimals (e.g., 9 for USDC, or your custom token's decimals)
        // You might need to fetch token metadata or have it predefined
        const tokenDecimals = 9; // Replace with your token's actual decimals
        const balanceValue = Number(accountInfo.amount) / (10 ** tokenDecimals);
        setBalance(balanceValue);

      } catch (err: any) {
        console.error("Failed to fetch AntiCoin balance:", err);
        // Distinguish between account not existing and other errors
        if (err.message?.includes('could not find account') || err.message?.includes('TokenAccountNotFoundError')) {
          setBalance(0); // Wallet has no AntiCoin account, so balance is 0
        } else {
          setError(err);
          setBalance(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [walletAddress]);

  return { balance, loading, error };
}
