import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function SolanaWalletButton() {
  return (
    <div className="ml-2">
      <WalletMultiButton 
        style={{ 
          background: '#FDE047', 
          color: '#B45309', 
          fontWeight: 600, 
          borderRadius: 8,
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          padding: '8px 14px',
          fontSize: '14px',
          whiteSpace: 'nowrap',
          height: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} 
      />
    </div>
  );
}
