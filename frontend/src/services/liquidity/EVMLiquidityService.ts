import { ethers } from 'ethers';
import HashedTimeLockABI from '../../blockchain/interfaces/evm/hashedTimeLock.evm.abi.json';
import deploymentAddresses from '../../blockchain/deployment-addresses.json';
import resolverAddresses from '../../blockchain/resolver-addresses.json';

// ⚠️ тут указываем RPC для сети, где деплоен контракт
const RPC_URL = process.env.ETH_RPC_URL || 'http://127.0.0.1:8545';

const hashedTimeLockEvmAddress = deploymentAddresses.evm.localhost.HashedTimeLock;
const resolverEvmAddress = resolverAddresses.evm.localhost;

async function getContract(signerAddress: any) {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner(signerAddress);
  return new ethers.Contract(hashedTimeLockEvmAddress, HashedTimeLockABI.abi, signer);
}

/** 🔒 Lock liquidity on Ethereum */
async function lockLiquidityETH(receiver: string, hashlock: string, timelock: number | bigint, amount: string, signerAddress: any) {
  const contract = await getContract(signerAddress);
  const amountInWei = ethers.parseEther(amount);

  console.log("🔧 [ETH] Lock liquidity:", { receiver, hashlock, timelock, amount });

  const tx = await contract.newContractETH(receiver, hashlock, timelock, { value: amountInWei });
  console.log("⏳ Tx sent:", tx.hash);

  return await tx.wait();
}

async function lockLiquidityETHResolver(receiver: string, hashlock: string, timelock: number | bigint, amount: string, resolverPrivateKey: string) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(resolverPrivateKey, provider);
  const contract = new ethers.Contract(hashedTimeLockEvmAddress, HashedTimeLockABI.abi, wallet);

  const amountInWei = ethers.parseEther(amount);

  console.log("🔧 [ETH] Lock liquidity:", { receiver, hashlock, timelock, amount });

  const tx = await contract.newContractETH(receiver, hashlock, timelock, { value: amountInWei });
  console.log("⏳ Tx sent:", tx.hash);

  return await tx.wait();
}

/** ✅ Claim locked liquidity */
async function claimLiquidityETH(lockId: string, preimage: string, signerAddress: any) {
  
  console.log("🔧 1.[ETH] Claim:", { lockId, preimage });
  
  const contract = await getContract(signerAddress);

  console.log("✅ 2. [ETH] Claim:", { lockId, preimage });

  const tx = await contract.claim(lockId, `0x${preimage}`);
  console.log("⏳ 3. Claim tx sent:", tx.hash);

  return await tx.wait();
}

/** 🔄 Refund locked liquidity */
async function refundLiquidityETH(lockId: string, signerAddress: any) {
  const contract = await getContract(signerAddress);

  console.log("🔄 [ETH] Refund:", { lockId });

  const tx = await contract.refund(lockId);
  console.log("⏳ Refund tx sent:", tx.hash);

  return await tx.wait();
}

export const EVMLiquidityService = {
  lockLiquidityETH,
  lockLiquidityETHResolver,
  claimLiquidityETH,
  refundLiquidityETH,
};