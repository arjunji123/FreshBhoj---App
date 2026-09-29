import { apiClient } from '../client';
import type { Paginated, TopUpResult, WalletSummary, WalletTransaction, WalletWithdrawal } from '../types';

/**
 * Customer prepaid wallet — a real balance (mirrors the kitchen-partner
 * Wallet module), distinct from the separate FreshBhoj Coins ledger
 * (`referralApi`). Top-up completes instantly, same placeholder idiom as
 * every other payment surface in this app; withdrawal genuinely waits on ops
 * (`status: 'REQUESTED'` on creation, not instant).
 */
export const walletApi = {
  getSummary: () => apiClient.get<WalletSummary>('/customer/wallet'),

  listTransactions: (page = 1, limit = 20) =>
    apiClient.get<Paginated<WalletTransaction>>('/customer/wallet/transactions', {
      query: { page, limit },
    }),

  topUp: (amountRs: number) =>
    apiClient.post<TopUpResult>('/customer/wallet/topup', { amountRs }),

  listWithdrawals: (page = 1, limit = 20) =>
    apiClient.get<Paginated<WalletWithdrawal>>('/customer/wallet/withdrawals', {
      query: { page, limit },
    }),

  requestWithdrawal: (amountRs: number, destination: Record<string, string>) =>
    apiClient.post<WalletWithdrawal>('/customer/wallet/withdraw', { amountRs, destination }),
};
