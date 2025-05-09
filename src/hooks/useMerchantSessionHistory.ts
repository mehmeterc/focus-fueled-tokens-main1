import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MerchantSessionHistoryItem {
  id: string;
  cafe_id: string;
  cafe_name: string;
  user_id: string;
  user_email: string; // Added back to fix TypeScript error
  check_in_time: string;
  check_out_time: string;
  duration: number;
  usdc_paid: number;
  commission: number;
  total: number;
}

export function useMerchantSessionHistory(merchantId?: string | null) {
  const [history, setHistory] = useState<MerchantSessionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!merchantId) {
      setHistory([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    supabase
      .from('check_ins')
      .select(`id, cafe_id, user_id, check_in_time, check_out_time, duration, usdc_paid, commission, total, cafes(name, merchant_id)`)
      .order('check_in_time', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          setHistory([]);
          setIsLoading(false);
          return;
        }
        const filtered = (data || []).filter((item: any) => item.cafes?.merchant_id === merchantId);
        const mapped = filtered.map((item: any) => ({
          id: item.id,
          cafe_id: item.cafe_id,
          cafe_name: item.cafes?.name || 'Unknown Cafe',
          user_id: item.user_id,
          user_email: item.user_id, // Using user_id as email placeholder since we don't have a join
          check_in_time: item.check_in_time,
          check_out_time: item.check_out_time,
          duration: item.duration,
          usdc_paid: item.usdc_paid,
          commission: item.commission,
          total: item.total,
        }));
        setHistory(mapped);
        setIsLoading(false);
      });
  }, [merchantId]);

  return { history, isLoading, error };
}
