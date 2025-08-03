import { useState, useCallback } from 'react';
import { Currency, ExchangeForm, ExchangeRate } from '../types';
import { ethers } from 'ethers';
import { HttpAgent, Actor } from "@dfinity/agent";
import { Ed25519KeyIdentity } from "@dfinity/identity";

import { HashedTimeLockService } from '../services/HashedTimeLockService';
import { ICRC1Service } from '../services/icrc1Service';
import { isEthereumAvailable, decodeEvmError } from '../utils/ethereum';
import { generateSecretAndHashlockEVM, generateSecretAndHashlockICP, generateTimelockEVM, generateTimelockICP } from '../utils/hashlock';

import { idlFactory as hashTimeLockIdlFactory } from "../blockchain/interfaces/icp/hashedTimeLock.did.js";
import type { _SERVICE as _HashedTimeLockService } from "../blockchain/interfaces/icp/hashedTimeLock.did";
import resolverAddresses from '../blockchain/resolver-addresses.json';
import HashedTimeLockABI from "../blockchain/interfaces/evm/hashedTimeLock.evm.abi.json";
import deploymentAddresses from "../blockchain/deployment-addresses.json";

const hashedTimeLockEvmAddress = deploymentAddresses.evm.localhost.HashedTimeLock;
const hashedTimeLockIcpCanisterId = deploymentAddresses.icp.dev.HashedTimeLock;
const ledgerIcpCanisterId = deploymentAddresses.icp.dev.Ledger;

const resolverEvmAddress = resolverAddresses.evm.localhost;
const resolverIcpAddress = resolverAddresses.icp.dev;

const TIME_LOCK_DURATION_SECONDS = 3600;
const ICP_HOST = "https://ic0.app";

// Моковые данные для курсов обмена
const mockExchangeRates: ExchangeRate[] = [
  { from: 'ETH', to: 'ICP', rate: 0.00015, fee: 0.001 },
  { from: 'ICP', to: 'ETH', rate: 6666.67, fee: 0.001 },
];

export const useExchange = () => {
  const [form, setForm] = useState<ExchangeForm>({
    fromCurrency: 'ETH',
    toCurrency: 'ICP',
    amount: '',
    recipientAddress: '',
    expectedAmount: '',
  });

  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const calculateExpectedAmount = useCallback((amount: string, from: Currency, to: Currency) => {
    if (!amount || parseFloat(amount) <= 0) return '';
    
    const rate = mockExchangeRates.find(r => r.from === from && r.to === to);
    if (!rate) return '';
    
    const amountNum = parseFloat(amount);
    const fee = amountNum * rate.fee;
    const netAmount = amountNum - fee;
    const expected = netAmount * rate.rate;
    
    return expected.toFixed(6);
  }, []);

  const handleAmountChange = useCallback((amount: string) => {
    const expectedAmount = calculateExpectedAmount(amount, form.fromCurrency, form.toCurrency);
    setForm(prev => ({
      ...prev,
      amount,
      expectedAmount,
    }));
  }, [form.fromCurrency, form.toCurrency, calculateExpectedAmount]);

  const handleCurrencyChange = useCallback((fromCurrency: Currency, toCurrency: Currency) => {
    const expectedAmount = calculateExpectedAmount(form.amount, fromCurrency, toCurrency);
    
    setForm(prev => ({
      ...prev,
      fromCurrency,
      toCurrency,
      expectedAmount,
    }));
  }, [form.amount, calculateExpectedAmount]);

  // Автоматически получаем адрес целевого кошелька
  const getTargetWalletAddress = useCallback((toCurrency: Currency, walletState: any) => {
    console.log('Using ETH recipient address:', hashedTimeLockEvmAddress);

    return hashedTimeLockEvmAddress;
  }, []);

  // Функция для отправки ETH транзакции через MetaMask
  const sendEthTransaction = useCallback(async (
    amount: string,
    recipientAddress: string,
    hashlock: string,
    timelock: number | bigint,
    walletState: any
  ) => {
    try {
      if (!isEthereumAvailable()) {
        throw new Error('MetaMask is not installed');
      }
      
      // Проверяем и форматируем адрес
      console.log('Recipient address before validation:', recipientAddress);
      console.log('Address type:', typeof recipientAddress);
      console.log('Address length:', recipientAddress.length);
      
      if (!ethers.isAddress(recipientAddress)) {
        throw new Error(`Invalid recipient address: ${recipientAddress}`);
      }

      const receipt = await createEvmTimeLock(
        recipientAddress,
        hashlock,
        timelock,
        amount,
        walletState
      );

      console.log('Evm Time Lock transaction sent successfully:', receipt);

      return receipt;
    } catch (error: any) {
      console.error('Error sending ETH transaction:', error);
      throw new Error(error.message || 'Failed to send transaction');
    }
  }, []);

  // Функция для отправки ICP транзакции
  const sendIcpTransaction = useCallback(async (
    amount: string,
    recipientAddress: string,
    hashlock: string,
    timelock: number | bigint,
    walletState: any
  ) => {
    try {
      console.log('==== ICP identity:', walletState.icp.identity.getPrincipal().toText());

      console.log('Wallet state for ICP transaction:', walletState);
      console.log('ICP identity available:', !!walletState.icp.identity);

      if (!walletState.icp.identity) {
        throw new Error('ICP identity not connected');
      }

      const icrc1Service = new ICRC1Service();
      const txHashTransfer = await icrc1Service.transfer(
        walletState.icp.identity,
        hashedTimeLockIcpCanisterId,
        amount
      );

      console.log('✅ ICP ledger transfer sent. TxHash:', txHashTransfer);
  
      const timeLockResponse = await createIcpTimeLock(
        recipientAddress,
        hashlock,
        timelock,
        amount,
        walletState
      );
  
      console.log('✅ ICP Time Lock created:', timeLockResponse);
  
      return {
        txHashTransfer,
        timeLockResponse,
      };
    } catch (error: any) {
      console.error('Error sending ICP transaction:', error);
      throw new Error(error.message || 'Failed to send ICP transaction');
    }
  }, []);

  const handleExchange = useCallback(async (walletState: any) => {
    if (!form.amount) {
      alert('Please enter amount to exchange');
      return;
    }
    
    if (form.fromCurrency === 'ICP') {
      // Для ICP показываем модальное окно подтверждения
      setShowConfirmModal(true);
      return;
    }

    // Для ETH сразу отправляем транзакцию
    setIsTransferring(true);
    setTransferError(null);

    try {
      // 1️⃣ Генерация секрета
      const { secret, hashlock } = generateSecretAndHashlockEVM();
      console.log("🔐 Secret:", secret);
      console.log("🔒 Hashlock:", hashlock);

      // 2️⃣ Генерация timelock
      const timelock = await generateTimelockEVM(TIME_LOCK_DURATION_SECONDS);

      console.log('📤 Receiver address:', resolverEvmAddress);
      console.log('📋 Contract address:', hashedTimeLockEvmAddress);

      const receipt = await sendEthTransaction(
        form.amount,
        resolverEvmAddress,
        hashlock,
        timelock,
        walletState
      );

      const event = receipt.logs.find(
        (log: any) => log.fragment?.name === "TimeLockContractCreated"
      );

      const lockId = event?.args?.lockId;
      console.log("🔑 Lock ID:", lockId);

      // Save secret to local storage
      localStorage.setItem(`secret:${lockId}`, secret);

      alert(`Transaction sent successfully!\nTransaction Hash: ${receipt.hash}`);
    } catch (error: any) {
      console.error('Transfer error:', error);
      setTransferError(error.message || 'Transfer failed');
      alert(`Transfer failed: ${error.message}`);
    } finally {
      setIsTransferring(false);
    }
  }, [form, sendEthTransaction]);

  // Функция для подтверждения ICP транзакции
  const confirmIcpTransfer = useCallback(async (walletState: any) => {
    setIsTransferring(true);
    setShowConfirmModal(false);

    try {
      // 1️⃣ Генерация секрета
      const { secret, hashlock } = generateSecretAndHashlockICP();
      console.log("🔐 Secret:", secret);
      console.log("🔒 Hashlock:", hashlock);

      // 2️⃣ Генерация timelock
      const timelock = await generateTimelockICP(TIME_LOCK_DURATION_SECONDS);

      const { txHashTransfer, timeLockResponse } = await sendIcpTransaction(
        form.amount,
        resolverIcpAddress,
        hashlock,
        timelock,
        walletState
      );

      const lockId = timeLockResponse.lock_id.toString();
      console.log("🔑 Lock ID:", lockId);

      // Save secret to local storage
      localStorage.setItem(`secret:${lockId}`, secret);

      alert(
        `ICP Transaction sent successfully!\nBlock index: ${txHashTransfer}\n` +
        `Time Lock success: ${timeLockResponse.success}\n` +
        `Time Lock message: ${timeLockResponse.message}\n` +
        `Time Lock lock_id: ${timeLockResponse.lock_id}`
      );

    } catch (error: any) {
      console.error('ICP Transfer error:', error);

      setTransferError(error.message || 'ICP Transfer failed');

      alert(`ICP Transfer failed: ${error.message}`);
    } finally {
      setIsTransferring(false);
    }
  }, [form.amount, sendIcpTransaction]);

  const closeConfirmModal = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  return {
    form,
    handleAmountChange,
    handleCurrencyChange,
    handleExchange,
    getTargetWalletAddress,
    isTransferring,
    transferError,
    showConfirmModal,
    confirmIcpTransfer,
    closeConfirmModal,
  };
};

const getEvmHashedTimeLockContract = async (walletState: any) => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner(walletState.eth.address);

  return new ethers.Contract(hashedTimeLockEvmAddress, HashedTimeLockABI.abi, signer);
}

const createEvmTimeLock = async (
  receiver: string,
  hashlock: string,
  timelock: number | bigint,
  amount: string,
  walletState: any
) => {
  try {
    console.log("🔧 Creating Evm Time Lock with parameters:");
    console.log("  - Receiver:", receiver);
    console.log("  - Hashlock:", hashlock);
    console.log("  - Timelock:", timelock);
    console.log("  - Amount:", amount);
    console.log("  - Wallet address:", walletState.eth.address);

    const contract = await getEvmHashedTimeLockContract(walletState);
    const amountInWei = ethers.parseEther(amount);

    console.log("  - Amount in Wei:", amountInWei.toString());

    const tx = await contract.newContractETH(
      receiver,
      hashlock,
      timelock,
      { value: amountInWei } // важный момент — value указывает сколько ETH прикрепляем
    );

    console.log("⏳ Evm Time Lock transaction sent:", tx.hash);

    const receipt = await tx.wait();

    console.log("✅ Evm Time Lock transaction confirmed:", receipt);

    return receipt;
  } catch (error: any) {
    const decoded = decodeEvmError(HashedTimeLockABI.abi, error);

    if (decoded) {
      console.error(`❌ Custom error: ${decoded.name}`);
      if (decoded.args.length) {
        console.error("📊 Args:", decoded.args.map(a => a.toString()));
      }
    } else {
      console.error("❌ Unknown EVM error:", error);
    }

    throw error;
  }
};

const createIcpTimeLock = async (
  receiver: string,
  hashlock: string,
  timelock: number | bigint,
  amount: string,
  walletState: any
) => {
  try {
    console.log("🔧 Creating ICP Time Lock...");
    console.log("Receiver:", receiver);
    console.log("Hashlock:", hashlock);
    console.log("Timelock:", timelock);
    console.log("Amount:", amount);

    if (!walletState.icp.identity) {
      throw new Error("ICP identity is not connected");
    }

    const hashedTimeLockService = new HashedTimeLockService();
    const response = await hashedTimeLockService.new_contract(
      walletState.icp.identity,
      receiver,
      hashlock,
      timelock,
      amount,
    )

    console.log('✅ ICP Time Lock success:', response.success);

    return response;
  } catch (error) {
    console.error("❌ Error creating ICP Time Lock:", error);
    throw error;
  }
};
