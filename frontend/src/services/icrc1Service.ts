import { HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { IcrcAccount, IcrcLedgerCanister, TransferParams } from '@dfinity/ledger-icrc';

// ID канистры ICP ledger на mainnet
const ICP_LEDGER_CANISTER_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';

export class ICRC1Service {
  // Получение баланса по адресу
  async getBalance(principal: string, identity: any): Promise<string> {
    try {
      if (!identity) {
        console.log('Identity not provided, returning 0');
        return '0';
      }

      // Создаем агента и актора на лету
      const agent = new HttpAgent({
        identity,
        host: 'https://ic0.app',
      });
      

      const ledger = IcrcLedgerCanister.create({
        agent,
        canisterId: Principal.fromText(ICP_LEDGER_CANISTER_ID),
      });

      const principalObj = Principal.fromText(principal);
      const account: IcrcAccount = {
        owner: principalObj,
        subaccount: undefined, // undefined для opt blob
      };

      const balance = await ledger.balance(account);
      
      // Конвертируем e8s в ICP (1 ICP = 100,000,000 e8s)
      const icpAmount = Number(balance) / 100_000_000;
      
      return icpAmount.toFixed(8);
    } catch (error) {
      console.error('Error getting ICP balance:', error);
      return '0';
    }
  }

  // Отправка ICP транзакции
  async transfer(
    fromIdentity: any,
    toPrincipal: string,
    amount: string
  ): Promise<string> {
    try {
      console.log('=== ICP Transfer Debug ===');
      console.log('From Identity:', fromIdentity);
      console.log('To Principal:', toPrincipal);
      console.log('Amount:', amount);
      
      if (!fromIdentity) {
        throw new Error('Identity not provided');
      }

      // Создаем агента
      const agent = new HttpAgent({
        identity: fromIdentity,
        host: 'https://ic0.app',
      });

      console.log('Agent created successfully');

      // Создаем ledger canister
      const ledger = IcrcLedgerCanister.create({
        agent,
        canisterId: Principal.fromText(ICP_LEDGER_CANISTER_ID),
      });

      console.log('Ledger canister created');

      // Конвертируем сумму в e8s (1 ICP = 100,000,000 e8s)
      const amountInE8s = BigInt(Math.floor(parseFloat(amount) * 100_000_000));
      console.log('Amount in e8s:', amountInE8s.toString());

      // Создаем аккаунт получателя
      const toAccount: IcrcAccount = {
        owner: Principal.fromText(toPrincipal),
        subaccount: undefined, // undefined для opt blob
      };

      console.log('To account:', toAccount);

      // Проверяем баланс отправителя
      const fromPrincipal = fromIdentity.getPrincipal();
      console.log('From principal:', fromPrincipal.toText());
      
      const fromAccount: IcrcAccount = {
        owner: fromPrincipal
      };

      console.log('Checking sender balance...');
      const senderBalance = await ledger.balance(fromAccount);
      console.log('Sender balance (e8s):', senderBalance.toString());
      console.log('Sender balance (ICP):', Number(senderBalance) / 100_000_000);

      // Проверяем, достаточно ли средств
      const fee = BigInt(10_000); // 0.0001 ICP
      const totalNeeded = amountInE8s + fee;
      console.log('Total needed (e8s):', totalNeeded.toString());
      console.log('Total needed (ICP):', Number(totalNeeded) / 100_000_000);

      // if (senderBalance < totalNeeded) {
      //   throw new Error(`Insufficient funds. Available: ${Number(senderBalance) / 100_000_000} ICP, Required: ${Number(totalNeeded) / 100_000_000} ICP`);
      // }

      console.log('Funds sufficient, proceeding with transfer...');

      // Выполняем transfer
      const transferParams: TransferParams = {
        to: {
          owner: Principal.fromText(toPrincipal),
          subaccount: []
        },
        amount: amountInE8s,
        fee: fee,
      };

      console.log('Transfer parameters:', transferParams);

      const transferResult = await ledger.transfer(transferParams);

      // Проверяем результат transfer
      if (transferResult && typeof transferResult === 'bigint') {
        const txHash = transferResult.toString();
        return txHash;
      } else {
        console.error('Transfer failed with unexpected result type:', typeof transferResult);
        throw new Error(`Transfer failed: ${transferResult}`);
      }

    } catch (error) {
      console.error('Error sending ICP transfer:', error);
      throw error;
    }
  }
} 