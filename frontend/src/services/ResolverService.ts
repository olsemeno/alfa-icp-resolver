import { ICPLiquidityService } from './liquidity/ICPLiquidityService';
import { EVMLiquidityService } from './liquidity/EVMLiquidityService';
import resolverAddresses from '../blockchain/resolver-addresses.json';
import resolverConfig from '../blockchain/resolver-config.json';
import { ExchangeRate } from '../types';
import { evmHashlockToIcp, generateTimelockEVM, generateTimelockICP, icpHashlockToEvm } from '../utils/hashlock';
import { getIdentity } from '../utils/icp';
import { decodeEvmError } from '../utils/ethereum';
import HashedTimeLockABI from '../blockchain/interfaces/evm/hashedTimeLock.evm.abi.json';

const resolverIcpAddress = resolverAddresses.icp.dev;
const resolverEvmAddress = resolverAddresses.evm.localhost;
const RESOLVER_IDENTITY_ICP = resolverConfig.icp.identity.dev;
const RESOLVER_PRIVATE_KEY_EVM = resolverConfig.evm.privateKey.localhost;

const TIME_LOCK_DURATION_SECONDS = 3600;

export class ResolverService {
  private rates: ExchangeRate;

  constructor(rates: ExchangeRate) {
    this.rates = rates;
    console.log('🔄 [Resolver] Rates:', this.rates);
  }

  /**
   * 📥 Когда юзер залочил ликвидность в ICP,
   * вызываем этот метод, чтобы резолвер залочил ликвидность в EVM.
   */
  async resolveICPtoEVM(params: {
    receiver: string;     // кому отправляем ETH на другой стороне
    hashlock: string;
    amountICP: string;
  }) {
    console.log('🔄 [Resolver] Resolving ICP → EVM liquidity...');

    const amount = this.rates.from === 'ICP' ? params.amountICP : (Number(params.amountICP) * this.rates.rate).toFixed(8);

    const hashlockEvm = icpHashlockToEvm(params.hashlock);
    const timelock = await generateTimelockEVM(TIME_LOCK_DURATION_SECONDS);

    try {
      const response = await EVMLiquidityService.lockLiquidityETHResolver(
        params.receiver,
        hashlockEvm,
        timelock,
        amount,
        RESOLVER_PRIVATE_KEY_EVM
      );

      console.log('✅ [Resolver] EVM Time Lock transaction sent successfully:', response);

      return response;
    } catch (error) {
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
  }

  /**
   * 📥 Когда юзер залочил ликвидность в EVM,
   * вызываем этот метод, чтобы резолвер залочил ликвидность в ICP.
   */
  async resolveEVMtoICP(params: {
    receiver: string;     // кому отправляем ICP на другой стороне
    hashlock: string;
    amountEvm: string;
  }) {
    console.log('🔄 [Resolver] Resolving EVM → ICP liquidity...');

    const resolverIdentity = getIdentity(RESOLVER_IDENTITY_ICP);
    const principalId = resolverIdentity.getPrincipal();

    console.log('🔄 !!!! [Resolver] Resolver principalId:', principalId.toString());

    const amount = this.rates.from === 'ETH' ? params.amountEvm : (Number(params.amountEvm) * this.rates.rate).toFixed(8);

    const hashlockIcp = evmHashlockToIcp(params.hashlock);
    const timelock = await generateTimelockICP(TIME_LOCK_DURATION_SECONDS);

    console.log('🔄 [Resolver] Amount:', amount);

    console.log('🔄 [Resolver] Resolver identity principalId:', principalId.toString());

    const response = await ICPLiquidityService.lockLiquidityICP(
      resolverIdentity,
      params.receiver,
      hashlockIcp,
      timelock,
      amount
    );

    console.log('✅ [Resolver] ICP Time Lock transaction sent successfully:', response);

    return response;
  }
}
