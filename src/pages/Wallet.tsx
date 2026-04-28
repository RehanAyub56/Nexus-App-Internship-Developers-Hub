import React, { useState } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Send, History } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Wallet = () => {
  const [balance] = useState(25400.00);

  const transactions = [
    { id: 'TX-9021', type: 'Investment', project: 'EcoTech Solar', amount: -5000, status: 'completed', date: '2024-03-20' },
    { id: 'TX-8842', type: 'Deposit', project: 'Bank Transfer', amount: 10000, status: 'completed', date: '2024-03-18' },
    { id: 'TX-8710', type: 'Withdrawal', project: 'Personal Account', amount: -1200, status: 'pending', date: '2024-03-15' },
  ];

  const handleAction = (action: string) => {
    toast.success(`${action} simulation started!`, {
      style: { border: '1px solid #3B82F6', padding: '16px', color: '#1E3A8A' },
      iconTheme: { primary: '#3B82F6', secondary: '#FFFAEE' },
    });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-8 rounded-3xl text-white shadow-xl">
          <p className="text-primary-100 text-sm font-medium">Nexus Wallet Balance</p>
          <h2 className="text-4xl font-bold mt-2">${balance.toLocaleString()}</h2>
          <div className="mt-8 flex gap-4">
            <button onClick={() => handleAction('Deposit')} className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-xl flex items-center justify-center gap-2 transition-all">
              <ArrowDownLeft size={18} /> Deposit
            </button>
            <button onClick={() => handleAction('Withdraw')} className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-xl flex items-center justify-center gap-2 transition-all">
              <ArrowUpRight size={18} /> Withdraw
            </button>
          </div>
        </div>

        {/* Transfer Section */}
        <div className="md:col-span-2 bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
            <Send className="text-secondary-500" /> Fund a Project
          </h3>
          <div className="space-y-4">
            <input type="text" placeholder="Project ID or Entrepreneur Name" className="w-full p-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500" />
            <div className="flex gap-4">
              <input type="number" placeholder="Amount ($)" className="w-full p-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500" />
              <button onClick={() => handleAction('Transfer')} className="bg-primary-600 hover:bg-primary-700 text-white px-8 rounded-xl font-bold transition-all">
                Transfer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><History size={20}/> Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-400">{tx.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-700">{tx.type}</p>
                    <p className="text-xs text-gray-400">{tx.project}</p>
                  </td>
                  <td className={`px-6 py-4 font-bold ${tx.amount > 0 ? 'text-success-700' : 'text-gray-800'}`}>
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount}$
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${tx.status === 'completed' ? 'bg-success-50 text-success-700' : 'bg-warning-50 text-warning-700'}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Wallet;