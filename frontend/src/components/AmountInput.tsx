import React from 'react';
import { Currency } from '../types';
import './AmountInput.css';

interface AmountInputProps {
  amount: string;
  currency: Currency;
  onAmountChange: (amount: string) => void;
  placeholder?: string;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  amount,
  currency,
  onAmountChange,
  placeholder = '0.00',
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Разрешаем только числа и точку
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      onAmountChange(value);
    }
  };

  return (
    <div className="amount-input-container">
      <div className="input-wrapper">
        <input
          type="text"
          value={amount}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="amount-input"
        />
        <div className="currency-badge">
          {currency}
        </div>
      </div>
    </div>
  );
}; 