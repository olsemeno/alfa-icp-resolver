import { useState, useCallback, useEffect } from 'react';
import { WalletState } from '../types';
import { useMetaMask } from './useMetaMask';
import { useInternetIdentity } from './useInternetIdentity';

export const useWallets = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    eth: {
      connected: false,
    },
    icp: {
      connected: false,
    },
  });

  const metaMask = useMetaMask();
  const internetIdentity = useInternetIdentity();

  const connectETH = useCallback(async () => {
    try {
      if (metaMask.isMetaMaskInstalled()) {
        await metaMask.connect();
        
        // Обновляем состояние сразу после подключения
        if (metaMask.isConnected && metaMask.account) {
          setWalletState(prev => ({
            ...prev,
            eth: {
              connected: true,
              address: metaMask.account,
              balance: metaMask.balance ? `${parseFloat(metaMask.balance).toFixed(4)} ETH` : '0 ETH',
            },
          }));
        }
      } else {
        // Fallback к моковой логике если MetaMask не установлен
        console.log('MetaMask not installed, using mock connection...');
        setWalletState(prev => ({
          ...prev,
          eth: {
            connected: true,
            address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            balance: '1.234 ETH',
          },
        }));
      }
    } catch (error) {
      console.error('Failed to connect ETH wallet:', error);
    }
  }, [metaMask]);

  // Слушаем изменения состояния MetaMask
  useEffect(() => {
    if (metaMask.isConnected && metaMask.account) {
      setWalletState(prev => ({
        ...prev,
        eth: {
          connected: true,
          address: metaMask.account,
          balance: metaMask.balance ? `${parseFloat(metaMask.balance).toFixed(4)} ETH` : '0 ETH',
        },
      }));
    } else if (!metaMask.isConnected) {
      setWalletState(prev => ({
        ...prev,
        eth: {
          connected: false,
        },
      }));
    }
  }, [metaMask.isConnected, metaMask.account, metaMask.balance]);

  const disconnectETH = useCallback(() => {
    metaMask.disconnect();
    setWalletState(prev => ({
      ...prev,
      eth: {
        connected: false,
      },
    }));
  }, [metaMask]);

  const connectICP = useCallback(async () => {
    try {
      await internetIdentity.connect();
      
      // Обновляем состояние сразу после подключения
      if (internetIdentity.isConnected && internetIdentity.principal) {
        const balance = await internetIdentity.getBalance();
        setWalletState(prev => ({
          ...prev,
          icp: {
            connected: true,
            address: internetIdentity.principal,
            balance: `${parseFloat(balance).toFixed(4)} ICP`,
            identity: internetIdentity.identity, // Добавляем identity
          },
        }));
      }
    } catch (error) {
      console.error('Failed to connect ICP wallet:', error);
    }
  }, [internetIdentity]);

  // Слушаем изменения состояния Internet Identity
  useEffect(() => {
    if (internetIdentity.isConnected && internetIdentity.principal) {
      // Добавляем задержку, чтобы избежать частых вызовов
      const timer = setTimeout(() => {
        internetIdentity.getBalance().then(balance => {
          setWalletState(prev => ({
            ...prev,
            icp: {
              connected: true,
              address: internetIdentity.principal,
              balance: `${parseFloat(balance).toFixed(4)} ICP`,
              identity: internetIdentity.identity, // Добавляем identity
            },
          }));
        });
      }, 1000); // 1 секунда задержки

      return () => clearTimeout(timer);
    } else if (!internetIdentity.isConnected) {
      setWalletState(prev => ({
        ...prev,
        icp: {
          connected: false,
        },
      }));
    }
  }, [internetIdentity.isConnected, internetIdentity.principal, internetIdentity.identity]);

  const disconnectICP = useCallback(() => {
    internetIdentity.disconnect();
    setWalletState(prev => ({
      ...prev,
      icp: {
        connected: false,
      },
    }));
  }, [internetIdentity]);

  return {
    walletState,
    connectETH,
    disconnectETH,
    connectICP,
    disconnectICP,
    metaMaskError: metaMask.error,
    metaMaskLoading: metaMask.isLoading,
    internetIdentityError: internetIdentity.error,
    internetIdentityLoading: internetIdentity.isLoading,
  };
}; 