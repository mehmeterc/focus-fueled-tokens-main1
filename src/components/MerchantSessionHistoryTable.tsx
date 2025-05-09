import React from 'react';
import { MerchantSessionHistoryItem } from '@/hooks/useMerchantSessionHistory';

export default function MerchantSessionHistoryTable({ history }: { history: MerchantSessionHistoryItem[] }) {
  if (!history.length) {
    return <div className="text-gray-500">No sessions found for your cafes yet.</div>;
  }
  return (
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
          {history.map(item => (
            <tr key={item.id} className="border-b">
              <td className="py-2 px-2">{item.user_email}</td>
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
  );
}
