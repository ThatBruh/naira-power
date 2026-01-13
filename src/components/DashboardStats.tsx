import React, { useMemo } from 'react';
import type { UtilityLog } from '../types';
import { Wallet, Zap, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardStatsProps {
  logs: UtilityLog[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ logs }) => {
  const stats = useMemo(() => {
    if (logs.length === 0) return { totalSpent: 0, totalUnits: 0, avgCost: 0 };
    
    const totalSpent = logs.reduce((acc, log) => acc + log.amount, 0);
    const totalUnits = logs.reduce((acc, log) => acc + log.units, 0);
    const avgCost = totalSpent / logs.length;

    return { totalSpent, totalUnits, avgCost };
  }, [logs]);

  // Prepare chart data (sort by date ascending for chart)
  const chartData = useMemo(() => {
    return [...logs]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(log => ({
        date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        amount: log.amount,
        units: log.units
      }));
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Spent</p>
            <h3 className="text-2xl font-bold text-gray-900">₦{stats.totalSpent.toLocaleString()}</h3>
          </div>
          <div className="bg-green-100 p-3 rounded-lg text-green-600">
            <Wallet size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Energy</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalUnits.toLocaleString()} kWh</h3>
          </div>
          <div className="bg-yellow-100 p-3 rounded-lg text-yellow-600">
            <Zap size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Avg. Recharge</p>
            <h3 className="text-2xl font-bold text-gray-900">₦{Math.round(stats.avgCost).toLocaleString()}</h3>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <Activity size={24} />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Spending Trend</h3>
        <div className="h-64 w-full">
           {logs.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                 <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontSize: 12}} 
                    dy={10}
                 />
                 <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontSize: 12}} 
                 />
                 <Tooltip 
                    cursor={{fill: '#f9fafb'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                 />
                 <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} name="Amount (₦)" />
               </BarChart>
             </ResponsiveContainer>
           ) : (
             <div className="h-full flex items-center justify-center text-gray-400">
               No data to display
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;