import { orderStorage } from "./orderStorage";
const { WebSocketServer } = require("ws");

export const clients: Set<any> = new Set();

export const mockWSS = new WebSocketServer({ port: 7071 });

mockWSS.on("connection", (ws: any) => {
  console.log("✅ [MOCK] Client connected to FusionMock WS");
  clients.add(ws);

  ws.send(JSON.stringify({ event: "snapshot", result: orderStorage }));

  ws.on("close", () => clients.delete(ws));
});

export function broadcast(event: string, data: any) {
  const payload = JSON.stringify({ event, result: data });
  for (const client of clients) {
    client.send(payload);
  }
}

console.log("🚀 Mock Fusion+ WS server running on ws://localhost:7071");
