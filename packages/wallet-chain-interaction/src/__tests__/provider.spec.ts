import { describe, it, expect, jest } from '@jest/globals';
import {
    createProvider,
    EVMProvider,
    SolanaProvider,
    BitcoinProvider,
    TronProvider,
    TONProvider,
    AptosProvider,
    SuiProvider,
    NearProvider,
    FilecoinProvider,
    encodeERC20Transfer,
    decodeERC20Transfer,
    encodeERC20Approve,
    decodeERC20Approve,
    ChainType,
    ChainError,
    ChainErrorCode,
} from '../index';

describe('wallet-chain-interaction Provider Suite', () => {
    describe('createProvider factory', () => {
        it('should correctly instantiate EVMProvider', () => {
            const provider = createProvider('evm', { rpcUrl: 'https://rpc.ankr.com/eth', chainId: 1 });
            expect(provider).toBeInstanceOf(EVMProvider);
            expect(provider.chainType).toBe(ChainType.EVM);
            expect(provider.rpcUrl).toBe('https://rpc.ankr.com/eth');
        });

        it('should correctly instantiate SolanaProvider', () => {
            const provider = createProvider('solana', { rpcUrl: 'https://api.mainnet-beta.solana.com' });
            expect(provider).toBeInstanceOf(SolanaProvider);
            expect(provider.chainType).toBe(ChainType.SOLANA);
        });

        it('should correctly instantiate BitcoinProvider', () => {
            const provider = createProvider('bitcoin', { rpcUrl: 'https://btc.example.com' });
            expect(provider).toBeInstanceOf(BitcoinProvider);
            expect(provider.chainType).toBe(ChainType.BITCOIN);
        });

        it('should correctly instantiate TronProvider', () => {
            const provider = createProvider('tron', { rpcUrl: 'https://api.trongrid.io' });
            expect(provider).toBeInstanceOf(TronProvider);
            expect(provider.chainType).toBe(ChainType.TRON);
        });

        it('should correctly instantiate TONProvider', () => {
            const provider = createProvider('ton', { rpcUrl: 'https://toncenter.com/api/v2/jsonRPC' });
            expect(provider).toBeInstanceOf(TONProvider);
            expect(provider.chainType).toBe(ChainType.TON);
        });

        it('should correctly instantiate AptosProvider', () => {
            const provider = createProvider('aptos', { rpcUrl: 'https://fullnode.mainnet.aptoslabs.com/v1' });
            expect(provider).toBeInstanceOf(AptosProvider);
            expect(provider.chainType).toBe(ChainType.APTOS);
        });

        it('should correctly instantiate SuiProvider', () => {
            const provider = createProvider('sui', { rpcUrl: 'https://fullnode.mainnet.sui.io:443' });
            expect(provider).toBeInstanceOf(SuiProvider);
            expect(provider.chainType).toBe(ChainType.SUI);
        });

        it('should correctly instantiate NearProvider', () => {
            const provider = createProvider('near', { rpcUrl: 'https://rpc.mainnet.near.org' });
            expect(provider).toBeInstanceOf(NearProvider);
            expect(provider.chainType).toBe(ChainType.NEAR);
        });

        it('should correctly instantiate FilecoinProvider', () => {
            const provider = createProvider('filecoin', { rpcUrl: 'https://api.node.glif.io' });
            expect(provider).toBeInstanceOf(FilecoinProvider);
            expect(provider.chainType).toBe(ChainType.FILECOIN);
        });

        it('should throw an error for unsupported chain types', () => {
            expect(() => {
                createProvider('unknown_chain' as any, { rpcUrl: 'https://test.com' });
            }).toThrow('Unsupported chain type');
        });
    });

    describe('formatBalance and parseBalance utility methods', () => {
        const provider = new EVMProvider({ rpcUrl: 'https://eth.llamarpc.com' });

        it('should format balance without fractional part', () => {
            expect(provider.formatBalance('2000000000000000000', 18)).toBe('2');
        });

        it('should format balance with fraction and trim trailing zeros', () => {
            expect(provider.formatBalance('1500000000000000000', 18)).toBe('1.5');
            expect(provider.formatBalance('100000000000000000', 18)).toBe('0.1');
            expect(provider.formatBalance('1000000', 6)).toBe('1');
            expect(provider.formatBalance('1234560', 6)).toBe('1.23456');
        });

        it('should correctly parse formatted balance back to smallest units', () => {
            expect(provider.parseBalance('1.5', 18)).toBe('1500000000000000000');
            expect(provider.parseBalance('2', 18)).toBe('2000000000000000000');
            expect(provider.parseBalance('0.000001', 6)).toBe('1');
            expect(provider.parseBalance('100.25', 2)).toBe('10025');
        });
    });

    describe('Address Validation Across Providers', () => {
        it('validates EVM addresses', () => {
            const evm = new EVMProvider({ rpcUrl: 'https://test.com' });
            expect(evm.isValidAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')).toBe(true);
            expect(evm.isValidAddress('0x0000000000000000000000000000000000000000')).toBe(true);
            expect(evm.isValidAddress('not_an_address')).toBe(false);
            expect(evm.isValidAddress('0x123')).toBe(false);
        });

        it('validates Solana addresses', () => {
            const sol = new SolanaProvider({ rpcUrl: 'https://test.com' });
            expect(sol.isValidAddress('So11111111111111111111111111111111111111112')).toBe(true);
            expect(sol.isValidAddress('11111111111111111111111111111111')).toBe(true);
            expect(sol.isValidAddress('invalid!base58*chars')).toBe(false);
        });

        it('validates Bitcoin addresses', () => {
            const btc = new BitcoinProvider({ rpcUrl: 'https://test.com' });
            expect(btc.isValidAddress('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')).toBe(true);
            expect(btc.isValidAddress('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')).toBe(true);
            expect(btc.isValidAddress('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq')).toBe(true);
            expect(btc.isValidAddress('invalid_btc_address')).toBe(false);
        });

        it('validates Tron addresses', () => {
            const tron = new TronProvider({ rpcUrl: 'https://test.com' });
            expect(tron.isValidAddress('TRX6Q82wMqWNbCCiLqejbZe43wk1h1zJHm')).toBe(true);
            expect(tron.isValidAddress('41a614f803b6fd780986a42c78ec9c7f77e6ded13c')).toBe(true);
            expect(tron.isValidAddress('invalid_tron')).toBe(false);
        });

        it('validates Aptos addresses', () => {
            const aptos = new AptosProvider({ rpcUrl: 'https://test.com' });
            expect(aptos.isValidAddress('0x1')).toBe(true);
            expect(aptos.isValidAddress('0x0000000000000000000000000000000000000000000000000000000000000001')).toBe(true);
            expect(aptos.isValidAddress('invalid_aptos')).toBe(false);
        });

        it('validates Sui addresses', () => {
            const sui = new SuiProvider({ rpcUrl: 'https://test.com' });
            expect(sui.isValidAddress('0x0000000000000000000000000000000000000000000000000000000000000002')).toBe(true);
            expect(sui.isValidAddress('not_sui')).toBe(false);
        });

        it('validates Near addresses', () => {
            const near = new NearProvider({ rpcUrl: 'https://test.com' });
            expect(near.isValidAddress('alice.near')).toBe(true);
            expect(near.isValidAddress('sub.alice.near')).toBe(true);
            expect(near.isValidAddress('6ba13d6a2f473c24d7328bf7f45bcaae4d3c3327d42ea04f58c7e09efdf2fa92')).toBe(true);
            expect(near.isValidAddress('INVALID NEAR!')).toBe(false);
        });

        it('validates TON addresses', () => {
            const ton = new TONProvider({ rpcUrl: 'https://test.com' });
            expect(ton.isValidAddress('EQDtFpEwcFAEcRe5mLVh2N6C0x-_hJEM7W61_JLnSF74p4q2')).toBe(true);
            expect(ton.isValidAddress('0:d0973c837200bf72eab8bf3b7473d32a37c7f8ebf3dedbc18c4d68d12fa4fce1')).toBe(true);
            expect(ton.isValidAddress('invalid_ton')).toBe(false);
        });

        it('validates Filecoin addresses', () => {
            const fil = new FilecoinProvider({ rpcUrl: 'https://test.com' });
            expect(fil.isValidAddress('f1abjxfbp274xpdqcpuaykwkfb43omjotacm2p3za')).toBe(true);
            expect(fil.isValidAddress('t1abjxfbp274xpdqcpuaykwkfb43omjotacm2p3za')).toBe(true);
            expect(fil.isValidAddress('f012345')).toBe(true);
            expect(fil.isValidAddress('invalid_fil')).toBe(false);
        });
    });

    describe('waitForTransaction handling', () => {
        it('should resolve immediately when status is confirmed', async () => {
            const evm = new EVMProvider({ rpcUrl: 'https://test.com' });
            const mockGetStatus = jest.spyOn(evm, 'getTransactionStatus').mockResolvedValue({
                hash: '0x123',
                status: 'confirmed',
                blockNumber: 123456,
            });

            const result = await evm.waitForTransaction('0x123', 1, 5000);
            expect(result.status).toBe('confirmed');
            expect(result.hash).toBe('0x123');
            expect(mockGetStatus).toHaveBeenCalledTimes(1);
        });

        it('should resolve when status turns failed', async () => {
            const evm = new EVMProvider({ rpcUrl: 'https://test.com' });
            jest.spyOn(evm, 'getTransactionStatus').mockResolvedValue({
                hash: '0xabc',
                status: 'failed',
                error: 'Out of gas',
            });

            const result = await evm.waitForTransaction('0xabc', 1, 5000);
            expect(result.status).toBe('failed');
            expect(result.error).toBe('Out of gas');
        });

        it('should timeout if transaction remains pending', async () => {
            const evm = new EVMProvider({ rpcUrl: 'https://test.com' });
            jest.spyOn(evm, 'getTransactionStatus').mockResolvedValue({
                hash: '0xpending',
                status: 'pending',
            });

            const result = await evm.waitForTransaction('0xpending', 1, 1500);
            expect(result.status).toBe('pending');
            expect(result.error).toContain('timeout');
        });
    });

    describe('Bitcoin Provider Special Handlers', () => {
        it('throws descriptive error when sendTransaction called without raw transaction', async () => {
            const btc = new BitcoinProvider({ rpcUrl: 'https://test.com' });
            await expect(
                btc.sendTransaction('privkey', { to: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', value: '1000' })
            ).rejects.toThrow('Bitcoin transaction sending requires UTXO-based transaction building');
        });

        it('broadcasts signed raw transaction via data field in sendTransaction', async () => {
            const btc = new BitcoinProvider({ rpcUrl: 'https://test.com' });
            const broadcastSpy = jest.spyOn(btc, 'broadcastTransaction').mockResolvedValue({
                hash: 'txid_123',
                status: 'pending',
            });

            const result = await btc.sendTransaction('privkey', {
                to: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
                value: '1000',
                data: '0200000001...',
            });

            expect(result.hash).toBe('txid_123');
            expect(broadcastSpy).toHaveBeenCalledWith('0200000001...');
        });
    });

    describe('Private Key Format Flexibility', () => {
        it('SolanaProvider parses 64-char hex private key', () => {
            const solana = new SolanaProvider({ rpcUrl: 'https://api.mainnet-beta.solana.com' });
            const hexKey = 'f52b1bbfe4a2dfab1c38357a2acf4cf5ee3c99d080567f3f579ba7b34b03f807';
            const keypair = (solana as any).getKeypair(hexKey);
            expect(keypair.publicKey).toBeDefined();
            expect(keypair.publicKey.toBase58()).toBeTruthy();
        });

        it('SuiProvider parses Bech32 suiprivkey format', () => {
            const sui = new SuiProvider({ rpcUrl: 'https://fullnode.mainnet.sui.io:443' });
            const suiprivkey = 'suiprivkey1qprqcr55p3je4sshn42q3wd0q5d62zn2tx8q7rygvhaandaqvrlp5dfu9pd';
            const keypair = (sui as any).getKeypair(suiprivkey);
            expect(keypair.getPublicKey()).toBeDefined();
            expect(keypair.getPublicKey().toSuiAddress()).toBeTruthy();
        });
    });

    describe("Advanced Interaction Features", () => {
        it("simulates transactions returning success status and return data", async () => {
            const evm = new EVMProvider({ rpcUrl: "https://ethereum-rpc.publicnode.com" });
            const mockCall = jest.spyOn((evm as any).publicClient, "call").mockResolvedValue({
                data: "0x0000000000000000000000000000000000000000000000000000000000000001"
            });
            const mockEst = jest.spyOn((evm as any).publicClient, "estimateGas").mockResolvedValue(21000n);

            const sim = await evm.simulateTransaction({
                to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                value: "0"
            }, "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");

            expect(sim.success).toBe(true);
            expect(sim.returnValue).toBe("0x0000000000000000000000000000000000000000000000000000000000000001");
            expect(sim.gasEstimate).toBe("21000");
        });

        it("estimates EIP-1559 fee tiers correctly", async () => {
            const evm = new EVMProvider({ rpcUrl: "https://ethereum-rpc.publicnode.com" });
            jest.spyOn((evm as any).publicClient, "getGasPrice").mockResolvedValue(20000000000n);
            jest.spyOn((evm as any).publicClient, "getBlock").mockResolvedValue({
                baseFeePerGas: 15000000000n
            });

            const tiers = await evm.estimateFeeTiers();
            expect(tiers.baseFeePerGas).toBe("15000000000");
            expect(BigInt(tiers.slow.maxFeePerGas)).toBeGreaterThan(0n);
            expect(BigInt(tiers.fast.maxFeePerGas)).toBeGreaterThan(BigInt(tiers.standard.maxFeePerGas));
        });

        it("parses all SPL token accounts on Solana", async () => {
            const solana = new SolanaProvider({ rpcUrl: "https://api.mainnet-beta.solana.com" });
            jest.spyOn((solana as any).connection, "getParsedTokenAccountsByOwner").mockResolvedValue({
                value: [
                    {
                        pubkey: { toBase58: () => "TokenAccount11111111111111111111111111111" },
                        account: {
                            data: {
                                parsed: {
                                    info: {
                                        mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                                        tokenAmount: {
                                            amount: "1000000",
                                            decimals: 6,
                                            uiAmountString: "1"
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            });

            const accounts = await solana.getAllTokenAccounts("vines1vzrYbzLMRdu58sy5vnpmPDHgrWBzkNX6EWadu");
            expect(accounts.length).toBe(1);
            expect(accounts[0].mint).toBe("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
            expect(accounts[0].formatted).toBe("1");
        });

        it("encodes and decodes ERC-20 transfer calldata", () => {
            const to = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
            const amount = "1000000000000000000"; // 1e18
            const encoded = encodeERC20Transfer(to, amount);

            expect(encoded.startsWith("0xa9059cbb")).toBe(true);
            const decoded = decodeERC20Transfer(encoded);
            expect(decoded.to.toLowerCase()).toBe(to.toLowerCase());
            expect(decoded.amount).toBe(amount);
        });

        it("encodes and decodes ERC-20 approve calldata", () => {
            const spender = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
            const amount = "5000000";
            const encoded = encodeERC20Approve(spender, amount);

            expect(encoded.startsWith("0x095ea7b3")).toBe(true);
            const decoded = decodeERC20Approve(encoded);
            expect(decoded.spender.toLowerCase()).toBe(spender.toLowerCase());
            expect(decoded.amount).toBe(amount);
        });

        it("fetches detailed transaction receipt with logs", async () => {
            const evm = new EVMProvider({ rpcUrl: "https://ethereum-rpc.publicnode.com" });
            jest.spyOn((evm as any).publicClient, "getTransactionReceipt").mockResolvedValue({
                status: "success",
                blockNumber: 123456n,
                blockHash: "0xblockhash123",
                gasUsed: 50000n,
                effectiveGasPrice: 20000000000n,
                from: "0xfrom",
                to: "0xto",
                contractAddress: null,
                cumulativeGasUsed: 100000n,
                logs: [
                    {
                        address: "0xtoken",
                        topics: ["0xtopic1"],
                        data: "0xdata"
                    }
                ]
            });

            const receipt = await evm.getDetailedReceipt("0xtxhash");
            expect(receipt).not.toBeNull();
            expect(receipt?.status).toBe("success");
            expect(receipt?.blockNumber).toBe(123456);
            expect(receipt?.logs.length).toBe(1);
        });

        it("queries batch balances for multiple tokens", async () => {
            const evm = new EVMProvider({ rpcUrl: "https://ethereum-rpc.publicnode.com" });
            jest.spyOn(evm, "getTokenBalance").mockResolvedValue({
                balance: "1000000",
                formatted: "1.0",
                symbol: "USDC",
                decimals: 6
            });
            jest.spyOn(evm, "getTokenMetadata").mockResolvedValue({
                decimals: 6,
                symbol: "USDC",
                name: "USD Coin"
            });

            const results = await evm.getBatchBalances("0xuser", [
                "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
            ]);
            expect(results.length).toBe(1);
            expect(results[0].symbol).toBe("USDC");
            expect(results[0].balance).toBe("1.0");
        });
        it("resolves IPFS and Arweave URIs correctly", () => {
            const evm = new EVMProvider({ rpcUrl: "https://ethereum-rpc.publicnode.com" });
            expect(evm.resolveURI("ipfs://QmHash123/1.png")).toBe("https://ipfs.io/ipfs/QmHash123/1.png");
            expect(evm.resolveURI("ar://ArweaveTxHash456")).toBe("https://arweave.net/ArweaveTxHash456");
            expect(evm.resolveURI("https://example.com/nft.png")).toBe("https://example.com/nft.png");
        });

        it("simulates DEX swap quote and route correctly", async () => {
            const evm = new EVMProvider({ rpcUrl: "https://ethereum-rpc.publicnode.com" });
            const quote = await evm.getSwapQuote({
                fromToken: "ETH",
                toToken: "USDC",
                amountIn: "1000000000000000000", // 1 ETH (18 decimals)
                slippageBasisPoints: 50, // 0.5%
            });

            expect(quote.expectedAmountOut).toBeDefined();
            expect(quote.minimumAmountOut).toBeDefined();
            expect(BigInt(quote.minimumAmountOut) < BigInt(quote.expectedAmountOut)).toBe(true);
            expect(quote.route).toContain("FistSwap V2 Pool");
        });

        it("estimates UserOperation gas limits and simulates paymaster sponsorship", async () => {
            const evm = new EVMProvider({ rpcUrl: "https://ethereum-rpc.publicnode.com" });
            const mockUserOp = {
                sender: "0x1234567890123456789012345678901234567890",
                nonce: "0x0",
                initCode: "0x",
                callData: "0x",
            };
            const entryPoint = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";

            const gasEst = await evm.estimateUserOperationGas(mockUserOp, entryPoint);
            expect(gasEst.preVerificationGas).toBeDefined();
            expect(gasEst.verificationGasLimit).toBeDefined();
            expect(gasEst.callGasLimit).toBeDefined();

            const sponsorship = await evm.sponsorUserOperation(mockUserOp);
            expect(sponsorship.paymasterAndData).toMatch(/^0x/);

            const userOpHash = await evm.sendUserOperation(mockUserOp, entryPoint);
            expect(userOpHash).toMatch(/^0x[a-f0-9]{64}$/i);
        }, 15000);

    });
});
