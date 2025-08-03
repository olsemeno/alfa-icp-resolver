import { Interface } from "ethers";

export function decodeEvmError(abi: any, err: any) {
  const iface = new Interface(abi);
  // ethers v6 кладёт сырые данные об ошибке в err.data или err.error?.data
  const data = err?.data || err?.error?.data;
  if (!data) return null;

  try {
    return iface.parseError(data);
  } catch {
    return null;
  }
}

const isEthereumAvailable = () => {
  return typeof window !== 'undefined' && window.ethereum;
};

export { isEthereumAvailable };
