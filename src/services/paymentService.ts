// src/types/payment.ts
export interface Transaction {
  id: string;
  amount: number;
  type: 'deposit' | 'withdraw' | 'transfer';
  sender: string;
  receiver: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

// Mock Data for Initial State
export const mockTransactions: Transaction[] = [
  { id: '1', amount: 5000, type: 'deposit', sender: 'External Bank', receiver: 'My Wallet', date: '2024-03-15', status: 'completed' },
  { id: '2', amount: 1200, type: 'transfer', sender: 'My Wallet', receiver: 'Project X Tech', date: '2024-03-18', status: 'completed' },
  { id: '3', amount: 2500, type: 'withdraw', sender: 'My Wallet', receiver: 'Personal Account', date: '2024-03-20', status: 'pending' },
];