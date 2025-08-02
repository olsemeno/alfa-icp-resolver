import React from 'react';
import { WalletState } from '../types';
import { NetworkInfo } from './NetworkInfo';
import './WalletConnect.css';

interface WalletConnectProps {
  walletState: WalletState;
  onConnectETH: () => void;
  onDisconnectETH: () => void;
  onConnectICP: () => void;
  onDisconnectICP: () => void;
  metaMaskError?: string | null;
  metaMaskLoading?: boolean;
  internetIdentityError?: string | null;
  internetIdentityLoading?: boolean;
  chainId?: number | null;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  walletState,
  onConnectETH,
  onDisconnectETH,
  onConnectICP,
  onDisconnectICP,
  metaMaskError,
  metaMaskLoading,
  internetIdentityError,
  internetIdentityLoading,
  chainId,
}) => {
  return (
    <div className="wallet-connect-container">
      <h3 className="wallet-title">Connect Wallets</h3>
      
      <div className="wallet-buttons">
        <div className="wallet-section">
          <div className="wallet-header">
            <span className="wallet-name">Ethereum</span>
            <span className={`wallet-status ${walletState.eth.connected ? 'connected' : 'disconnected'}`}>
              {walletState.eth.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {walletState.eth.connected ? (
            <div className="wallet-info">
              <div className="wallet-address">{walletState.eth.address}</div>
              <div className="wallet-balance">{walletState.eth.balance}</div>
              <NetworkInfo chainId={chainId || null} account={walletState.eth.address || null} />
              <button onClick={onDisconnectETH} className="disconnect-btn">
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={onConnectETH} 
              className={`connect-btn eth ${metaMaskLoading ? 'loading' : ''}`}
              disabled={metaMaskLoading}
            >
              {metaMaskLoading ? 'Connecting...' : 'Connect ETH Wallet'}
            </button>
          )}
          
          {metaMaskError && (
            <div className="error-message">
              {metaMaskError}
            </div>
          )}
        </div>

        <div className="wallet-section">
          <div className="wallet-header">
            <span className="wallet-name">Internet Computer</span>
            <span className={`wallet-status ${walletState.icp.connected ? 'connected' : 'disconnected'}`}>
              {walletState.icp.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {walletState.icp.connected ? (
            <div className="wallet-info">
              <div className="wallet-address">{walletState.icp.address}</div>
              <div className="wallet-balance">{walletState.icp.balance}</div>
              <button onClick={onDisconnectICP} className="disconnect-btn">
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={onConnectICP} 
              className={`connect-btn icp ${internetIdentityLoading ? 'loading' : ''}`}
              disabled={internetIdentityLoading}
            >
              {internetIdentityLoading ? 'Connecting...' : 'Connect ICP Wallet'}
            </button>
          )}
          
          {internetIdentityError && (
            <div className="error-message">
              {internetIdentityError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 