import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function SolanaWalletButton() {
  return (
    <div className="ml-2">
      <WalletMultiButton style={{ background: '#FDE047', color: '#B45309', fontWeight: 600, borderRadius: 8 }} />
    </div>
  );
}
