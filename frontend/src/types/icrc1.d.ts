export interface ICRC1Account {
  owner: Uint8Array;
  subaccount?: Uint8Array;
}

export interface ICRC1Balance {
  e8s: bigint;
}

export interface ICRC1Ledger {
  icrc1_balance_of: (account: ICRC1Account) => Promise<ICRC1Balance>;
  icrc1_metadata: () => Promise<Array<[string, { Text?: string; Nat?: bigint; Int?: bigint }]>>;
}

export interface ICRC1TransferArgs {
  to: ICRC1Account;
  amount: bigint;
  fee?: bigint;
  memo?: Uint8Array;
  from_subaccount?: Uint8Array;
  created_at_time?: bigint;
}

export interface ICRC1TransferResult {
  Ok?: bigint;
  Err?: {
    BadFee?: { expected_fee: bigint };
    BadBurn?: { min_burn_amount: bigint };
    InsufficientFunds?: { balance: bigint };
    TooOld?: {};
    CreatedInFuture?: { ledger_time: bigint };
    Duplicate?: { duplicate_of: bigint };
    TemporarilyUnavailable?: {};
    GenericError?: { error_code: bigint; message: string };
  };
} 