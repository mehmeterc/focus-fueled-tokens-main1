
// import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SolanaWalletProvider } from "./context/SolanaWalletProvider";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
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

const queryClient = new QueryClient();


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
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <SolanaWalletProvider>
        <TooltipProvider>
          {/* <Toaster /> */}
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </SolanaWalletProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
