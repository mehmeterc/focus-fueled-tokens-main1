import { useAuth } from '@/context/AuthContext';
import { usePaymentHistory } from './UserDashboard';
import CollapsibleHistoryGroup from '@/components/CollapsibleHistoryGroup';
import { Loader2 } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import events from '../components/eventsData';

function groupHistoryByDate(history: any[]) {
  const now = new Date();
  const today: any[] = [];
  const thisWeek: any[] = [];
  const thisMonth: any[] = [];
  const earlier: any[] = [];

  function isToday(date: Date) {
    return date.toDateString() === now.toDateString();
  }
  function isThisWeek(date: Date) {
    const firstDayOfWeek = new Date(now);
    firstDayOfWeek.setDate(now.getDate() - now.getDay());
    return date >= firstDayOfWeek && !isToday(date);
  }
  function isThisMonth(date: Date) {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      !isThisWeek(date) &&
      !isToday(date)
    );
  }

  for (const item of history) {
    const d = new Date(item.check_in_time);
    if (isToday(d)) today.push(item);
    else if (isThisWeek(d)) thisWeek.push(item);
    else if (isThisMonth(d)) thisMonth.push(item);
    else earlier.push(item);
  }
  return [
    { title: 'Today', items: today },
    { title: 'This Week', items: thisWeek },
    { title: 'This Month', items: thisMonth },
    { title: 'Earlier', items: earlier },
  ];
}

export default function AntiCoins() {
  const { user, loading } = useAuth();
  const { history, isLoading } = usePaymentHistory(user?.id);
  const [spentCoins, setSpentCoins] = useState<any[]>([]);
  const [loadingSpent, setLoadingSpent] = useState(true);

  // Calculate earned, spent, and total coins
  const totalEarnedCoins = history.reduce(
    (sum, item) => sum + (typeof item.coins_earned === 'number' ? item.coins_earned : 0), 
    0
  );

  const totalSpentCoins = spentCoins.reduce(
    (sum, item) => sum + (typeof item.price === 'number' ? item.price : 0), 
    0
  );

  const currentBalance = totalEarnedCoins - totalSpentCoins;

  // Fetch spent coins from event registrations
  useEffect(() => {
    const fetchSpentCoins = async () => {
      if (!user) return;
      
      setLoadingSpent(true);
      try {
        // Get all registered events for the current user
        const { data: registrations, error: regError } = await supabase
          .from('event_registrations')
          .select('event_id, registered_at')
          .eq('user_id', user.id);

        if (regError) throw regError;

        // If there are registrations, transform them for display
        if (registrations && registrations.length > 0) {
          // In a real app, you would fetch event details from the database
          // For now, we'll use the mock events data
          const eventsWithPrices = registrations.map(reg => {
            const event = events.find(e => String(e.id) === reg.event_id);
            return {
              id: reg.event_id,
              title: event?.title || 'Event',
              price: event?.price || 0,
              date: new Date(reg.registered_at),
              type: 'event_registration'
            };
          });
          
          setSpentCoins(eventsWithPrices);
        } else {
          setSpentCoins([]);
        }
      } catch (error) {
        console.error('Error fetching spent coins:', error);
      } finally {
        setLoadingSpent(false);
      }
    };

    fetchSpentCoins();
  }, [user]);

  // Group spent coins data by date for display
  const groupedSpentCoins = groupHistoryByDate(spentCoins);

  if (loading || isLoading || loadingSpent) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-antiapp-purple" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <main className="container mx-auto py-8 px-4 md:px-8">
        {/* AntiCoin Balance Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold text-antiapp-purple mb-4">AntiCoins Summary</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-antiapp-teal/10 rounded-lg p-4">
              <h3 className="text-antiapp-teal font-semibold mb-2">Earned</h3>
              <div className="flex items-center gap-2 text-xl">
                <span className="font-bold">{totalEarnedCoins}</span>
                <span>¢</span>
              </div>
            </div>
            
            <div className="bg-red-100 rounded-lg p-4">
              <h3 className="text-red-600 font-semibold mb-2">Spent</h3>
              <div className="flex items-center gap-2 text-xl">
                <span className="font-bold">{totalSpentCoins}</span>
                <span>¢</span>
              </div>
            </div>
            
            <div className="bg-antiapp-purple/10 rounded-lg p-4">
              <h3 className="text-antiapp-purple font-semibold mb-2">Current Balance</h3>
              <div className="flex items-center gap-2 text-xl">
                <span className="font-bold">{currentBalance}</span>
                <span>¢</span>
                <span className="inline-block ml-2 animate-bounce relative" style={{width:28, height:28}}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="14" cy="14" r="12" fill="#FDE68A" stroke="#F59E42" strokeWidth="2" />
                    <circle cx="14" cy="14" r="8" fill="#FDE047" stroke="#F59E42" strokeWidth="1.5" />
                    <text x="14" y="18" textAnchor="middle" fontSize="13" fill="#B45309" fontWeight="bold">¢</text>
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Earned Coins Section */}
        <h2 className="text-xl font-bold text-antiapp-purple mb-4">AntiCoins Earned</h2>
        {groupHistoryByDate(history).map((group, idx) => (
          group.items.length > 0 && (
            <CollapsibleHistoryGroup
              key={`earned-${group.title}`}
              title={group.title}
              defaultOpen={idx === 0}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-2 px-3 font-medium">Cafe</th>
                      <th className="text-left py-2 px-3 font-medium">Date</th>
                      <th className="text-right py-2 px-3 font-medium">Coins Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map(item => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3">{item.cafe_name}</td>
                        <td className="py-2 px-3">{new Date(item.check_in_time).toLocaleDateString()}</td>
                        <td className="py-2 px-3 font-semibold text-right text-green-600">
                          +{typeof item.coins_earned === 'number' ? item.coins_earned : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleHistoryGroup>
          )
        ))}
        {history.length === 0 && 
          <div className="text-gray-500 mt-4 mb-8 p-4 bg-gray-50 rounded">No AntiCoins earned yet.</div>
        }

        {/* Spent Coins Section */}
        <h2 className="text-xl font-bold text-antiapp-purple mb-4 mt-10">AntiCoins Spent</h2>
        {groupedSpentCoins.map((group, idx) => (
          group.items.length > 0 && (
            <CollapsibleHistoryGroup
              key={`spent-${group.title}`}
              title={group.title}
              defaultOpen={idx === 0}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-2 px-3 font-medium">Event</th>
                      <th className="text-left py-2 px-3 font-medium">Date</th>
                      <th className="text-right py-2 px-3 font-medium">Coins Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map(item => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3">{item.title}</td>
                        <td className="py-2 px-3">{item.date.toLocaleDateString()}</td>
                        <td className="py-2 px-3 font-semibold text-right text-red-600">
                          -{item.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleHistoryGroup>
          )
        ))}
        {spentCoins.length === 0 && 
          <div className="text-gray-500 mt-4 mb-8 p-4 bg-gray-50 rounded">No AntiCoins spent yet.</div>
        }
      </main>
    </PageLayout>
  );
}
