import { useWallet } from '@solana/wallet-adapter-react';
import { useAntiCoinBalance } from '../hooks/useAntiCoinBalance';

export default function AntiCoinBalance() {
  const { publicKey } = useWallet();
  const { balance, loading, error } = useAntiCoinBalance(publicKey?.toBase58());

  if (loading) {
    return <div className="text-antiapp-teal font-semibold">Loading AntiCoins...</div>;
  }

  if (error) {
    return <div className="text-red-500 font-semibold">Error loading balance</div>;
  }

  return (
    <div className="text-antiapp-teal font-semibold">
      Anti Coins: {balance !== null ? balance.toFixed(2) : '—'} {/* Assuming 2 decimal places for display */}
    </div>
  );
}
