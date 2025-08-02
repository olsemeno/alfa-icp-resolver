import { LimitOrderV4Struct } from '@1inch/limit-order-sdk'
import { OrderCreatedEvent } from '@1inch/fusion-sdk'
import { ActiveOrder } from './types/types' // TODO: import from fusion-sdk
import { fusionSDKMock } from './mocks/fusionSDKMock'

// export function handleOrder(orderData: LimitOrderV4Struct) {
//   logObject('Resolving order', orderData)
//   // here will be the logic of "claim" and interaction with ICP/Ethereum
// }

// export function handleActiveOrder(activeOrder: ActiveOrder) {
//   console.log(`🔧 Resolving Active Order ${activeOrder.orderHash}`)

//   handleOrder(activeOrder.order)
// }

export function handleOrderCreated(event: OrderCreatedEvent) {
  const orderData = event.result;

  console.log(`📥 [HANDLER] New order received: ${orderData.orderHash}`);

  const submitResult = fusionSDKMock.submitOrder(
    orderData,
    orderData.quoteId,
  );

  console.log(`✅ [HANDLER] Order submitted: ${submitResult.orderHash}`);

  // TODO: implement ICP liquidity lock
  console.log(`🔒 [HANDLER] ICP liquidity locked for order ${orderData.orderHash}`);
  // TODO: implement fillOrder → ICP transfer
}
