import React from 'react';
import { Currency } from '../types';
import './ExchangeRate.css';

interface ExchangeRateProps {
  fromCurrency: Currency;
  toCurrency: Currency;
  expectedAmount: string;
  amount: string;
}

export const ExchangeRate: React.FC<ExchangeRateProps> = ({
  fromCurrency,
  toCurrency,
  expectedAmount,
  amount,
}) => {
  if (!amount || parseFloat(amount) <= 0) {
    return null;
  }

  return (
    <div className="exchange-rate-container">
      <div className="rate-info">
        <div className="rate-label">Expected Amount</div>
        <div className="rate-value">
          {expectedAmount} {toCurrency}
        </div>
      </div>
      
      <div className="rate-details">
        <div className="detail-item">
          <span className="detail-label">Exchange Rate:</span>
          <span className="detail-value">
            1 {fromCurrency} = {fromCurrency === 'ETH' ? '0.00015' : '6666.67'} {toCurrency}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Fee:</span>
          <span className="detail-value">0.1%</span>
        </div>
      </div>
    </div>
  );
}; 