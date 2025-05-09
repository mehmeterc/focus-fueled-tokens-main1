import { useWallet } from '@solana/wallet-adapter-react';
import { useAntiCoinBalance } from '../hooks/useAntiCoinBalance';

export default function AntiCoinBalance() {
  const { publicKey } = useWallet();
  const balance = useAntiCoinBalance(publicKey?.toBase58());
  return (
    <div className="text-antiapp-teal font-semibold">
      Anti Coins: {balance !== null ? balance : '—'}
    </div>
  );
}
