import dotenv from "dotenv";
dotenv.config();

import { fusionWebSocket } from "./fusionWebSocket";
import { handleActiveOrder, handleOrderCreated } from "./handler";

fusionWebSocket.onOpen(() => {
  console.log("✅ Connected to Fusion WS");
  // fusionWebSocket.rpc.getActiveOrders();

  // fusionWebSocket.rpc.onGetActiveOrders((data: any) => {
  //   console.log("📂 Active orders:", data.items.length);
  //   data.items.forEach(handleActiveOrder);
  // });
});

fusionWebSocket.order.onOrderCreated((order: any) => {
  console.log("🆕 [ORDER CREATED]:", order.result.orderHash);
  handleOrderCreated(order);
});

fusionWebSocket.onMessage((msg: any) => console.log("📨 Raw message:", msg));
fusionWebSocket.onError((err: any) => console.error("❌ WS error:", err));
fusionWebSocket.onClose(() => console.log("🔌 WS closed"));
