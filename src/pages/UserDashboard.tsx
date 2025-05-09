import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AntiCoinBalance from '@/components/AntiCoinBalance';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PaymentHistoryItem {
  id: string;
  cafe_id: string;
  cafe_name: string;
  check_in_time: string;
  check_out_time: string;
  duration: number;
  usdc_paid: number;
  commission: number;
  total: number;
  coins_earned: number;
}

// Custom hook for fetching payment/session history
import { useCallback } from 'react';

interface UsePaymentHistoryResult {
  history: PaymentHistoryItem[];
  isLoading: boolean;
  error: string | null;
}

export function usePaymentHistory(userId?: string | null): UsePaymentHistoryResult {
  const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('check_ins')
        .select(`id, cafe_id, check_in_time, check_out_time, duration, usdc_paid, commission, total, coins_earned, cafes(name)`)
        .eq('user_id', userId)
        .order('check_in_time', { ascending: false });
      if (error) throw error;
      const mapped: PaymentHistoryItem[] = (data || []).map((item: any) => ({
        id: item.id,
        cafe_id: item.cafe_id,
        cafe_name: item.cafes?.name || 'Unknown Cafe',
        check_in_time: item.check_in_time,
        check_out_time: item.check_out_time,
        duration: item.duration,
        usdc_paid: item.usdc_paid,
        commission: item.commission,
        total: item.total,
        coins_earned: item.coins_earned ?? 0,
      }));
      setHistory(mapped);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
      toast('Failed to load payment history', { description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let mounted = true;
    if (!userId) {
      setHistory([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    fetchHistory();
    return () => { mounted = false; };
  }, [userId, fetchHistory]);

  return { history, isLoading, error };
}


// Table row rendering extracted for clarity
function PaymentHistoryTable({ history }: { history: PaymentHistoryItem[] }) {
  if (history.length === 0) {
    return <div className="text-gray-500">No sessions found. Start focusing at a cafe!</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-2 px-2">Cafe</th>
            <th className="text-left py-2 px-2">Check-in</th>
            <th className="text-left py-2 px-2">Check-out</th>
            <th className="text-left py-2 px-2">Duration</th>
            <th className="text-left py-2 px-2">Paid (USDC)</th>
            <th className="text-left py-2 px-2">Commission</th>
            <th className="text-left py-2 px-2">Total</th>
            <th className="text-left py-2 px-2">Anti Coins</th>
          </tr>
        </thead>
        <tbody>
          {history.map(item => (
            <tr key={item.id} className="border-b">
              <td className="py-2 px-2">{item.cafe_name}</td>
              <td className="py-2 px-2">{new Date(item.check_in_time).toLocaleString()}</td>
              <td className="py-2 px-2">{item.check_out_time ? new Date(item.check_out_time).toLocaleString() : '-'}</td>
              <td className="py-2 px-2">{item.duration ? `${Math.floor(item.duration / 60)}m` : '-'}</td>
              <td className="py-2 px-2">{typeof item.usdc_paid === 'number' ? item.usdc_paid.toFixed(2) : '-'}</td>
              <td className="py-2 px-2">{typeof item.commission === 'number' ? item.commission.toFixed(2) : '-'}</td>
              <td className="py-2 px-2 font-semibold">{typeof item.total === 'number' ? item.total.toFixed(2) : '-'}</td>
              <td className="py-2 px-2">{typeof item.coins_earned === 'number' ? item.coins_earned : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const UserDashboard = () => {
  const { user, loading } = useAuth();
  const { history, isLoading } = usePaymentHistory(user?.id);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-antiapp-purple" />
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate totals
  const totalSpent = history.reduce((sum, item) => sum + (typeof item.total === 'number' ? item.total : 0), 0);
  const totalCoins = history.reduce((sum, item) => sum + (typeof item.coins_earned === 'number' ? item.coins_earned : 0), 0);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto py-8 px-4 md:px-8">
        <AntiCoinBalance />
        <h1 className="text-2xl font-bold text-antiapp-purple mb-6">Welcome to your Dashboard</h1>
        <Card className="mb-8 bg-antiapp-teal/5">
          <CardHeader>
            <CardTitle>My Focus Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 md:gap-16 items-center">
              <div className="text-xl font-semibold text-antiapp-purple">Total Spent: <span className="text-antiapp-teal">{totalSpent.toFixed(2)} USDC</span></div>
              <div className="text-xl font-semibold text-antiapp-purple">Anti Coins Earned: <span className="text-antiapp-teal">{totalCoins}</span></div>
            </div>
          </CardContent>
        </Card>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Payment & Session History</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentHistoryTable history={history} />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;
