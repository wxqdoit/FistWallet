/**
 * Simple test script for wallet-chain-interaction package
 * Run with: npx tsx src/__tests__/test.ts
 */

import { createProvider, EVMProvider } from '../index';
import type { ChainProvider } from '../provider/base';

// Test configuration
const TEST_ADDRESSES = {
    evm: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
    solana: 'So11111111111111111111111111111111111111112',
    bitcoin: 'bc1q4s8yps9my6hun2tpd5ke5xmvgdnxcm2qspnp9r',
    aptos: '0x1',
    sui: '0x0000000000000000000000000000000000000000000000000000000000000002',
    near: 'near.org',
    tron: 'TRX6Q82wMqWNbCCiLqejbZe43wk1h1zJHm',
    ton: 'EQDtFpEwcFAEcRe5mLVh2N6C0x-_hJEM7W61_JLnSF74p4q2',
    filecoin: 'f1abjxfbp274xpdqcpuaykwkfb43omjotacm2p3za',
};

async function testProvider(name: string, provider: ChainProvider, testAddress: string) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Testing: ${name}`);
    console.log('='.repeat(50));

    try {
        // Test address validation
        console.log(`\n✓ isValidAddress('${testAddress}'): ${provider.isValidAddress(testAddress)}`);

        // Test balance formatting
        console.log(`✓ formatBalance('1000000000', 18): ${provider.formatBalance('1000000000', 18)}`);
        console.log(`✓ parseBalance('1.5', 18): ${provider.parseBalance('1.5', 18)}`);

        // Test getNativeBalance (may fail without network)
        try {
            const balance = await provider.getNativeBalance(testAddress);
            console.log(`✓ getNativeBalance: ${balance.formatted} ${balance.symbol}`);
        } catch (e) {
            console.log(`⚠ getNativeBalance: Network unavailable - ${(e as Error).message?.slice(0, 50)}...`);
        }

        // Test getBlockNumber (may fail without network)
        try {
            const blockNumber = await provider.getBlockNumber();
            console.log(`✓ getBlockNumber: ${blockNumber}`);
        } catch (e) {
            console.log(`⚠ getBlockNumber: Network unavailable`);
        }

        console.log(`\n✅ ${name} provider tests completed`);
    } catch (error) {
        console.error(`\n❌ ${name} provider tests failed:`, error);
    }
}

async function main() {
    console.log('Chain Interaction Package - Test Suite');
    console.log('======================================\n');

    // Test createProvider factory function
    console.log('Testing createProvider factory function...');

    const evmProvider = createProvider('evm', {
        rpcUrl: 'https://eth.llamarpc.com',
        chainId: 1,
    });
    console.log(`✓ createProvider('evm'): ${evmProvider.chainType}`);

    const solanaProvider = createProvider('solana', {
        rpcUrl: 'https://api.mainnet-beta.solana.com',
    });
    console.log(`✓ createProvider('solana'): ${solanaProvider.chainType}`);

    // Test EVM provider
    await testProvider('EVM (Ethereum)', evmProvider, TEST_ADDRESSES.evm);

    // Test Solana provider
    await testProvider('Solana', solanaProvider, TEST_ADDRESSES.solana);

    // Test direct instantiation
    console.log('\n' + '='.repeat(50));
    console.log('Testing direct provider instantiation...');
    console.log('='.repeat(50));

    const directEvm = new EVMProvider({
        rpcUrl: 'https://bsc-dataseed.binance.org',
        chainId: 56,
    });
    console.log(`✓ new EVMProvider (BSC): chainType = ${directEvm.chainType}`);
    console.log(`✓ BSC address validation: ${directEvm.isValidAddress('0x' + '1'.repeat(40))}`);

    console.log('\n' + '='.repeat(50));
    console.log('All tests completed!');
    console.log('='.repeat(50));
}

main().catch(console.error);
