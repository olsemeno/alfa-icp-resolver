# 🐺⛓️🪙 Alfa ICP Resolver

Project for performing swaps between Ethereum and Internet Computer Protocol (ICP) using atomic swaps.

## 📚 [📖 Full Documentation](https://olsemeno.github.io/alfa-icp-resolver/)

**Complete documentation with guides, API references, and examples is available at:**  
**[https://olsemeno.github.io/alfa-icp-resolver/](https://olsemeno.github.io/alfa-icp-resolver/)**

## 🖥️ [🚀 Live Frontend](https://cfnge-fqaaa-aaaam-aenya-cai.icp0.io/)

**Try the application live on Internet Computer:**  
**[https://cfnge-fqaaa-aaaam-aenya-cai.icp0.io/](https://cfnge-fqaaa-aaaam-aenya-cai.icp0.io/)**

---

## 🚀 Quick Overview

Alfa ICP Resolver is a comprehensive cross-chain atomic swap solution that enables secure token exchanges between Ethereum and Internet Computer Protocol (ICP) without trusted intermediaries.

## 🏗️ Project Structure

The project consists of multiple components working together to provide a complete cross-chain solution:

### 🔗 Cross-Chain Resolver (`crosschain-resolver/`)
- TypeScript service for coordinating atomic swaps
- WebSocket server for real-time updates
- Integration with both Ethereum and ICP networks
- Comprehensive API for swap management

### ⛓️ Ethereum Contracts (`ethereum-contracts/`)
- Solidity smart contracts for Ethereum network
- Hashed Timelock Contracts (HTLC) for atomic swaps
- Liquidity Vault for liquidity management
- Comprehensive test suite and documentation

### 🪙 ICP Canisters (`icp-canisters/`)
- Rust canisters for Internet Computer
- Hash time lock implementation with ICRC-1 integration
- Transfer service for processing transactions
- Integration with ICP Ledger
- Complete test coverage

### 🖥️ Frontend (`frontend/`)
- React-based user interface
- MetaMask and Internet Identity integration
- Real-time swap status updates
- Responsive design for all devices

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Rust and Cargo
- DFX (Internet Computer SDK)
- Hardhat (Ethereum development)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/olsemeno/alfa-icp-resolver
   cd alfa-icp-resolver
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development environment:**
   ```bash
   # Start DFX (Internet Computer)
   dfx start --background --clean
   
   # Deploy all components
   npm run deploy:all
   ```

### Component Setup

1. **Ethereum contracts:**
   ```bash
   cd ethereum-contracts
   npm install
   npx hardhat compile
   npx hardhat test
   ```

2. **ICP canisters:**
   ```bash
   cd icp-canisters
   dfx start --background
   dfx deploy hashed-time-lock
   ```

3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Cross-chain resolver:**
   ```bash
   cd crosschain-resolver
   npm install
   npm run dev
   ```

## 🏛️ Architecture

The project implements atomic swaps between Ethereum and ICP, providing secure token exchange between blockchains without the need to trust a third party.

### 🔐 Security Features
- **Cryptographic Hash Locks**: SHA-256 based preimage verification
- **Time-based Expiration**: Automatic refund mechanisms
- **Cross-chain Validation**: Secure verification on both chains
- **No Trust Required**: True atomic swaps without intermediaries

### 🔄 Swap Process
1. **Initiation**: User creates swap on both chains
2. **Locking**: Funds locked with cryptographic hash
3. **Revelation**: Preimage revealed to claim funds
4. **Completion**: Atomic transfer on both chains

## 🧪 Testing

### Running Tests
```bash
# Ethereum contracts
cd ethereum-contracts
npm test

# ICP canisters
cd icp-canisters
npm test

# Frontend
cd frontend
npm test

# Cross-chain resolver
cd crosschain-resolver
npm test
```

## 📖 Documentation

- **[📚 Full Documentation](https://olsemeno.github.io/alfa-icp-resolver/)** - Complete guides and API references
- **[🔗 Ethereum Contracts](https://olsemeno.github.io/alfa-icp-resolver/ethereum.html)** - Smart contracts documentation
- **[🪙 ICP Canisters](https://olsemeno.github.io/alfa-icp-resolver/icp.html)** - Rust canisters guide
- **[🖥️ Frontend](https://olsemeno.github.io/alfa-icp-resolver/frontend.html)** - React interface documentation
- **[🔗 Resolver](https://olsemeno.github.io/alfa-icp-resolver/resolver.html)** - Cross-chain service docs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [https://olsemeno.github.io/alfa-icp-resolver/](https://olsemeno.github.io/alfa-icp-resolver/)
- **Issues**: [GitHub Issues](https://github.com/olsemeno/alfa-icp-resolver/issues)

## 🌟 Features

- ✅ **Cross-chain Atomic Swaps** - Secure token exchanges between Ethereum and ICP
- ✅ **No Trust Required** - True decentralized swaps without intermediaries
- ✅ **Real-time Updates** - WebSocket-based status monitoring
- ✅ **Comprehensive Testing** - Full test coverage for all components
- ✅ **Modern UI** - React-based responsive interface
- ✅ **Production Ready** - Deployed and tested on mainnet
- ✅ **Live Demo** - [Try it now on Internet Computer](https://cfnge-fqaaa-aaaam-aenya-cai.icp0.io/)
