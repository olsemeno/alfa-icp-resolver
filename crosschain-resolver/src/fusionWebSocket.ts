import { WebSocketApi, NetworkEnum } from "@1inch/fusion-sdk";
import { fusionWebSocketMock } from "./mocks/fusionWebSocketMock";

export const fusionWebSocket =
  process.env.USE_MOCK === "true"
    ? fusionWebSocketMock
    : new WebSocketApi({
        url: "wss://api.1inch.dev/fusion/ws",
        network: NetworkEnum.ETHEREUM,
        authKey: process.env.FUSION_API_KEY!,
      });
