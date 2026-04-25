export type WalletType = 'debit' | 'credit' | 'e-wallet' | 'cash';

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  wallet_type: WalletType;
  icon?: string;
  color?: string;
  user_id?: string;
}
