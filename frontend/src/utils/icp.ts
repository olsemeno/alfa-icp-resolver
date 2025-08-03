import { Ed25519KeyIdentity } from "@dfinity/identity";

export const E8S_PER_ICP = 100_000_000;

/** 🔢 Конвертировать ICP → e8s */
export const toE8s = (amount: string | number): bigint => {
  return BigInt(Math.floor(Number(amount) * E8S_PER_ICP));
};

/** 🔢 Конвертировать e8s → ICP (number) */
export const fromE8s = (amount: bigint): number => {
  return Number(amount) / E8S_PER_ICP;
};

/** 🔢 Конвертировать e8s → строку с 8 знаками */
export const fromE8sString = (amount: bigint): string => {
  return (Number(amount) / E8S_PER_ICP).toFixed(8);
};

export const getIdentity = (seed: string): Ed25519KeyIdentity => {
  let seedEncoded = new TextEncoder().encode(seed);
  return Ed25519KeyIdentity.generate(seedEncoded);
};