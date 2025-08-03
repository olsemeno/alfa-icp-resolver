import { HttpAgent } from '@dfinity/agent';
import { Actor } from '@dfinity/agent';

import { idlFactory as hashTimeLockIdlFactory } from "../blockchain/interfaces/icp/hashedTimeLock.did.js";
import type { _SERVICE as _HashedTimeLockService, ContractResponse } from "../blockchain/interfaces/icp/hashedTimeLock.did";
import deploymentAddresses from "../blockchain/deployment-addresses.json";
import { toE8s } from '../utils/icp';

const ICP_HOST = "https://ic0.app";
const hashedTimeLockIcpCanisterId = deploymentAddresses.icp.dev.HashedTimeLock;
const ledgerIcpCanisterId = deploymentAddresses.icp.dev.Ledger;

export class HashedTimeLockService {
  // Получение баланса по адресу
  async new_contract(
    fromIdentity: any,
    receiver: string,
    hashlock: string,
    timelock: number | bigint,
    amount: string
  ): Promise<ContractResponse> {
    try {
       // создаём ICP agent
      const agent = new HttpAgent({
        host: ICP_HOST,
        identity: fromIdentity,
      });

      if (process.env.NODE_ENV !== "production") {
        await agent.fetchRootKey(); // нужно для локалки
      }

      const hashTimeLockActor = Actor.createActor<_HashedTimeLockService>(hashTimeLockIdlFactory, {
        agent,
        canisterId: hashedTimeLockIcpCanisterId,
      });
  
      const response = await hashTimeLockActor.new_contract({
        receiver,
        hashlock,
        timelock: BigInt(timelock),
        amount: toE8s(amount),
        ledger_id: ledgerIcpCanisterId,
      });

      console.log('✅ ICP Time Lock created from HashedTimeLockService:', response);

      return response;
    } catch (error) {
      console.error('Error creating ICP Time Lock:', error);
      throw error;
    }
  }
}