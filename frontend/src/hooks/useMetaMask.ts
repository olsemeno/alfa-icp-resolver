import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';

interface MetaMaskState {
  isConnected: boolean;
  account: string | null;
  balance: string | null;
  chainId: number | null;
  provider: ethers.BrowserProvider | null;
}

export const useMetaMask = () => {
  const [state, setState] = useState<MetaMaskState>({
    isConnected: false,
    account: null,
    balance: null,
    chainId: null,
    provider: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Проверяем, установлен ли MetaMask
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
  }, []);

  // Безопасная проверка window.ethereum
  const getEthereum = useCallback(() => {
    return typeof window !== 'undefined' ? window.ethereum : undefined;
  }, []);

  // Получаем баланс аккаунта
  const getBalance = useCallback(async (provider: ethers.BrowserProvider, address: string) => {
    try {
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }, []);

  // Подключение к MetaMask
  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed. Please install MetaMask extension.');
      return;
    }

    const ethereum = getEthereum();
    if (!ethereum) {
      setError('Ethereum provider not found.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Запрашиваем подключение аккаунтов
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        setError('No accounts found. Please connect your MetaMask wallet.');
        return;
      }

      const account = accounts[0];
      const provider = new ethers.BrowserProvider(ethereum);
      const network = await provider.getNetwork();
      const balance = await getBalance(provider, account);

      setState({
        isConnected: true,
        account,
        balance,
        chainId: Number(network.chainId),
        provider,
      });

    } catch (error: any) {
      console.error('Error connecting to MetaMask:', error);
      setError(error.message || 'Failed to connect to MetaMask');
    } finally {
      setIsLoading(false);
    }
  }, [isMetaMaskInstalled, getEthereum, getBalance]);

  // Отключение от MetaMask
  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      account: null,
      balance: null,
      chainId: null,
      provider: null,
    });
    setError(null);
  }, []);

  // Обновление баланса
  const refreshBalance = useCallback(async () => {
    if (state.isConnected && state.provider && state.account) {
      try {
        const balance = await getBalance(state.provider, state.account);
        setState(prev => ({ ...prev, balance }));
      } catch (error) {
        console.error('Error refreshing balance:', error);
      }
    }
  }, [state.isConnected, state.provider, state.account, getBalance]);

  // Слушаем изменения аккаунтов
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const ethereum = getEthereum();
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // Пользователь отключил кошелек
        disconnect();
      } else if (state.account !== accounts[0]) {
        // Пользователь сменил аккаунт
        setState(prev => ({ ...prev, account: accounts[0] }));
        refreshBalance();
      }
    };

    const handleChainChanged = () => {
      // Перезагружаем страницу при смене сети
      window.location.reload();
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [isMetaMaskInstalled, getEthereum, state.account, disconnect, refreshBalance]);

  // Автоматическое обновление баланса каждые 30 секунд
  useEffect(() => {
    if (!state.isConnected) return;

    const interval = setInterval(refreshBalance, 30000);
    return () => clearInterval(interval);
  }, [state.isConnected, refreshBalance]);

  return {
    ...state,
    isLoading,
    error,
    connect,
    disconnect,
    refreshBalance,
    isMetaMaskInstalled,
  };
}; 