// createOrderWithFakeQuote.ts
import { SDK, HashLock, PresetEnum, Quote, QuoterRequest, EvmChain, Address, NetworkEnum } from "@1inch/cross-chain-sdk";
import { randomBytes } from "crypto";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const FUSION_API_KEY = process.env.FUSION_API_KEY || "";
const MAKER_PRIVATE_KEY = process.env.MAKER_PRIVATE_KEY || "";
const MAKER_ADDRESS = process.env.MAKER_ADDRESS || "";

// ===== INIT SDK =====
const sdk = new SDK({
  url: "https://api.1inch.dev/fusion-plus",
  authKey: FUSION_API_KEY,
  blockchainProvider: {
    signTypedData: async () => {
      throw new Error("signTypedData not implemented in fake mode");
    },
    ethCall: async () => {
      throw new Error("ethCall not implemented in fake mode");
    },
  },
});

// ===== FAKE QUOTE CREATION =====
function createFakeQuote(): Quote<any, any> {
  const presets = {
    [PresetEnum.fast]: {
      secretsCount: 1,
    },
    [PresetEnum.medium]: {
      secretsCount: 2,
    },
    [PresetEnum.slow]: {
      secretsCount: 3,
    },
  };

  return {
    // quoteId: 'c8e2d9b5-9edf-4c72-968e-de4b88ca0a6e',
    // srcChainId: 1, // ETH mainnet (можно поставить 999 для ICP)
    // dstChainId: 999, // ICP “фиктивная сеть”
    // srcTokenAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // ETH
    // dstTokenAddress: "ICP_Token",
    // amount: "1000000000000",
    // presets,
    // // обязательные поля, которые SDK ожидает
    // fromToken: { address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", decimals: 18 },
    // toToken: { address: "ICP_Token", decimals: 8 },
    // recommendedPreset: PresetEnum.fast,

      quoteId: '0efb3c19-2462-4bca-a112-5dd7653c83df',
      srcTokenAmount: '100000000000000',
      dstTokenAmount: '293248',
      presets: {
        fast: {
          auctionDuration: 180,
          startAuctionIn: 17,
          initialRateBump: 679019,
          auctionStartAmount: '293248',
          startAmount: '293248',
          auctionEndAmount: '274602',
          exclusiveResolver: null,
          costInDstToken: '45760',
          points: [],
          allowPartialFills: false,
          allowMultipleFills: false,
          gasCost: [Object],
          secretsCount: 1
        },
        medium: {
          auctionDuration: 360,
          startAuctionIn: 17,
          initialRateBump: 2345430,
          auctionStartAmount: '339008',
          startAmount: '339008',
          auctionEndAmount: '274602',
          exclusiveResolver: null,
          costInDstToken: '45760',
          points: [Array],
          allowPartialFills: false,
          allowMultipleFills: false,
          gasCost: [Object],
          secretsCount: 1
        },
        slow: {
          auctionDuration: 600,
          startAuctionIn: 17,
          initialRateBump: 2345430,
          auctionStartAmount: '339008',
          startAmount: '339008',
          auctionEndAmount: '274602',
          exclusiveResolver: null,
          costInDstToken: '45760',
          points: [Array],
          allowPartialFills: false,
          allowMultipleFills: false,
          gasCost: [Object],
          secretsCount: 1
        }
      },
      timeLocks: {
        srcWithdrawal: 180,
        srcPublicWithdrawal: 660,
        srcCancellation: 816,
        srcPublicCancellation: 936,
        dstWithdrawal: 60,
        dstPublicWithdrawal: 480,
        dstCancellation: 600
      },
      srcEscrowFactory: '0xa7bcb4eac8964306f9e3764f67db6a7af6ddf99a',
      dstEscrowFactory: '0xa7bcb4eac8964306f9e3764f67db6a7af6ddf99a',
      srcSafetyDeposit: '36855000036330000',
      dstSafetyDeposit: '7947431100000',
      whitelist: [
        '0x5e0c9131ccf3a015fec02078c33fd9d03fc36b23',
        '0x33b41fe18d3a39046ad672f8a0c8c415454f629c'
      ],
      recommendedPreset: 'fast',
      prices: {
        usd: { srcToken: '3619.376677770621', dstToken: '1.0003315465783826' }
      },
      volume: { usd: { srcToken: '0.36', dstToken: '0.34' } },
      priceImpactPercent: 6.304,
      autoK: 5.5,
      k: 5.5,
      mxK: 37,
    getPreset() {
      return presets[PresetEnum.fast];
    },
    isEvmQuote: () => true,
    createEvmOrder: () => {

    },
    isSolanaQuote: () => false,
  } as unknown as Quote<any, any>;
}



export async function getFusionQuote() {
  try {
    const requestParams = {
      srcChain: 137,
      dstChain: 1,
      srcTokenAddress: new Address("0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"), // USDC (Polygon)
      dstTokenAddress: new Address("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"), // USDC (Ethereum)
      amount: "1000000000000",
      walletAddress: MAKER_ADDRESS,
      enableEstimate: true,
      fee: 0,
    };
    // const quote = createFakeQuote();

    const response = await axios.get(
      "https://api.1inch.dev/fusion-plus/quoter/v1.0/quote/receive",
      {
        headers: {
          Authorization: `Bearer ${FUSION_API_KEY}`, // ключ обязателен
        },
        params: requestParams
      }
    );

    console.log("✅ Quote received:");
    console.dir(response.data, { depth: null });

    // const quote = Quote.fromEVMQuote(requestParams as unknown as QuoterRequest<EvmChain, EvmChain>, response.data);
    console.log("✅ Quote received:");
    // console.dir(quote, { depth: null });

    // quote.params.srcTokenAddress = new Address(quote.params.srcTokenAddress.val);
    // quote.params.dstTokenAddress = new Address(quote.params.dstTokenAddress.val);
    return response.data;

    // return quote;
  } catch (err: any) {
    console.error("❌ Error fetching quote:", err.response?.data || err.message);
  }
}

export async function getSDKQuote() {
  const quote = await sdk.getQuote({  
      amount: '1000000000000000000',  
      srcChainId: 137,  
      dstChainId: 1,  
      enableEstimate: true,  
      srcTokenAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // USDT  
      dstTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // BNB  
      walletAddress: MAKER_ADDRESS,
    })  

    console.log("✅ Quote received:");
    console.dir(quote, { depth: null });

    return quote;
}

// ===== CREATE ORDER =====
(async () => {
  const fakeQuote = await getSDKQuote() as Quote<EvmChain, EvmChain>;

  // генерим секреты
  const secrets = Array.from({ length: fakeQuote.presets[PresetEnum.fast].secretsCount }).map(
    () => "0x" + randomBytes(32).toString("hex")
  );

  const hashLock =
    secrets.length === 1
      ? HashLock.forSingleFill(secrets[0])
      : HashLock.forMultipleFills(HashLock.getMerkleLeaves(secrets));

  const secretHashes = secrets.map((s) => HashLock.hashSecret(s));

  try {
    const { hash, quoteId, order } = await sdk.createOrder(fakeQuote, {
      walletAddress: MAKER_ADDRESS,
      hashLock,
      preset: PresetEnum.fast,
      source: "custom-adapter",
      secretHashes,
    });

    console.log("✅ Order created!");
    console.log("hash:", hash);
    console.log("quoteId:", quoteId);
    console.log("order:", order);
  } catch (err: any) {
    console.error("❌ Error creating order:", err.message);
  }
})();
