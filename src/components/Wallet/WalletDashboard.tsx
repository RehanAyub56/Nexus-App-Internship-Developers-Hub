import React, { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Send, History, CreditCard } from 'lucide-react';
import { mockTransactions, Transaction } from './paymentService';

const WalletDashboard = () => {
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [balance, setBalance] = useState(12500.50);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-primary-100 text-sm font-medium">Available Balance</p>
              <h2 className="text-3xl font-bold mt-1">${balance.toLocaleString()}</h2>
            </div>
            <Wallet className="opacity-80" size={28} />
          </div>
          <div className="mt-8 flex gap-3">
            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2">
              <ArrowDownLeft size={16} /> Deposit
            </button>
            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2">
              <ArrowUpRight size={16} /> Withdraw
            </button>
          </div>
        </div>

        {/* Quick Action: Transfer Mock */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
            <Send size={20} className="text-primary-600" /> Fast Funding Transfer
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Recipient Address or Project Name" 
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Amount ($)" 
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Send
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">Payments are processed securely via Business Nexus Escrow.</p>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History size={20} className="text-secondary-600" /> Transaction History
          </h3>
          <button className="text-primary-600 text-sm font-medium hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">#{tx.id.padStart(6, '0')}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800 capitalize">{tx.type}</span>
                      <span className="text-xs text-gray-500">{tx.sender} → {tx.receiver}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 font-semibold ${tx.type === 'deposit' ? 'text-success-700' : 'text-gray-800'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tx.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium 
                      ${tx.status === 'completed' ? 'bg-success-50 text-success-700' : 
                        tx.status === 'pending' ? 'bg-warning-50 text-warning-700' : 'bg-error-50 text-error-700'}`}>
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

export default WalletDashboard;