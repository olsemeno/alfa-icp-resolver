import { principalToAddressBytes } from "ictool";
import { Principal } from "@dfinity/principal";
import { DFX } from "./dfx.const";
import * as Agent from "@dfinity/agent";
import { Ed25519KeyIdentity } from "@dfinity/identity";
import { _SERVICE } from "./idl/ledger_srvs";
import { idlFactory } from "./idl/ledger_idl";
import { idlFactory as resolverIdlFactory } from "./idl/resolver_idl";
import { _SERVICE as ResolverService } from "./idl/resolver_srvs";
import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";
import * as CryptoJS from "crypto-js";

describe("Basic test scenario", () => {
  let identity: Ed25519KeyIdentity;
  let ledgerAgent: _SERVICE;
  let resolverAgent: ResolverService;

  beforeAll(async () => {
    identity = getIdentity("87654321876543218765432187654311");

    ledgerAgent = await getTypedActor<_SERVICE>(
      __LEDGER_ID__,
      identity,
      idlFactory
    );

     resolverAgent = await getTypedActor<ResolverService>(
      __CANISTER_ID__,
      identity,
      resolverIdlFactory
    );
  });

  test("should verify ledger canister is running and check balance", async () => {
    console.log(__CANISTER_ID__);

    let walBytes: number[] = principalToAddressBytes(
      Principal.fromText(__CANISTER_ID__) as any
    );
    console.log(
      DFX.LEDGER_FILL_BALANCE(walBytes.toString().replace(/,/g, ";"))
    );
    DFX.LEDGER_FILL_BALANCE(walBytes.toString().replace(/,/g, ";"));

    let balance = await ledgerAgent.icrc1_balance_of({
      owner: Principal.fromText(__CANISTER_ID__),
      subaccount: [],
    });
    expect(balance).toBeGreaterThan(0);
  });

  test("create swap", async () => {
    let preimage = "12345678901";
    let hashlock = sha256(preimage);

    // Устанавливаем timelock в будущее (текущее время + 1 час)
    const currentTime = BigInt(Date.now()) * 1000000n; // конвертируем в наносекунды
    const futureTime = currentTime + 3600000000000n; // + 1 час в наносекундах

    let swap = await resolverAgent.create_swap({
      hashlock: hashlock,
      recipient: identity.getPrincipal().toString(),
      ledger_id: __LEDGER_ID__,
      amount: 1000000n,
      timelock: futureTime,
    });

    expect(swap.success).toBe(true);
    expect(swap.swap_id).toBeDefined();
    expect(swap.swap).toBeDefined();

    // let swap_id = await resolverAgent.get_swaps_by_recipient(identity.getPrincipal().toString());

    let withdraw = await resolverAgent.withdraw({
      swap_id:  swap.swap_id[0]!,
      preimage: preimage,
    });

    // console.log(withdraw.success, withdraw.swap , withdraw.transfer_result, withdraw.message, withdraw.swap_id);
    expect(withdraw.success).toBe(true);
    expect(withdraw.swap).toBeDefined();

    let balance = await ledgerAgent.icrc1_balance_of({
      owner: identity.getPrincipal(),
      subaccount: [],
    });

    expect(balance).toBeGreaterThan(0);
  });
});

const localhost: string = "http://127.0.0.1:8000";

export async function getTypedActor<T>(
  imCanisterId: string,
  identity: Identity,
  idl: IDL.InterfaceFactory
): Promise<Agent.ActorSubclass<T>> {
  const agent: HttpAgent = new HttpAgent({
    host: localhost,
    identity: identity,
  });
  await agent.fetchRootKey();
  return Actor.createActor(idl, { agent, canisterId: imCanisterId });
}

export const getIdentity = (seed: string): Ed25519KeyIdentity => {
  let seedEncoded = new TextEncoder().encode(seed);
  return Ed25519KeyIdentity.generate(seedEncoded);
};

function sha256(preimage: string): string {
  return CryptoJS.SHA256(preimage).toString(CryptoJS.enc.Hex);
}
