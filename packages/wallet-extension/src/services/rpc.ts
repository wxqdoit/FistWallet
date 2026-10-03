import { Network, ChainType } from "../types";
import { EVM, BTC, Solana, Tron, Aptos, Sui, Ton, Near, Filecoin } from "wallet-core";

/**
 * Validates whether an address is valid for the given chain type
 */
export function validateAddressForChain(chainType: ChainType, address: string): boolean {
    if (!address || typeof address !== "string") return false;
    const cleanAddr = address.trim();

    try {
        switch (chainType) {
            case ChainType.EVM:
                return EVM.validateAddress(cleanAddr);
            case ChainType.BITCOIN:
                return BTC.validateAddress(cleanAddr);
            case ChainType.SOLANA:
                return Solana.validateAddress(cleanAddr);
            case ChainType.TRON:
                return Tron.validateAddress(cleanAddr);
            case ChainType.APTOS:
                return Aptos.validateAddress(cleanAddr);
            case ChainType.SUI:
                return Sui.validateAddress(cleanAddr);
            case ChainType.TON:
                return Ton.validateAddress(cleanAddr);
            case ChainType.NEAR:
                return Near.validateAddress(cleanAddr);
            case ChainType.FILECOIN:
                return Filecoin.validateAddress(cleanAddr);
            default:
                return false;
        }
    } catch {
        return false;
    }
}

/**
 * Helper to get list of candidate RPC URLs for a network
 */
export function getCandidateRpcUrls(network: Network): string[] {
    const urls: string[] = [];
    if (network.rpcUrl) {
        urls.push(network.rpcUrl);
    }
    if (network.fallbackRpcUrls && Array.isArray(network.fallbackRpcUrls)) {
        for (const url of network.fallbackRpcUrls) {
            if (url && !urls.includes(url)) {
                urls.push(url);
            }
        }
    }
    return urls;
}

/**
 * Format raw integer balance into human-readable string with up to 6 significant fractional decimals
 */
export function formatUnits(rawBalance: bigint | string, decimals: number, maxDecimals = 6): string {
    const rawBigInt = typeof rawBalance === "string" ? BigInt(rawBalance || "0") : rawBalance;
    if (rawBigInt === 0n) return "0";

    const divisor = 10n ** BigInt(decimals);
    const integerPart = rawBigInt / divisor;
    const remainder = rawBigInt % divisor;

    if (remainder === 0n) {
        return integerPart.toString();
    }

    const remainderPadded = remainder.toString().padStart(decimals, "0");
    let fraction = remainderPadded.slice(0, maxDecimals);
    // If leading decimals are zero but amount is non-zero, keep up to first non-zero digit + 4
    if (integerPart === 0n && /^0+$/.test(fraction)) {
        const firstNonZero = remainderPadded.search(/[1-9]/);
        if (firstNonZero !== -1) {
            fraction = remainderPadded.slice(0, Math.min(decimals, firstNonZero + 4));
        }
    }
    fraction = fraction.replace(/0+$/, "");
    return fraction.length > 0 ? `${integerPart}.${fraction}` : integerPart.toString();
}

/**
 * Fetch native balance for an account on a specific network with fallback RPCs
 */
export async function fetchNativeBalance(
    network: Network,
    address: string
): Promise<{ balance: string; formatted: string }> {
    if (!address || !network) {
        return { balance: "0", formatted: "0" };
    }

    const cleanAddress = address.trim();
    const formattedEvmAddress = cleanAddress.startsWith("0x") ? cleanAddress : `0x${cleanAddress}`;
    const rpcUrls = getCandidateRpcUrls(network);

    if (network.chainType === ChainType.EVM) {
        for (const rpcUrl of rpcUrls) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 6000);

                const res = await fetch(rpcUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        jsonrpc: "2.0",
                        id: 1,
                        method: "eth_getBalance",
                        params: [formattedEvmAddress, "latest"],
                    }),
                    signal: controller.signal,
                });
                clearTimeout(timeout);

                if (!res.ok) continue;
                const json = await res.json();
                if (json.result && typeof json.result === "string") {
                    const hexVal = json.result.startsWith("0x") ? json.result.slice(2) : json.result;
                    const balanceBigInt = BigInt("0x" + (hexVal || "0"));
                    const decimals = network.nativeCurrency?.decimals ?? 18;
                    const formatted = formatUnits(balanceBigInt, decimals);
                    return { balance: balanceBigInt.toString(), formatted };
                }
            } catch {
                continue;
            }
        }
    } else if (network.chainType === ChainType.SOLANA) {
        for (const rpcUrl of rpcUrls) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 6000);

                const res = await fetch(rpcUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        jsonrpc: "2.0",
                        id: 1,
                        method: "getBalance",
                        params: [cleanAddress],
                    }),
                    signal: controller.signal,
                });
                clearTimeout(timeout);

                if (!res.ok) continue;
                const json = await res.json();
                if (json.result && typeof json.result.value === "number") {
                    const lamports = BigInt(json.result.value);
                    const formatted = formatUnits(lamports, 9);
                    return { balance: lamports.toString(), formatted };
                }
            } catch {
                continue;
            }
        }
    } else if (network.chainType === ChainType.BITCOIN) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 6000);
            const baseUrl = network.rpcUrl.replace(/\/api\/?$/, "") + "/api";
            const res = await fetch(`${baseUrl}/address/${cleanAddress}`, {
                signal: controller.signal,
            });
            clearTimeout(timeout);

            if (res.ok) {
                const data = await res.json();
                const funded = BigInt(data.chain_stats?.funded_txo_sum || 0);
                const spent = BigInt(data.chain_stats?.spent_txo_sum || 0);
                const satoshis = funded >= spent ? funded - spent : 0n;
                const formatted = formatUnits(satoshis, 8);
                return { balance: satoshis.toString(), formatted };
            }
        } catch {
            // fallback
        }
    } else if (network.chainType === ChainType.TRON) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(`https://api.trongrid.io/v1/accounts/${cleanAddress}`, {
                signal: controller.signal,
            });
            clearTimeout(timeout);
            if (res.ok) {
                const data = await res.json();
                const raw = data.data?.[0]?.balance ?? 0;
                const balanceBigInt = BigInt(raw);
                return { balance: balanceBigInt.toString(), formatted: formatUnits(balanceBigInt, 6) };
            }
        } catch {
            // fallback
        }
    } else if (network.chainType === ChainType.TON) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${encodeURIComponent(cleanAddress)}`, {
                signal: controller.signal,
            });
            clearTimeout(timeout);
            if (res.ok) {
                const data = await res.json();
                if (data.ok && data.result) {
                    const balanceBigInt = BigInt(data.result);
                    return { balance: balanceBigInt.toString(), formatted: formatUnits(balanceBigInt, 9) };
                }
            }
        } catch {
            // fallback
        }
    } else if (network.chainType === ChainType.APTOS) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(`https://fullnode.mainnet.aptoslabs.com/v1/accounts/${cleanAddress}/resource/0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>`, {
                signal: controller.signal,
            });
            clearTimeout(timeout);
            if (res.ok) {
                const data = await res.json();
                const val = data?.data?.coin?.value ?? '0';
                const balanceBigInt = BigInt(val);
                return { balance: balanceBigInt.toString(), formatted: formatUnits(balanceBigInt, 8) };
            }
        } catch {
            // fallback
        }
    } else if (network.chainType === ChainType.SUI) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(network.rpcUrl || 'https://fullnode.mainnet.sui.io', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'suix_getBalance',
                    params: [cleanAddress, '0x2::sui::SUI'],
                }),
                signal: controller.signal,
            });
            clearTimeout(timeout);
            if (res.ok) {
                const data = await res.json();
                if (data.result?.totalBalance) {
                    const balanceBigInt = BigInt(data.result.totalBalance);
                    return { balance: balanceBigInt.toString(), formatted: formatUnits(balanceBigInt, 9) };
                }
            }
        } catch {
            // fallback
        }
    } else if (network.chainType === ChainType.NEAR) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(network.rpcUrl || 'https://rpc.mainnet.near.org', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'query',
                    params: {
                        request_type: 'view_account',
                        finality: 'final',
                        account_id: cleanAddress,
                    },
                }),
                signal: controller.signal,
            });
            clearTimeout(timeout);
            if (res.ok) {
                const data = await res.json();
                if (data.result?.amount) {
                    const balanceBigInt = BigInt(data.result.amount);
                    return { balance: balanceBigInt.toString(), formatted: formatUnits(balanceBigInt, 24) };
                }
            }
        } catch {
            // fallback
        }
    } else if (network.chainType === ChainType.FILECOIN) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(network.rpcUrl || 'https://api.node.glif.io', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'Filecoin.WalletBalance',
                    params: [cleanAddress],
                }),
                signal: controller.signal,
            });
            clearTimeout(timeout);
            if (res.ok) {
                const data = await res.json();
                if (data.result) {
                    const balanceBigInt = BigInt(data.result);
                    return { balance: balanceBigInt.toString(), formatted: formatUnits(balanceBigInt, 18) };
                }
            }
        } catch {
            // fallback
        }
    }

    return { balance: "0", formatted: "0" };
}

/**
 * Estimate gas/network fee for a native transfer
 */
export async function estimateFee(
    network: Network,
    _from: string,
    _to: string,
    _amount: string
): Promise<{ fee: string; symbol: string }> {
    const symbol = network.nativeCurrency?.symbol || "";
    if (network.chainType === ChainType.EVM) {
        const rpcUrls = getCandidateRpcUrls(network);
        for (const rpcUrl of rpcUrls) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 4000);
                const res = await fetch(rpcUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        jsonrpc: "2.0",
                        id: 1,
                        method: "eth_gasPrice",
                        params: [],
                    }),
                    signal: controller.signal,
                });
                clearTimeout(timeout);
                if (!res.ok) continue;
                const json = await res.json();
                if (json.result) {
                    const gasPrice = BigInt(json.result);
                    const gasLimit = 21000n;
                    const totalWei = gasPrice * gasLimit;
                    const decimals = network.nativeCurrency?.decimals || 18;
                    const feeEth = formatUnits(totalWei, decimals, 6);
                    return { fee: feeEth, symbol };
                }
            } catch {
                continue;
            }
        }
        return { fee: "0.00042", symbol };
    } else if (network.chainType === ChainType.SOLANA) {
        return { fee: "0.000005", symbol };
    } else if (network.chainType === ChainType.BITCOIN) {
        return { fee: "0.00005", symbol };
    } else {
        return { fee: "0.001", symbol };
    }
}

/**
 * Send native transfer on chain
 */
export async function sendNativeTransfer(
    network: Network,
    privateKey: string,
    to: string,
    amount: string
): Promise<string> {
    if (network.chainType !== ChainType.EVM) {
        throw new Error(`Sending native transfers on ${network.chainType} will be available in the upcoming release.`);
    }

    const rpcUrls = getCandidateRpcUrls(network);
    if (rpcUrls.length === 0) {
        throw new Error("No RPC endpoints configured for " + network.name);
    }

    const fromAddress = EVM.getAddressByPrivateKey(privateKey);
    const formattedFrom = fromAddress.startsWith("0x") ? fromAddress : `0x${fromAddress}`;
    const formattedTo = to.startsWith("0x") ? to : `0x${to}`;

    // 1. Get nonce and gas price using candidate RPCs
    let nonce: number | null = null;
    let gasPriceHex: string | null = null;
    let activeRpcUrl: string = rpcUrls[0];

    for (const rpcUrl of rpcUrls) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const [nonceRes, gasPriceRes] = await Promise.all([
                fetch(rpcUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        jsonrpc: "2.0",
                        id: 1,
                        method: "eth_getTransactionCount",
                        params: [formattedFrom, "pending"],
                    }),
                    signal: controller.signal,
                }),
                fetch(rpcUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        jsonrpc: "2.0",
                        id: 2,
                        method: "eth_gasPrice",
                        params: [],
                    }),
                    signal: controller.signal,
                })
            ]);
            clearTimeout(timeout);

            if (!nonceRes.ok || !gasPriceRes.ok) continue;
            const nonceJson = await nonceRes.json();
            const gasPriceJson = await gasPriceRes.json();

            if (nonceJson.result && gasPriceJson.result) {
                nonce = parseInt(nonceJson.result, 16);
                gasPriceHex = gasPriceJson.result;
                activeRpcUrl = rpcUrl;
                break;
            }
        } catch {
            continue;
        }
    }

    if (nonce === null || !gasPriceHex) {
        throw new Error("Failed to connect to RPC node to prepare transaction");
    }

    // 2. Convert amount to Wei
    const decimals = network.nativeCurrency.decimals || 18;
    const parts = amount.split(".");
    let wei = BigInt(parts[0] || "0") * 10n ** BigInt(decimals);
    if (parts[1]) {
        const fractionPadded = parts[1].padEnd(decimals, "0").slice(0, decimals);
        wei += BigInt(fractionPadded);
    }
    const valueHex = "0x" + wei.toString(16);

    // 3. Sign transaction
    const tx = {
        to: formattedTo,
        value: valueHex,
        gasLimit: "0x5208", // 21000
        gasPrice: gasPriceHex,
        nonce,
        chainId: Number(network.chainId) || 1,
        type: 0,
    };

    const signedTxHex = EVM.signTransaction(privateKey, tx);

    // 4. Broadcast transaction across candidate RPCs
    let lastError = "Failed to broadcast transaction";
    for (const rpcUrl of [activeRpcUrl, ...rpcUrls.filter(u => u !== activeRpcUrl)]) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 6000);
            const broadcastRes = await fetch(rpcUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: 3,
                    method: "eth_sendRawTransaction",
                    params: [signedTxHex],
                }),
                signal: controller.signal,
            });
            clearTimeout(timeout);

            if (!broadcastRes.ok) continue;
            const broadcastJson = await broadcastRes.json();
            if (broadcastJson.error) {
                lastError = broadcastJson.error.message || lastError;
                continue;
            }
            if (broadcastJson.result) {
                return broadcastJson.result;
            }
        } catch (e: any) {
            lastError = e?.message || lastError;
        }
    }

    throw new Error(lastError);
}

/**
 * Query ERC-20 token balance on an EVM network
 */
export async function fetchTokenBalance(
    network: Network,
    tokenAddress: string,
    ownerAddress: string,
    tokenDecimals: number = 18
): Promise<{ balance: string; formatted: string }> {
    if (!tokenAddress || !ownerAddress || network.chainType !== ChainType.EVM) {
        return { balance: "0", formatted: "0" };
    }

    const cleanToken = tokenAddress.startsWith("0x") ? tokenAddress : `0x${tokenAddress}`;
    const cleanOwner = ownerAddress.startsWith("0x") ? ownerAddress.slice(2) : ownerAddress;
    const data = "0x70a08231" + cleanOwner.padStart(64, "0");
    const rpcUrls = getCandidateRpcUrls(network);

    for (const rpcUrl of rpcUrls) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const res = await fetch(rpcUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: 1,
                    method: "eth_call",
                    params: [{ to: cleanToken, data }, "latest"],
                }),
                signal: controller.signal,
            });
            clearTimeout(timeout);

            if (!res.ok) continue;
            const json = await res.json();
            if (json.result && json.result !== "0x") {
                const hexVal = json.result.startsWith("0x") ? json.result.slice(2) : json.result;
                const balanceBigInt = BigInt("0x" + (hexVal || "0"));
                return { balance: balanceBigInt.toString(), formatted: formatUnits(balanceBigInt, tokenDecimals) };
            }
        } catch {
            continue;
        }
    }

    return { balance: "0", formatted: "0" };
}

/**
 * Query ERC-20 token metadata (decimals, symbol)
 */
export async function fetchTokenMetadata(
    network: Network,
    tokenAddress: string
): Promise<{ symbol: string; decimals: number } | null> {
    if (!tokenAddress || network.chainType !== ChainType.EVM) return null;
    const cleanToken = tokenAddress.startsWith("0x") ? tokenAddress : `0x${tokenAddress}`;
    const rpcUrls = getCandidateRpcUrls(network);

    for (const rpcUrl of rpcUrls) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const [decRes, symRes] = await Promise.all([
                fetch(rpcUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        jsonrpc: "2.0",
                        id: 1,
                        method: "eth_call",
                        params: [{ to: cleanToken, data: "0x313ce567" }, "latest"],
                    }),
                    signal: controller.signal,
                }),
                fetch(rpcUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        jsonrpc: "2.0",
                        id: 2,
                        method: "eth_call",
                        params: [{ to: cleanToken, data: "0x95d89b41" }, "latest"],
                    }),
                    signal: controller.signal,
                })
            ]);
            clearTimeout(timeout);

            if (!decRes.ok || !symRes.ok) continue;
            const decJson = await decRes.json();
            const symJson = await symRes.json();

            let decimals = 18;
            if (decJson.result && decJson.result !== "0x") {
                decimals = parseInt(decJson.result, 16);
            }

            let symbol = "TOKEN";
            if (symJson.result && symJson.result !== "0x") {
                const hex = symJson.result.slice(2);
                if (hex.length >= 128) {
                    const len = parseInt(hex.slice(64, 128), 16);
                    const strHex = hex.slice(128, 128 + len * 2);
                    symbol = Buffer.from(strHex, "hex").toString("utf8").replace(/\0/g, "");
                }
            }

            return { symbol, decimals };
        } catch {
            continue;
        }
    }

    return null;
}
