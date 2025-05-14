// import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
// import { SolanaWalletProvider } from "./contexts/SolanaWalletContext"; // Removing this as we're using wallet-adapter
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Cafes from "./pages/Cafes";
import CafeDetail from "./pages/CafeDetail";
import CheckIn from "./pages/CheckIn";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MerchantDashboard from "./pages/MerchantDashboard";
import History from "./pages/History";
import AntiCoins from "./pages/AntiCoins";
import MerchantSessions from "./pages/MerchantSessions";
import Profile from "./pages/Profile";
import RegisteredEvents from "./pages/RegisteredEvents";
import EventDetails from "./pages/EventDetails";
import FocusTimer from "./pages/FocusTimer";
import CacheBuster from "./force-updates/CacheBuster";

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { SOLANA_RPC_ENDPOINT } from './config/solanaConfig'; // Ensured this path is correct

// Styled-components theme integration
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

const queryClient = new QueryClient();

const network = WalletAdapterNetwork.Devnet; // Or use SOLANA_NETWORK from your config
const endpoint = useMemo(() => SOLANA_RPC_ENDPOINT, []);
const wallets = useMemo(
    () => [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter({ network }),
    ],
    [network]
);

// Protected route component for merchant-only access
const MerchantRoute = () => {
  const { user, profile, loading } = useAuth();
  
  console.log("MerchantRoute checking - user:", !!user, "profile:", profile, "loading:", loading);
  
  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading authentication status...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  // Wait for profile to load before making role-based decisions
  if (!profile) {
    return <div className="h-screen flex items-center justify-center">Loading profile...</div>;
  }
  
  return profile.role === 'merchant' ? <MerchantDashboard /> : <Navigate to="/cafes" />;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={user ? <Navigate to="/cafes" /> : <Auth />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/cafes" element={<Cafes />} />
      <Route path="/cafe/:id" element={<CafeDetail />} />
      <Route path="/checkin/:id" element={user ? <CheckIn /> : <Navigate to="/auth" />} />
      <Route path="/merchant-dashboard" element={<MerchantRoute />} />
      <Route path="/history" element={<History />} />
      <Route path="/anti-coins" element={<AntiCoins />} />
      <Route path="/merchant-sessions" element={<MerchantSessions />} />
      <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} />
      <Route path="/events/:id" element={<EventDetails />} />
      <Route path="/registered-events" element={user ? <RegisteredEvents /> : <Navigate to="/auth" />} />
      <Route path="/focus-timer" element={user ? <FocusTimer /> : <Navigate to="/auth" />} />
      <Route path="/focus-timer/:cafeId" element={user ? <FocusTimer /> : <Navigate to="/auth" />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <ThemeProvider theme={theme}>
                        <ErrorBoundary>
                            <QueryClientProvider client={queryClient}>
                                <TooltipProvider>
                                    <Sonner />
                                    <AuthProvider>
                                        <BrowserRouter>
                                            <CacheBuster />
                                            <AppRoutes />
                                        </BrowserRouter>
                                    </AuthProvider>
                                </TooltipProvider>
                            </QueryClientProvider>
                        </ErrorBoundary>
                    </ThemeProvider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default App;
