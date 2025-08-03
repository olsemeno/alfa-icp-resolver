import { ethers } from 'ethers';
import HashedTimeLockABI from '../../blockchain/interfaces/evm/hashedTimeLock.evm.abi.json';
import deploymentAddresses from '../../blockchain/deployment-addresses.json';
import resolverAddresses from '../../blockchain/resolver-addresses.json';

// ⚠️ тут указываем RPC для сети, где деплоен контракт
const RPC_URL = process.env.ETH_RPC_URL || 'http://127.0.0.1:8545';

const hashedTimeLockEvmAddress = deploymentAddresses.evm.localhost.HashedTimeLock;
const resolverEvmAddress = resolverAddresses.evm.localhost;

async function getContract(walletState: any) {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner(walletState.eth.address);
  return new ethers.Contract(hashedTimeLockEvmAddress, HashedTimeLockABI.abi, signer);
}

/** 🔒 Lock liquidity on Ethereum */
export async function lockLiquidityETH(receiver: string, hashlock: string, timelock: number | bigint, amount: string, walletState: any) {
  const contract = await getContract(walletState);
  const amountInWei = ethers.parseEther(amount);

  console.log("🔧 [ETH] Lock liquidity:", { receiver, hashlock, timelock, amount });

  const tx = await contract.newContractETH(receiver, hashlock, timelock, { value: amountInWei });
  console.log("⏳ Tx sent:", tx.hash);

  return await tx.wait();
}

/** ✅ Claim locked liquidity */
export async function claimLiquidityETH(lockId: string, preimage: string, walletState: any) {
  const contract = await getContract(walletState);

  console.log("✅ [ETH] Claim:", { lockId, preimage });

  const tx = await contract.claim(lockId, preimage);
  console.log("⏳ Claim tx sent:", tx.hash);

  return await tx.wait();
}

/** 🔄 Refund locked liquidity */
export async function refundLiquidityETH(lockId: string, walletState: any) {
  const contract = await getContract(walletState);

  console.log("🔄 [ETH] Refund:", { lockId });

  const tx = await contract.refund(lockId);
  console.log("⏳ Refund tx sent:", tx.hash);

  return await tx.wait();
}
