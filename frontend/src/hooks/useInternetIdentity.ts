import { useState, useCallback, useEffect } from 'react';
import { ICRC1Service } from '../services/icrc1Service';

// Ленивая загрузка DFINITY зависимостей
let AuthClient: any = null;
let Identity: any = null;

const loadDfinityDeps = async () => {
  if (!AuthClient) {
    const authClientModule = await import('@dfinity/auth-client');
    AuthClient = authClientModule.AuthClient;
  }
  if (!Identity) {
    // Identity доступен через AuthClient, не нужно импортировать отдельно
    Identity = null; // Будем использовать identity из AuthClient
  }
};

interface InternetIdentityState {
  isConnected: boolean;
  identity: any | null;
  principal: string | null;
  authClient: any | null;
}

export const useInternetIdentity = () => {
  const [state, setState] = useState<InternetIdentityState>({
    isConnected: false,
    identity: null,
    principal: null,
    authClient: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Инициализация AuthClient
  const initializeAuthClient = useCallback(async () => {
    try {
      await loadDfinityDeps();
      
      const authClient = await AuthClient.create({
        idleOptions: {
          idleTimeout: 1000 * 60 * 30, // 30 минут
          disableDefaultIdleCallback: true,
        },
      });

      setState(prev => ({ ...prev, authClient }));

      // Проверяем, есть ли уже активная сессия
      const isAuthenticated = await authClient.isAuthenticated();
      if (isAuthenticated) {
        const identity = authClient.getIdentity();
        const principal = identity.getPrincipal().toText();
        const icrc1Service = new ICRC1Service();
        
        setState(prev => ({
          ...prev,
          isConnected: true,
          identity,
          principal,
        }));
      }

      return authClient;
    } catch (error) {
      console.error('Error initializing AuthClient:', error);
      setError('Failed to initialize Internet Identity');
      return null;
    }
  }, []);

  // Подключение к Internet Identity
  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await loadDfinityDeps();
      
      let authClient = state.authClient;
      
      if (!authClient) {
        authClient = await initializeAuthClient();
        if (!authClient) {
          throw new Error('Failed to initialize AuthClient');
        }
      }

      // Открываем окно авторизации
      await new Promise<void>((resolve, reject) => {
        authClient!.login({
          identityProvider: process.env.REACT_APP_INTERNET_IDENTITY_URL || 'https://identity.ic0.app',
          onSuccess: () => {
            try {
              const identity = authClient!.getIdentity();
              const principal = identity.getPrincipal().toText();
              const icrc1Service = new ICRC1Service();
              
                          setState(prev => ({
              ...prev,
              isConnected: true,
              identity,
              principal,
            }));
              resolve();
            } catch (error) {
              console.error('Error creating ICRC1Service:', error);
              // Если ICRC1Service не создался, все равно подключаемся
              const identity = authClient!.getIdentity();
              const principal = identity.getPrincipal().toText();
              
              setState(prev => ({
                ...prev,
                isConnected: true,
                identity,
                principal,
              }));
              resolve();
            }
          },
          onError: (error: any) => {
            console.error('Login error:', error);
            reject(new Error('Login failed'));
          },
        });
      });

    } catch (error: any) {
      console.error('Error connecting to Internet Identity:', error);
      setError(error.message || 'Failed to connect to Internet Identity');
    } finally {
      setIsLoading(false);
    }
  }, [state.authClient, initializeAuthClient]);

  // Отключение от Internet Identity
  const disconnect = useCallback(async () => {
    try {
      if (state.authClient) {
        await state.authClient.logout();
      }
      
      setState({
        isConnected: false,
        identity: null,
        principal: null,
        authClient: null,
      });
      setError(null);
    } catch (error) {
      console.error('Error disconnecting from Internet Identity:', error);
    }
  }, [state.authClient]);

  // Получение баланса ICP
  const getBalance = useCallback(async (): Promise<string> => {
    try {
      if (!state.isConnected || !state.principal || !state.identity) {
        return '0';
      }
      
      // Создаем ICRC1Service и получаем баланс
      const icrc1Service = new ICRC1Service();
      return await icrc1Service.getBalance(state.principal, state.identity);
    } catch (error) {
      console.error('Error getting ICP balance:', error);
      return '0';
    }
  }, [state.isConnected, state.principal, state.identity]);

  // Инициализация при загрузке
  useEffect(() => {
    initializeAuthClient();
  }, [initializeAuthClient]);

  return {
    ...state,
    isLoading,
    error,
    connect,
    disconnect,
    getBalance,
  };
}; 