import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function SolanaWalletButton() {
  return (
    <div className="w-full flex justify-center sm:justify-end px-0 sm:px-2 py-2">
      <WalletMultiButton
        style={{
          background: '#FDE047',
          color: '#B45309',
          fontWeight: 600,
          borderRadius: 8,
          width: '100%',
          minHeight: 48,
          fontSize: 16,
        }}
        className="w-full sm:w-auto"
      />
    </div>
  );
}
