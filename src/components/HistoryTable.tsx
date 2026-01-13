import React from 'react';
import type { UtilityLog } from '../types';
import { Trash2, Zap, Download } from 'lucide-react';

interface HistoryTableProps {
  logs: UtilityLog[];
  onDelete: (id: string) => void;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ logs, onDelete }) => {
  const handleExportCSV = () => {
    if (logs.length === 0) return;

    // Define headers
    const headers = ['Date', 'User', 'Amount (NGN)', 'Units (kWh)', 'Meter Reading'];
    
    // Convert logs to CSV rows
    const csvContent = [
      headers.join(','),
      ...logs.map(log => {
        // Escape quotes in names if necessary
        const safeName = `"${log.userName.replace(/"/g, '""')}"`;
        return [
          log.date,
          safeName,
          log.amount,
          log.units,
          log.previousReading
        ].join(',');
      })
    ].join('\n');

    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `naira_power_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
          <Zap className="text-gray-400" size={24} />
        </div>
        <p className="text-gray-500">No recharge history yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
           Recharge History
        </h3>
        <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full hidden sm:inline-block">{logs.length} entries</span>
            <button 
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                title="Export as CSV"
            >
                <Download size={14} />
                Export CSV
            </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Amount (₦)</th>
              <th className="px-6 py-3">Units (kWh)</th>
              <th className="px-6 py-3">Meter Reading</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {new Date(log.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                        {log.userName.charAt(0)}
                     </div>
                     {log.userName}
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-green-600">
                  ₦{log.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Zap size={14} className="text-yellow-500" />
                    {log.units}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">
                    {log.previousReading.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onDelete(log.id)}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                    title="Delete Entry"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;
