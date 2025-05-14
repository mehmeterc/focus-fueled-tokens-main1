import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import styled from 'styled-components';

const WalletButtonWrapper = styled.div`
  margin-left: auto; /* Aligns button to the right if in a flex container */

  .wallet-adapter-button {
    background-color: ${props => props.theme.colors.primary} !important;
    color: white !important;
    border-radius: 8px !important;
    font-weight: bold !important;
    padding: 0.5rem 1rem !important;
    transition: background-color 0.3s ease !important;

    &:hover {
      background-color: ${props => props.theme.colors.secondary} !important;
    }

    &:not([disabled]):hover {
        background-color: ${props => props.theme.colors.secondary} !important;
    }
  }
  /* Add more styles if needed for dropdown, modal, etc. */
`;

const WalletConnectButton: React.FC = () => {
    return (
        <WalletButtonWrapper>
            <WalletMultiButton />
        </WalletButtonWrapper>
    );
};

export default WalletConnectButton;
