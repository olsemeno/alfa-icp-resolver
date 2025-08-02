export type Currency = 'ETH' | 'ICP';

export interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;
  fee: number;
}

export interface ExchangeForm {
  fromCurrency: Currency;
  toCurrency: Currency;
  amount: string;
  recipientAddress: string;
  expectedAmount: string;
}

export interface WalletState {
  eth: {
    connected: boolean;
    address?: string | null;
    balance?: string;
  };
  icp: {
    connected: boolean;
    address?: string | null;
    balance?: string;
    identity?: any; // Добавляем identity для ICP
  };
} 