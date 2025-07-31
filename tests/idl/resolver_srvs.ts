import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface CreateSwapRequest {
  'hashlock' : string,
  'recipient' : string,
  'ledger_id' : string,
  'amount' : bigint,
  'timelock' : bigint,
}
export interface RefundRequest { 'swap_id' : string }
export interface Swap {
  'hashlock' : string,
  'refunded' : boolean,
  'recipient' : string,
  'sender' : string,
  'ledger_id' : string,
  'preimage' : [] | [string],
  'withdrawn' : boolean,
  'amount' : bigint,
  'timelock' : bigint,
}
export interface SwapResponse {
  'swap' : [] | [Swap],
  'swap_id' : [] | [string],
  'transfer_result' : [] | [bigint], // Изменено с TransferResponse на BlockIndex (bigint)
  'message' : string,
  'success' : boolean,
}
export interface TransferRequest {
  'to' : string,
  'fee' : [] | [bigint],
  'memo' : [] | [Uint8Array | number[]],
  'ledger_id' : string,
  'created_at_time' : [] | [bigint],
  'amount' : bigint,
}
export interface TransferResponse {
  'block_index' : [] | [bigint],
  'transfer_id' : [] | [string],
  'message' : string,
  'success' : boolean,
}
export interface WithdrawRequest { 'swap_id' : string, 'preimage' : string }
export interface _SERVICE {
  'create_swap' : ActorMethod<[CreateSwapRequest], SwapResponse>,
  'get_active_swaps' : ActorMethod<[], Array<[string, Swap]>>,
  'get_all_swaps' : ActorMethod<[], Array<[string, Swap]>>,
  'get_caller' : ActorMethod<[], string>,
  'get_current_time' : ActorMethod<[], bigint>,
  'get_expired_swaps' : ActorMethod<[], Array<[string, Swap]>>,
  'get_swap' : ActorMethod<[string], [] | [Swap]>,
  'get_swap_count' : ActorMethod<[], bigint>,
  'get_swaps_by_recipient' : ActorMethod<[string], Array<[string, Swap]>>,
  'get_swaps_by_sender' : ActorMethod<[string], Array<[string, Swap]>>,
  'get_version' : ActorMethod<[], string>,
  'hash_preimage' : ActorMethod<[string], string>,
  'refund' : ActorMethod<[RefundRequest], SwapResponse>,
  'transfer_icrc1' : ActorMethod<[TransferRequest], TransferResponse>,
  'verify_preimage_hash' : ActorMethod<[string, string], boolean>,
  'withdraw' : ActorMethod<[WithdrawRequest], SwapResponse>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
