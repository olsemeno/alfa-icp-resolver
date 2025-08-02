import React from 'react';
import './ExchangeButton.css';

interface ExchangeButtonProps {
  onExchange: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const ExchangeButton: React.FC<ExchangeButtonProps> = ({
  onExchange,
  disabled = false,
  loading = false,
}) => {
  return (
    <button
      onClick={onExchange}
      disabled={disabled || loading}
      className={`exchange-button ${disabled ? 'disabled' : ''} ${loading ? 'loading' : ''}`}
    >
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          Processing...
        </div>
      ) : (
        'Exchange Now'
      )}
    </button>
  );
}; 