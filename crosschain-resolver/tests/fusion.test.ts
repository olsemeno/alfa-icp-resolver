import { strict as assert } from "assert";
import sinon from "sinon";
import { fusionWebSocketMock } from "../src/mocks/fusionWebSocketMock";
import { createFusionOrder } from "../src/frontend/swap";
import * as handler from "../src/handler";
import { LimitOrderV4Struct } from "@1inch/limit-order-sdk";
import { expect } from "chai";

type ActiveOrder = {
  secrets: string[];
  secretHashes: string[];
  orderHash: string;
  order: LimitOrderV4Struct;
};

describe("Fusion Integration (Mock WebSocket)", function () {
  // increase timeout for the test
  this.timeout(2000);

  it("should call handleOrderCreated after createFusionOrder", async function () {
    // set spy on the resolver handler
    const spy = sinon.spy(handler, "handleOrderCreated");

    // subscribe the resolver (simulate index.ts)
    fusionWebSocketMock.onOpen(() => {
      console.log("✅ [TEST] Resolver connected to mock WS");
      fusionWebSocketMock.rpc.getActiveOrders();
    });

    fusionWebSocketMock.order.onOrderCreated((order: any) => {
      handler.handleOrderCreated(order);
    });

    // start connect()
    fusionWebSocketMock.connect();

    // wait for connect() to finish
    await new Promise((resolve) => setTimeout(resolve, 300));

    // call the frontend function
    const { order } = await createFusionOrder() as { order: ActiveOrder };

    // wait for the callback onOrderCreated
    await new Promise((resolve) => setTimeout(resolve, 100));

    // check if handler.handleOrderCreated was called
    expect(spy.called).to.be.true;
    expect(spy.firstCall.args[0].result.orderHash).to.equal(order.orderHash);

    // remove the spy
    spy.restore();

    // close the mock socket to avoid test hanging
    fusionWebSocketMock.disconnect();
  });
});
