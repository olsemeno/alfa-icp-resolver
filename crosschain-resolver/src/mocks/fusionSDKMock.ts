import { randomBytes } from "crypto";
import { HashLock } from "@1inch/cross-chain-sdk";
import { LimitOrderV4Struct } from "@1inch/limit-order-sdk";
import { orderStorage } from "./orderStorage";
import { fusionWebSocketMock } from "./fusionWebSocketMock";
import { ActiveOrder } from "../types/types";

export const fusionSDKMock = {
  // --- MOCK getQuote ---
  getQuote(params: {
    srcChainId: number;
    dstChainId: number;
    srcTokenAddress: string;
    dstTokenAddress: string;
    amount: string;
    walletAddress: string;
  }) {
    console.log("🧪 [MOCK] Getting quote with params:", params);

    return {
      getPreset: () => ({ secretsCount: 1 }),
      srcChainId: params.srcChainId,
      dstChainId: params.dstChainId,
      srcTokenAddress: params.srcTokenAddress,
      dstTokenAddress: params.dstTokenAddress,
      amount: params.amount,
      walletAddress: params.walletAddress,
      quoteId: `mock-quote-${Date.now()}`,
    };
  },

  // --- MOCK createOrder ---
  createOrder(
    quote: any,
    params: {
      walletAddress: string;
      hashLock: ReturnType<typeof HashLock.forSingleFill>;
      secretHashes: string[];
      fee?: { takingFeeBps: number; takingFeeReceiver: string };
    }
  ) {
    console.log("🚀 [MOCK] Creating order...");
    console.log("🧪 [MOCK] With quote:", quote);
    console.log("🧪 [MOCK] With params:", params);

    const orderHash = "0x" + randomBytes(32).toString("hex");

    const orderStruct: LimitOrderV4Struct = {
      salt: Date.now().toString(),
      maker: params.walletAddress,
      receiver: quote.walletAddress,
      makerAsset: quote.srcTokenAddress,
      takerAsset: quote.dstTokenAddress,
      makingAmount: quote.amount,
      takingAmount: (Number(quote.amount) * 2).toString(),
      makerTraits: "0x" + "00".repeat(32),
    };

    const activeOrder: ActiveOrder = {
      quoteId: quote.quoteId,
      orderHash,
      signature: "0x" + "11".repeat(65),
      deadline: (Date.now() + 3600_000).toString(),
      auctionStartDate: Date.now().toString(),
      auctionEndDate: (Date.now() + 180_000).toString(),
      remainingMakerAmount: quote.amount,
      order: orderStruct,
      extension: "0x",
      version: "2.2",
    };

    orderStorage.push(activeOrder);

    fusionWebSocketMock._emitOrderCreated(activeOrder);

    console.log("✅ [MOCK] Order created:", activeOrder.orderHash);

    return {
      order: {
        build: () => orderStruct,
        getOrderHash: () => orderHash,
        getTypedData: () => ({ /* mock typed data */ }),
        extension: { encode: () => "0x" },
      },
      hash: orderHash,
      quoteId: quote.quoteId,
    };
  },

  // --- MOCK submitOrder ---
  submitOrder(order: any, quoteId: string) {
    console.log("🚀 [MOCK] submitOrder called for:", order.getOrderHash());

    const builtOrder = order.build();
    const mockSignature = "0x" + "22".repeat(65);

    const response = {
      order: builtOrder,
      signature: mockSignature,
      quoteId,
      orderHash: order.getOrderHash(),
      extension: order.extension.encode(),
    };

    console.log("✅ [MOCK] Order submitted:", response.orderHash);
    return response;
  },
};
