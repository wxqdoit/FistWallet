import { describe, it, expect } from "vitest";
import { validateAddressForChain, formatUnits, getCandidateRpcUrls } from "./rpc";
import { ChainType, Network } from "../types";

describe("wallet-extension RPC Service Suite", () => {
  it("validates EVM addresses accurately", () => {
    expect(validateAddressForChain(ChainType.EVM, "0x9858effd232b4033e47d90003d41ec34ecaeda94")).toBe(true);
    expect(validateAddressForChain(ChainType.EVM, "9858effd232b4033e47d90003d41ec34ecaeda94")).toBe(true);
    expect(validateAddressForChain(ChainType.EVM, "invalid-evm-addr")).toBe(false);
  });

  it("validates Bitcoin addresses accurately", () => {
    expect(validateAddressForChain(ChainType.BITCOIN, "bc1qmxrw6qdh5g3ztfcwm0et5l8mvws4eva24kmp8m")).toBe(true);
    expect(validateAddressForChain(ChainType.BITCOIN, "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa")).toBe(true);
    expect(validateAddressForChain(ChainType.BITCOIN, "not-a-btc-address")).toBe(false);
  });

  it("validates Solana addresses accurately", () => {
    expect(validateAddressForChain(ChainType.SOLANA, "HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk")).toBe(true);
    expect(validateAddressForChain(ChainType.SOLANA, "invalid")).toBe(false);
  });

  it("validates Tron addresses accurately", () => {
    expect(validateAddressForChain(ChainType.TRON, "TF8TuGQpevaUo7hnhXc6kfHWG6EP75eGMp")).toBe(true);
    expect(validateAddressForChain(ChainType.TRON, "0x123")).toBe(false);
  });

  it("validates Sui addresses accurately", () => {
    expect(validateAddressForChain(ChainType.SUI, "0x5e93a736d04fbb25737aa40bee40171ef79f65fae833749e3c089fe7cc2161f1")).toBe(true);
    expect(validateAddressForChain(ChainType.SUI, "0x123")).toBe(false);
  });

  it("handles empty or malformed inputs without throwing", () => {
    expect(validateAddressForChain(ChainType.EVM, "")).toBe(false);
    expect(validateAddressForChain(ChainType.EVM, null as any)).toBe(false);
    expect(validateAddressForChain(ChainType.EVM, undefined as any)).toBe(false);
  });

  it("formats balance units properly with various decimal scales", () => {
    expect(formatUnits(0n, 18)).toBe("0");
    expect(formatUnits(1000000000000000000n, 18)).toBe("1");
    expect(formatUnits(1500000000000000000n, 18)).toBe("1.5");
    expect(formatUnits(1000200000000000000n, 18)).toBe("1.0002");
    expect(formatUnits(50000000000000n, 18)).toBe("0.00005");
    expect(formatUnits(123400000000n, 18)).toBe("0.0000001234");
  });

  it("collects candidate RPCs including fallbacks without duplicates", () => {
    const net: Network = {
      id: "polygon",
      name: "Polygon",
      chainType: ChainType.EVM,
      chainId: 137,
      rpcUrl: "https://polygon-bor-rpc.publicnode.com",
      fallbackRpcUrls: [
        "https://polygon.drpc.org",
        "https://polygon-bor-rpc.publicnode.com",
        "https://polygon.gateway.tenderly.co"
      ],
      explorerUrl: "https://polygonscan.com",
      nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
      icon: "polygon"
    };

    const urls = getCandidateRpcUrls(net);
    expect(urls).toEqual([
      "https://polygon-bor-rpc.publicnode.com",
      "https://polygon.drpc.org",
      "https://polygon.gateway.tenderly.co"
    ]);
  });
});
