import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;

import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { WalletProviders } from '@/components/solanaWalletProviders';
import { AntiCoinProvider } from '@/context/AntiCoinContext'; // Import AntiCoinProvider

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WalletProviders>
      <AntiCoinProvider>
        <App />
      </AntiCoinProvider>
    </WalletProviders>
  </React.StrictMode>
);
