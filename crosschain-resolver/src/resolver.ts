export async function processOrder(order: any) {
  console.log('🔍 [Resolver] Processing order')
  console.log(`   hash: ${order.hash}`)
  console.log(`   maker: ${order.maker}`)
  console.log(`   makerAsset: ${order.makerAsset}`)
  console.log(`   makerAmount: ${order.makerAmount}`)
  console.log(`   takerAsset: ${order.takerAsset}`)
  console.log(`   takerAmount: ${order.takerAmount}`)
}
