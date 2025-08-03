import { ethers } from 'ethers';
import HashedTimeLockABI from '../../../shared/blockchain/interfaces/evm/hashedTimeLock.evm.abi.json';
import deploymentAddresses from '../../../shared/blockchain/deployment-addresses.json';

// ⚠️ тут указываем RPC для сети, где деплоен контракт
const RPC_URL = process.env.ETH_RPC_URL || 'http://127.0.0.1:8545';

const hashedTimeLockEvmAddress = deploymentAddresses.evm.localhost.HashedTimeLock;

// создаём provider + signer (резолвер будет подписывать транзакции)
const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(process.env.RESOLVER_PRIVATE_KEY!, provider);

function getContract() {
  return new ethers.Contract(hashedTimeLockEvmAddress, HashedTimeLockABI.abi, signer);
}

/** 🔒 Lock liquidity on Ethereum */
export async function lockLiquidityETH(receiver: string, hashlock: string, timelock: number | bigint, amount: string) {
  const contract = getContract();
  const amountInWei = ethers.parseEther(amount);

  console.log("🔧 [ETH] Lock liquidity:", { receiver, hashlock, timelock, amount });

  const tx = await contract.newContractETH(receiver, hashlock, timelock, { value: amountInWei });
  console.log("⏳ Tx sent:", tx.hash);

  return await tx.wait();
}

/** ✅ Claim locked liquidity */
export async function claimLiquidityETH(lockId: string, preimage: string) {
  const contract = getContract();

  console.log("✅ [ETH] Claim:", { lockId, preimage });

  const tx = await contract.claim(lockId, preimage);
  console.log("⏳ Claim tx sent:", tx.hash);

  return await tx.wait();
}

/** 🔄 Refund locked liquidity */
export async function refundLiquidityETH(lockId: string) {
  const contract = getContract();

  console.log("🔄 [ETH] Refund:", { lockId });

  const tx = await contract.refund(lockId);
  console.log("⏳ Refund tx sent:", tx.hash);

  return await tx.wait();
}
