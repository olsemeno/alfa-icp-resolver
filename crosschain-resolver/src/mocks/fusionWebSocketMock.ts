const orderCreatedListeners: ((order: any) => void)[] = [];
const openListeners: (() => void)[] = [];
const closeListeners: (() => void)[] = [];
const errorListeners: ((err: any) => void)[] = [];
const messageListeners: ((msg: any) => void)[] = [];

let isConnected = false;
let heartbeatInterval: NodeJS.Timeout | null = null;

export const fusionWebSocketMock = {
  // simulate connection
  connect() {
    console.log("🔌 [MOCK] Connecting to Fusion WS...");
    setTimeout(() => {
      isConnected = true;
      console.log("✅ [MOCK] WebSocket connected");
      openListeners.forEach((cb) => cb());

      // запускаем heartbeat
      heartbeatInterval = setInterval(() => {
        console.log("💓 [MOCK] WS heartbeat");
      }, 3000);
    }, 200);
  },

  // simulate disconnection
  disconnect() {
    if (!isConnected) return;
    isConnected = false;

    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }

    console.log("🔌 [MOCK] WebSocket disconnected");
    closeListeners.forEach((cb) => cb());
  },

  // subscriptions
  onOpen(callback: () => void) {
    openListeners.push(callback);
  },
  onClose(callback: () => void) {
    closeListeners.push(callback);
  },
  onError(callback: (err: any) => void) {
    errorListeners.push(callback);
  },
  onMessage(callback: (msg: any) => void) {
    messageListeners.push(callback);
  },

  // RPC mock
  rpc: {
    getActiveOrders() {
      console.log("🧪 [MOCK] Fetching active orders");
    },
    onGetActiveOrders(callback: (data: any) => void) {
      setTimeout(() => {
        callback({ items: [] });
      }, 200);
    },
  },

  // Order API mock
  order: {
    onOrderCreated(callback: (order: any) => void) {
      console.log("🧪 [MOCK] Listening for new orders");
      orderCreatedListeners.push(callback);
    },
    onOrderFilled(callback: (order: any) => void) {
      console.log("🧪 [MOCK] Listening for order filled");
      orderCreatedListeners.push(callback);
    },
  },

  // emit event
  _emitOrderCreated(order: any) {
    console.log("📢 [MOCK] Emitting order_created to", orderCreatedListeners.length, "listeners");
    orderCreatedListeners.forEach((cb) => cb({ result: order }));
  },
};
