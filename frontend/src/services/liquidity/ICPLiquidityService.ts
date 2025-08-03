import { ICRC1Service } from '../icrc1Service';
import { HashedTimeLockService } from '../HashedTimeLockICPService';
import { toE8s } from '../../utils/icp';
import deploymentAddresses from '../../blockchain/deployment-addresses.json';

const hashedTimeLockIcpCanisterId = deploymentAddresses.icp.dev.HashedTimeLock;

/**
 * 🔒 Locks liquidity on ICP via HashedTimeLock canister
 */
export async function lockLiquidityICP(
  identity: any,
  receiver: string,
  hashlock: string,
  timelock: number | bigint,
  amount: string
) {
  try {
    console.log('🔒 [ICP] Locking liquidity...');
    const icrc1Service = new ICRC1Service();
    const hashedTimeLockService = new HashedTimeLockService();

    // 1️⃣ Перевод ICP на контракт (HashedTimeLock)
    const txHash = await icrc1Service.transfer(identity, hashedTimeLockIcpCanisterId, amount);
    console.log('✅ [ICP] Ledger transfer complete. TxHash:', txHash);

    // 2️⃣ Создание контракта в HashedTimeLock канистре
    const timeLockResponse = await hashedTimeLockService.new_contract(
      identity,
      receiver,
      hashlock,
      timelock,
      amount
    );

    console.log('✅ [ICP] TimeLock contract created:', timeLockResponse);

    return {
      txHash,
      timeLockResponse
    };
  } catch (error) {
    console.error('❌ [ICP] Lock liquidity failed:', error);
    throw error;
  }
}

/**
 * ✅ Claims locked liquidity by providing preimage (secret)
 */
export async function claimLiquidityICP(
  identity: any,
  lockId: string,
  preimage: string
) {
  try {
    console.log('🔓 [ICP] Claiming liquidity...');
    const hashedTimeLockService = new HashedTimeLockService();

    // 📥 Вызываем метод claim на ICP канистре
    const response = await hashedTimeLockService.claim(identity, lockId, preimage);

    console.log('✅ [ICP] Liquidity claimed:', response);

    return response;
  } catch (error) {
    console.error('❌ [ICP] Claim liquidity failed:', error);
    throw error;
  }
}

/**
 * 🔄 Refunds locked liquidity after timelock expiration
 */
export async function refundLiquidityICP(identity: any, lockId: string) {
  try {
    console.log('↩️ [ICP] Refunding liquidity...');
    const hashedTimeLockService = new HashedTimeLockService();

    // 📥 Вызываем метод refund на ICP канистре
    const response = await hashedTimeLockService.refund(identity, lockId);

    console.log('✅ [ICP] Liquidity refunded:', response);

    return response;
  } catch (error) {
    console.error('❌ [ICP] Refund liquidity failed:', error);
    throw error;
  }
}
