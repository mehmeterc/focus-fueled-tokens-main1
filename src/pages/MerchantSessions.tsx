import { useAuth } from '@/context/AuthContext';
import { useMerchantSessionHistory } from '@/hooks/useMerchantSessionHistory';
import Navbar from '@/components/Navbar';
import MerchantHamburgerMenu from '@/components/MerchantHamburgerMenu';
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

export default function MerchantSessions() {
  const { user, loading } = useAuth();
  const { history, isLoading } = useMerchantSessionHistory(user?.id);
  if (loading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-antiapp-purple" /></div>;
  }
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="container mx-auto py-8 px-4 md:px-8">
        <h1 className="text-2xl font-bold text-antiapp-purple mb-6">Merchant Session & Payment History</h1>
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
                      <th className="text-left py-2 px-2">User</th>
                      <th className="text-left py-2 px-2">Cafe</th>
                      <th className="text-left py-2 px-2">Check-in</th>
                      <th className="text-left py-2 px-2">Check-out</th>
                      <th className="text-left py-2 px-2">Duration</th>
                      <th className="text-left py-2 px-2">Paid (USDC)</th>
                      <th className="text-left py-2 px-2">Commission</th>
                      <th className="text-left py-2 px-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map(item => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2 px-2">{item.user_id}</td>
                        <td className="py-2 px-2">{item.cafe_name}</td>
                        <td className="py-2 px-2">{new Date(item.check_in_time).toLocaleString()}</td>
                        <td className="py-2 px-2">{item.check_out_time ? new Date(item.check_out_time).toLocaleString() : '-'}</td>
                        <td className="py-2 px-2">{item.duration ? `${Math.floor(item.duration / 60)}m` : '-'}</td>
                        <td className="py-2 px-2">{typeof item.usdc_paid === 'number' ? item.usdc_paid.toFixed(2) : '-'}</td>
                        <td className="py-2 px-2">{typeof item.commission === 'number' ? item.commission.toFixed(2) : '-'}</td>
                        <td className="py-2 px-2 font-semibold">{typeof item.total === 'number' ? item.total.toFixed(2) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleHistoryGroup>
          )
        ))}
        {history.length === 0 && <div className="text-gray-500 mt-8">No sessions found.</div>}
      </main>
      <Footer />
    </div>
  );
}
