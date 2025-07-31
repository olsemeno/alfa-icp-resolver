export const idlFactory = ({ IDL } : any) => {
  const CreateSwapRequest = IDL.Record({
    'hashlock' : IDL.Text,
    'recipient' : IDL.Text,
    'ledger_id' : IDL.Text,
    'amount' : IDL.Nat64,
    'timelock' : IDL.Nat64,
  });
  const Swap = IDL.Record({
    'hashlock' : IDL.Text,
    'refunded' : IDL.Bool,
    'recipient' : IDL.Text,
    'sender' : IDL.Text,
    'ledger_id' : IDL.Text,
    'preimage' : IDL.Opt(IDL.Text),
    'withdrawn' : IDL.Bool,
    'amount' : IDL.Nat64,
    'timelock' : IDL.Nat64,
  });
  const TransferResponse = IDL.Record({
    'block_index' : IDL.Opt(IDL.Nat),
    'transfer_id' : IDL.Opt(IDL.Text),
    'message' : IDL.Text,
    'success' : IDL.Bool,
  });
  const SwapResponse = IDL.Record({
    'swap' : IDL.Opt(Swap),
    'swap_id' : IDL.Opt(IDL.Text),
    'transfer_result' : IDL.Opt(IDL.Nat), // Изменено с TransferResponse на BlockIndex (Nat)
    'message' : IDL.Text,
    'success' : IDL.Bool,
  });
  const RefundRequest = IDL.Record({ 'swap_id' : IDL.Text });
  const TransferRequest = IDL.Record({
    'to' : IDL.Text,
    'fee' : IDL.Opt(IDL.Nat64),
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'ledger_id' : IDL.Text,
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : IDL.Nat64,
  });
  const WithdrawRequest = IDL.Record({
    'swap_id' : IDL.Text,
    'preimage' : IDL.Text,
  });
  return IDL.Service({
    'create_swap' : IDL.Func([CreateSwapRequest], [SwapResponse], []),
    'get_active_swaps' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, Swap))],
        ['query'],
      ),
    'get_all_swaps' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, Swap))],
        ['query'],
      ),
    'get_caller' : IDL.Func([], [IDL.Text], ['query']),
    'get_current_time' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_expired_swaps' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, Swap))],
        ['query'],
      ),
    'get_swap' : IDL.Func([IDL.Text], [IDL.Opt(Swap)], ['query']),
    'get_swap_count' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_swaps_by_recipient' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(IDL.Tuple(IDL.Text, Swap))],
        ['query'],
      ),
    'get_swaps_by_sender' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(IDL.Tuple(IDL.Text, Swap))],
        ['query'],
      ),
    'get_version' : IDL.Func([], [IDL.Text], ['query']),
    'hash_preimage' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'refund' : IDL.Func([RefundRequest], [SwapResponse], []),
    'transfer_icrc1' : IDL.Func([TransferRequest], [TransferResponse], []),
    'verify_preimage_hash' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Bool],
        ['query'],
      ),
    'withdraw' : IDL.Func([WithdrawRequest], [SwapResponse], []),
  });
};
