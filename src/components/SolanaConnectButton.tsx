import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const SolanaConnectButton: React.FC = () => {
    return (
        <WalletMultiButton 
            style={{
                // You can customize styling here or use default @solana/wallet-adapter-react-ui styles
                // Example styling (optional) - adjust to match your app's theme:
                // backgroundColor: 'rgb(100, 21, 255)', // A purple shade similar to Solana's branding
                // color: 'white',
                // borderRadius: '8px',
                // padding: '10px 15px',
                // fontWeight: 'bold',
                // border: 'none',
                // cursor: 'pointer',
                // fontSize: '0.9rem',
                // lineHeight: '1.5',
                // minWidth: '180px', // Ensure it has enough width for text
                // display: 'flex', // For centering content if you add icons
                // alignItems: 'center',
                // justifyContent: 'center',
            }}
        />
    );
};
