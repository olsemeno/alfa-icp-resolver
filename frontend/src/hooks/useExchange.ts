import { useState, useCallback } from 'react';
import { Currency, ExchangeForm, ExchangeRate } from '../types';
import { ethers } from 'ethers';
import { ICRC1Service } from '../services/icrc1Service';

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
    // Для ETH транзакций всегда используем ETH адрес
    const ethAddress = '0xB1107F4141fb56b07D15b65F1629451443Ff8F8e';
    console.log('Using ETH recipient address:', ethAddress);
    return ethAddress;
  }, []);

  // Функция для отправки ETH транзакции через MetaMask
  const sendEthTransaction = useCallback(async (amount: string, recipientAddress: string, walletState: any) => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const ethereum = window.ethereum;
      
      // Проверяем и форматируем адрес
      console.log('Recipient address before validation:', recipientAddress);
      console.log('Address type:', typeof recipientAddress);
      console.log('Address length:', recipientAddress.length);
      
      if (!ethers.isAddress(recipientAddress)) {
        throw new Error(`Invalid recipient address: ${recipientAddress}`);
      }
      
      // Приводим адрес к checksum формату
      const checksumAddress = ethers.getAddress(recipientAddress);
      console.log('Checksum address:', checksumAddress);
      
      // Конвертируем сумму в wei
      const amountInWei = ethers.parseEther(amount);
      
      // Создаем объект транзакции
      const transactionParameters = {
        to: checksumAddress,
        value: amountInWei.toString(),
        from: walletState.eth.address,
      };

      console.log('Sending transaction with parameters:', transactionParameters);

      // Отправляем транзакцию через MetaMask
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      console.log('Transaction sent successfully:', txHash);
      return txHash;

    } catch (error: any) {
      console.error('Error sending ETH transaction:', error);
      throw new Error(error.message || 'Failed to send transaction');
    }
  }, []);

  // Функция для отправки ICP транзакции
  const sendIcpTransaction = useCallback(async (amount: string, walletState: any) => {
    try {
      console.log('Wallet state for ICP transaction:', walletState);
      console.log('ICP identity available:', !!walletState.icp.identity);
      
      if (!walletState.icp.identity) {
        throw new Error('ICP identity not connected');
      }

      // Используем тестовый principal для демонстрации
      const testRecipientPrincipal = 'xc6sh-dlnkq-hqmkc-eblci-3p6z6-blkwe-zpgo2-vpfn7-qo4v2-k4zyl-rae';
      
      const icrc1Service = new ICRC1Service();
      const txHash = await icrc1Service.transfer(
        walletState.icp.identity,
        testRecipientPrincipal,
        amount
      );

      return txHash;
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
      const recipientAddress = '0xB1107F4141fb56b07D15b65F1629451443Ff8F8e';
      console.log('Sending ETH transaction to:', recipientAddress);
      const txHash = await sendEthTransaction(form.amount, recipientAddress, walletState);
      alert(`Transaction sent successfully!\nTransaction Hash: ${txHash}`);
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
      const txHash = await sendIcpTransaction(form.amount, walletState);
      alert(`ICP Transaction sent successfully!\nBlock index: ${txHash}`);
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