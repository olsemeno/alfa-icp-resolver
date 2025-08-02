import React from 'react';
import { Currency } from '../types';
import './CurrencySelector.css';

interface CurrencySelectorProps {
  fromCurrency: Currency;
  toCurrency: Currency;
  onCurrencyChange: (from: Currency, to: Currency) => void;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  fromCurrency,
  toCurrency,
  onCurrencyChange,
}) => {
  const handleFromCurrencyChange = (currency: Currency) => {
    // Если выбранная валюта уже в поле "to", меняем их местами
    if (currency === toCurrency) {
      onCurrencyChange(currency, fromCurrency);
    } else {
      // Иначе просто меняем fromCurrency
      onCurrencyChange(currency, toCurrency);
    }
  };

  const handleToCurrencyChange = (currency: Currency) => {
    // Если выбранная валюта уже в поле "from", меняем их местами
    if (currency === fromCurrency) {
      onCurrencyChange(toCurrency, currency);
    } else {
      // Иначе просто меняем toCurrency
      onCurrencyChange(fromCurrency, currency);
    }
  };

  return (
    <div className="currency-selector">
      <div className="currency-group">
        <label className="currency-label">From</label>
        <div className="currency-buttons">
          <button
            className={`currency-btn ${fromCurrency === 'ETH' ? 'active' : ''}`}
            onClick={() => handleFromCurrencyChange('ETH')}
          >
            ETH
          </button>
          <button
            className={`currency-btn ${fromCurrency === 'ICP' ? 'active' : ''}`}
            onClick={() => handleFromCurrencyChange('ICP')}
          >
            ICP
          </button>
        </div>
      </div>
      
      <div className="exchange-arrow">⇄</div>
      
      <div className="currency-group">
        <label className="currency-label">To</label>
        <div className="currency-buttons">
          <button
            className={`currency-btn ${toCurrency === 'ETH' ? 'active' : ''}`}
            onClick={() => handleToCurrencyChange('ETH')}
          >
            ETH
          </button>
          <button
            className={`currency-btn ${toCurrency === 'ICP' ? 'active' : ''}`}
            onClick={() => handleToCurrencyChange('ICP')}
          >
            ICP
          </button>
        </div>
      </div>
    </div>
  );
}; 