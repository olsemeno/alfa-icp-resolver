import {LimitOrderV4Struct} from '@1inch/limit-order-sdk'

export type ActiveOrder = {
  quoteId: string
  orderHash: string
  signature: string
  deadline: string
  auctionStartDate: string
  auctionEndDate: string
  remainingMakerAmount: string
  order: LimitOrderV4Struct
  extension: string
  version: '2.2'
}
