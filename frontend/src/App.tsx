import React, { useState } from 'react';
import { CurrencySelector } from './components/CurrencySelector';
import { AmountInput } from './components/AmountInput';
import { ExchangeRate } from './components/ExchangeRate';
import { WalletConnect } from './components/WalletConnect';
import { ExchangeButton } from './components/ExchangeButton';
import { ConfirmModal } from './components/ConfirmModal';
import { useExchange } from './hooks/useExchange';
import { useWallets } from './hooks/useWallets';
import { useMetaMask } from './hooks/useMetaMask';
import './App.css';

function App() {
  const {
    form,
    handleAmountChange,
    handleCurrencyChange,
    handleExchange,
    isTransferring,
    transferError,
    showConfirmModal,
    confirmIcpTransfer,
    closeConfirmModal,
  } = useExchange();

  const {
    walletState,
    connectETH,
    disconnectETH,
    connectICP,
    disconnectICP,
    metaMaskError,
    metaMaskLoading,
    internetIdentityError,
    internetIdentityLoading,
  } = useWallets();

  // Получаем chainId из MetaMask
  const metaMask = useMetaMask();

  const handleExchangeWithLoading = async () => {
    try {
      await handleExchange(walletState);
    } catch (error) {
      console.error('Exchange error:', error);
    }
  };

  const canExchange = form.amount && 
    parseFloat(form.amount) > 0 && 
    form.expectedAmount;

  return (
    <div className="App">
      <div className="container">
        <header className="app-header">
          <h1 className="app-title">1Inch Example Crypto Exchange</h1>
          <p className="app-subtitle">ETH ↔ ICP Exchange Platform</p>
        </header>

        <main className="app-main">
          <WalletConnect
            walletState={walletState}
            onConnectETH={connectETH}
            onDisconnectETH={disconnectETH}
            onConnectICP={connectICP}
            onDisconnectICP={disconnectICP}
            metaMaskError={metaMaskError}
            metaMaskLoading={metaMaskLoading}
            internetIdentityError={internetIdentityError}
            internetIdentityLoading={internetIdentityLoading}
            chainId={metaMask.chainId}
          />

          <div className="exchange-container">
            <CurrencySelector
              fromCurrency={form.fromCurrency}
              toCurrency={form.toCurrency}
              onCurrencyChange={handleCurrencyChange}
            />

            <AmountInput
              amount={form.amount}
              currency={form.fromCurrency}
              onAmountChange={handleAmountChange}
              placeholder="Enter amount to exchange"
            />

            {form.expectedAmount && (
              <ExchangeRate
                fromCurrency={form.fromCurrency}
                toCurrency={form.toCurrency}
                expectedAmount={form.expectedAmount}
                amount={form.amount}
              />
            )}

            {form.expectedAmount && (
              <ExchangeButton
                onExchange={handleExchangeWithLoading}
                disabled={!canExchange || isTransferring}
                loading={isTransferring}
              />
            )}
          </div>
        </main>

        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={closeConfirmModal}
          onConfirm={() => confirmIcpTransfer(walletState)}
          title="Confirm ICP Transfer"
          message="Please review the transaction details below before confirming the transfer."
          amount={form.amount}
          fromCurrency={form.fromCurrency}
          toCurrency={form.toCurrency}
          loading={isTransferring}
        />
      </div>
    </div>
  );
}

export default App; 