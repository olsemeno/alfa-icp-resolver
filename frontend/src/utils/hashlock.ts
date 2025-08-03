import { ethers } from 'ethers';

const MIN_TIME_LOCK_DURATION_SECONDS = 3600;
const BUFFER_TIME_SECONDS = 600;

const generateRandomBytes = (length: number): Uint8Array => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
};

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

/** 🎯 Общий генератор секрета */
const generateSecret = () => {
  const secretBytes = generateRandomBytes(32);
  return {
    secretBytes,
    secretHex: bytesToHex(secretBytes),
  };
};

/** ✅ Для Ethereum — c префиксом 0x */
export const generateSecretAndHashlockEVM = () => {
  const { secretBytes, secretHex } = generateSecret();

  return {
    secret: `0x${secretHex}`,
    hashlock: ethers.sha256(secretBytes), // вернёт с 0x
  };
};

/** ✅ Для ICP — БЕЗ префикса 0x */
export const generateSecretAndHashlockICP = () => {
  const { secretBytes, secretHex } = generateSecret();

  return {
    secret: secretHex,
    hashlock: ethers.sha256(secretBytes).replace(/^0x/, ''), // удаляем 0x
  };
};

/** Генерация timelock */
export const generateTimelockEVM = async (secondsFromNow: number = MIN_TIME_LOCK_DURATION_SECONDS) => {
  const timestampNow = Math.floor(Date.now() / 1000);

  return timestampNow + Math.max(
    MIN_TIME_LOCK_DURATION_SECONDS + BUFFER_TIME_SECONDS,
    secondsFromNow
  );
};

export const generateTimelockICP = async (secondsFromNow: number = MIN_TIME_LOCK_DURATION_SECONDS) => {
  const timelockEvm = await generateTimelockEVM(secondsFromNow);

  return BigInt(timelockEvm) * BigInt(1_000_000_000);
};

/** EVM → ICP */
export function evmHashlockToIcp(evmHashlock: string): string {
  return evmHashlock.startsWith("0x") 
    ? evmHashlock.slice(2) // убираем 0x
    : evmHashlock;
}

/** ICP → EVM */
export function icpHashlockToEvm(icpHashlock: string): string {
  return icpHashlock.startsWith("0x") 
    ? icpHashlock // если вдруг кто-то передал с 0x — не трогаем
    : `0x${icpHashlock}`;
}
