import { useAuth } from '@/context/AuthContext';
import { usePaymentHistory } from './UserDashboard';
import Navbar from '@/components/Navbar';
import HamburgerMenu from '@/components/HamburgerMenu';
import Footer from '@/components/Footer';
import CollapsibleHistoryGroup from '@/components/CollapsibleHistoryGroup';
import { Loader2 } from 'lucide-react';

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
  const totalCoins = history.reduce((sum, item) => sum + (typeof item.coins_earned === 'number' ? item.coins_earned : 0), 0);
  if (loading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-antiapp-purple" /></div>;
  }
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="container mx-auto py-8 px-4 md:px-8">
        <h1 className="text-2xl font-bold text-antiapp-purple mb-6">Anti Coins Earned</h1>
        <div className="mb-6 text-xl font-semibold text-antiapp-purple flex items-center gap-2">Total Anti Coins: <span className="text-antiapp-teal">{totalCoins}</span>
          <span className="inline-block ml-2 animate-coin-float relative" style={{width:28, height:28}}>
            {/* Animated yellow coin icon SVG */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="12" fill="#FDE68A" stroke="#F59E42" strokeWidth="2" />
              <circle cx="14" cy="14" r="8" fill="#FDE047" stroke="#F59E42" strokeWidth="1.5" />
              <text x="14" y="18" textAnchor="middle" fontSize="13" fill="#B45309" fontWeight="bold">¢</text>
            </svg>
            <span className="coin-shimmer"></span>
          </span>
        </div>
        {groupHistoryByDate(history).map((group, idx) => (
          group.items.length > 0 && (
            <CollapsibleHistoryGroup
              key={group.title}
              title={group.title}
              defaultOpen={idx === 0}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-2">Cafe</th>
                      <th className="text-left py-2 px-2">Date</th>
                      <th className="text-left py-2 px-2">Anti Coins</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map(item => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2 px-2">{item.cafe_name}</td>
                        <td className="py-2 px-2">{new Date(item.check_in_time).toLocaleDateString()}</td>
                        <td className="py-2 px-2 font-semibold">{typeof item.coins_earned === 'number' ? item.coins_earned : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleHistoryGroup>
          )
        ))}
        {history.length === 0 && <div className="text-gray-500 mt-8">No Anti Coins earned yet.</div>}
      </main>
      <Footer />
    </div>
  );
}
