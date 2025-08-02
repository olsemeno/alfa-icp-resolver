import dotenv from 'dotenv'
import { ethers } from 'ethers'
import { randomBytes } from 'crypto'
import {
  SDK,
  NetworkEnum,
  HashLock,
  BlockchainProviderConnector,
  SupportedChain,
  Quote,
} from '@1inch/cross-chain-sdk'

import { fusionSDKMock } from './mocks/fusionSDKMock'
import { fusionWebSocketMock } from './mocks/fusionWebSocketMock'

dotenv.config()

// ====== ENV VARS ======
const FUSION_API_KEY = process.env.FUSION_API_KEY
const MAKER_PRIVATE_KEY = process.env.MAKER_PRIVATE_KEY
const MAKER_ADDRESS = process.env.MAKER_ADDRESS || ''
const ETH_NODE_URL = process.env.ETH_NODE_URL || 'https://ethereum-rpc.publicnode.com'
const USE_MOCK = process.env.USE_MOCK === 'true'

const FROM_TOKEN_ADDRESS = '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619' // WETH (Polygon)
const TO_TOKEN_ADDRESS = '0xaf88d065e77c8C2239327C5EDb3A432268e5831'    // USDC (Arbitrum)
const AMOUNT = '100000000000000' // 0.0000001 WETH

// ====== CUSTOM ETHERS PROVIDER ======
class EthersBlockchainProvider implements BlockchainProviderConnector {
  private wallet: ethers.Wallet
  private provider: ethers.JsonRpcProvider

  constructor(privateKey: string, rpcUrl: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl)
    this.wallet = new ethers.Wallet(privateKey, this.provider)
  }

  async signTypedData(walletAddress: string, typedData: any): Promise<string> {
    if (walletAddress.toLowerCase() !== this.wallet.address.toLowerCase()) {
      throw new Error('Wallet address does not match signer')
    }

    return await this.wallet.signTypedData(
      typedData.domain,
      typedData.types,
      typedData.message
    )
  }

  async ethCall(contractAddress: string, callData: string): Promise<string> {
    return await this.provider.call({ to: contractAddress, data: callData })
  }
} 

// ====== VALIDATION ======
if (!FUSION_API_KEY || !MAKER_PRIVATE_KEY || !MAKER_ADDRESS) {
  throw new Error('❌ Missing env vars: FUSION_API_KEY, MAKER_PRIVATE_KEY, MAKER_ADDRESS')
}

// ====== INIT SDK ======
const blockchainProvider = new EthersBlockchainProvider(MAKER_PRIVATE_KEY, ETH_NODE_URL)

const fusionSDK = USE_MOCK
  ? fusionSDKMock
  : new SDK({
      url: 'https://api.1inch.dev/fusion-plus',
      authKey: FUSION_API_KEY,
      blockchainProvider,
    })

// ====== GET QUOTE ======
export async function getFusionQuote() {
  console.log(`🧪 Using ${USE_MOCK ? 'MOCK' : 'REAL'} quote mode`)

  try {
    const quote = fusionSDK.getQuote({
      srcChainId: NetworkEnum.ETHEREUM,
      dstChainId: icpNetwork(),
      srcTokenAddress: 'ICP_Token',
      dstTokenAddress: 'ETH_Token',
      amount: '1000000',
      walletAddress: MAKER_ADDRESS,
    })

    console.log('✅ Fusion+ Quote:')
    console.log(quote)
    return quote
  } catch (err: any) {
    console.error('❌ Error fetching quote:', err.response?.data || err.message)
  }
}

// ====== CREATE ORDER ======
export async function createFusionOrder() {
  console.log(`🚀 Creating order (${USE_MOCK ? 'MOCK' : 'REAL'})...`)

  try {
    const quote = await getFusionQuote()

    // ===== MOCK MODE =====
    if (USE_MOCK) {
      const order = fusionSDKMock.createOrder(quote, { walletAddress: MAKER_ADDRESS })

      return { order, secrets: order.secrets, secretHashes: order.secretHashes }
    }

    // ===== REAL MODE =====
    const secretsCount = quote?.getPreset().secretsCount || 1
    const secrets = Array.from({ length: secretsCount }).map(
      () => '0x' + randomBytes(32).toString('hex')
    )

    const secretHashes = secrets.map((s) => HashLock.hashSecret(s))

    const hashLock =
      secretsCount === 1
        ? HashLock.forSingleFill(secrets[0])
        : HashLock.forMultipleFills(HashLock.getMerkleLeaves(secrets))

    console.log(`🔐 Generated ${secretsCount} secret(s)`)

    const order = await fusionSDK.createOrder(
      quote as Quote<SupportedChain, SupportedChain>,
      {
        walletAddress: MAKER_ADDRESS,
        hashLock,
        secretHashes,
        fee: {
          takingFeeBps: 100, // 1%
          takingFeeReceiver: MAKER_ADDRESS,
        },
      }
    )

    console.log('✅ Fusion+ Order created:')
    console.log(order)

    return { order, secrets, secretHashes }
  } catch (err: any) {
    console.error('❌ Error creating order:', err.response?.data || err.message)
  }
}

export async function swap() {
  const { order, secrets, secretHashes } = await createFusionOrder();

    // TODO: call createContract() on HashedTimelockContract
    // HashedTimelockContract.createContract(order.orderHash, order.secrets, order.secretHashes);
}

function icpNetwork(): SupportedChain {
  if (USE_MOCK) return 999 as unknown as SupportedChain
  if ('ICP' in NetworkEnum) return NetworkEnum.ICP as SupportedChain
  throw new Error('ICP network not found in NetworkEnum')
}

// ====== RUN TEST ======
if (require.main === module) {
  ;(async () => {
    await createFusionOrder()
  })()
}
