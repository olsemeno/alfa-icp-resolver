import React from 'react';
import './NetworkInfo.css';

interface NetworkInfoProps {
  chainId: number | null;
  account: string | null;
}

export const NetworkInfo: React.FC<NetworkInfoProps> = ({ chainId, account }) => {
  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return 'Ethereum Mainnet';
      case 5:
        return 'Goerli Testnet';
      case 11155111:
        return 'Sepolia Testnet';
      case 137:
        return 'Polygon Mainnet';
      case 80001:
        return 'Mumbai Testnet';
      default:
        return `Chain ID: ${chainId}`;
    }
  };

  const getNetworkColor = (chainId: number) => {
    switch (chainId) {
      case 1:
        return '#00cc66'; // Green for mainnet
      case 5:
      case 11155111:
        return '#ff6b35'; // Orange for testnets
      case 137:
        return '#8247e5'; // Purple for Polygon
      default:
        return '#b0b0b0'; // Gray for unknown
    }
  };

  if (!chainId || !account) return null;

  return (
    <div className="network-info">
      <div className="network-badge" style={{ backgroundColor: getNetworkColor(chainId) }}>
        {getNetworkName(chainId)}
      </div>
      <div className="account-short">
        {account.slice(0, 6)}...{account.slice(-4)}
      </div>
    </div>
  );
}; 