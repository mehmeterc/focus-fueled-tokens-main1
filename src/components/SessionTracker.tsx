
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Clock, QrCode, LogOut } from 'lucide-react';

interface Session {
  id: string;
  user_id: string;
  check_in_time: string;
  check_out_time: string | null;
  duration: number | null;
  coins_earned: number | null;
  user_email?: string;
}

interface SessionTrackerProps {
  cafeId: string;
  onShowQRCode: (type: 'check-in' | 'check-out') => void;
}

const SessionTracker = ({ cafeId, onShowQRCode }: SessionTrackerProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Subscribe to real-time updates for check-ins
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        // Fetch all check-ins for this cafe with join to get user emails
        const { data, error } = await supabase
          .from('check_ins')
          .select(`
            id, user_id, check_in_time, check_out_time, duration, coins_earned
          `)
          .eq('cafe_id', cafeId)
          .order('check_in_time', { ascending: false });

        if (error) {
          console.error('Error fetching sessions:', error);
          setError('Failed to load sessions');
          return;
        }

        setSessions(data || []);
      } catch (err) {
        console.error('Error in fetchSessions:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();

    // Set up real-time listener for new check-ins
    const channel = supabase
      .channel('public:check_ins')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'check_ins',
          filter: `cafe_id=eq.${cafeId}`
        }, 
        (payload) => {
          console.log('Real-time update:', payload);
          // Refresh data when there's an update
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cafeId]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-t-2 border-antiapp-purple rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-antiapp-purple">Active Sessions</h3>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={() => onShowQRCode('check-in')}
          >
            <QrCode size={16} />
            <span className="hidden sm:inline">Check-In QR</span>
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={() => onShowQRCode('check-out')}
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Check-Out QR</span>
          </Button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No active sessions</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-2 text-left">User</th>
                <th className="px-2 py-2 text-left">Check In</th>
                <th className="px-2 py-2 text-left">Check Out</th>
                <th className="px-2 py-2 text-left">Duration</th>
                <th className="px-2 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const isActive = !session.check_out_time;
                const userId = session.user_id.slice(0, 8) + '...';
                
                return (
                  <tr key={session.id} className={`border-b ${isActive ? 'bg-green-50' : ''}`}>
                    <td className="px-2 py-2">{userId}</td>
                    <td className="px-2 py-2">{formatTime(session.check_in_time)}</td>
                    <td className="px-2 py-2">
                      {session.check_out_time ? formatTime(session.check_out_time) : '-'}
                    </td>
                    <td className="px-2 py-2">{formatDuration(session.duration)}</td>
                    <td className="px-2 py-2">
                      {isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Clock size={12} className="mr-1" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-500">
        Sessions will update in real-time when users check in or out
      </p>
    </div>
  );
};

export default SessionTracker;
