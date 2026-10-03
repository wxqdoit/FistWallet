/**
 * Private key validation tests for all supported chains
 */

import * as EVM from '../chains/evm';
import * as BTC from '../chains/btc';
import * as Solana from '../chains/solana';
import * as Aptos from '../chains/aptos';
import * as Sui from '../chains/sui';
import * as Tron from '../chains/tron';
import * as Ton from '../chains/ton';
import * as Near from '../chains/near';
import * as Filecoin from '../chains/filecoin';

describe('Private Key Validation - All Chains', () => {
    describe('EVM Private Key Validation', () => {
        test('should validate correct private key', () => {
            const validKey = '1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727';
            expect(EVM.validatePrivateKey(validKey)).toBe(true);
        });

        test('should validate private key with 0x prefix', () => {
            const validKey = '0x1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727';
            expect(EVM.validatePrivateKey(validKey)).toBe(true);
        });

        test('should reject invalid length', () => {
            expect(EVM.validatePrivateKey('123')).toBe(false);
            expect(EVM.validatePrivateKey('1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b7271234')).toBe(false);
        });

        test('should reject non-hex characters', () => {
            expect(EVM.validatePrivateKey('ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ')).toBe(false);
            expect(EVM.validatePrivateKey('1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b72g')).toBe(false);
        });

        test('should reject all zeros', () => {
            expect(EVM.validatePrivateKey('0000000000000000000000000000000000000000000000000000000000000000')).toBe(false);
        });

        test('should reject keys >= secp256k1 curve order', () => {
            // secp256k1 curve order n
            const n = 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141';
            expect(EVM.validatePrivateKey(n)).toBe(false);

            // n + 1
            const nPlus1 = 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364142';
            expect(EVM.validatePrivateKey(nPlus1)).toBe(false);
        });

        test('should accept valid key just below curve order', () => {
            // n - 1
            const nMinus1 = 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140';
            expect(EVM.validatePrivateKey(nMinus1)).toBe(true);
        });

        test('should handle empty or whitespace', () => {
            expect(EVM.validatePrivateKey('')).toBe(false);
            expect(EVM.validatePrivateKey('   ')).toBe(false);
        });
    });

    describe('Bitcoin Private Key Validation', () => {
        test('should validate correct private key', () => {
            const validKey = 'e284129cc0922579a535bbf4d1a3b25773090d28c909bc0fed73b5e0222cc372';
            expect(BTC.validatePrivateKey(validKey)).toBe(true);
        });

        test('should reject invalid length', () => {
            expect(BTC.validatePrivateKey('123')).toBe(false);
        });

        test('should reject non-hex characters', () => {
            expect(BTC.validatePrivateKey('g284129cc0922579a535bbf4d1a3b25773090d28c909bc0fed73b5e0222cc372')).toBe(false);
        });

        test('should reject all zeros', () => {
            expect(BTC.validatePrivateKey('0000000000000000000000000000000000000000000000000000000000000000')).toBe(false);
        });

        test('should reject keys >= secp256k1 curve order', () => {
            const n = 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141';
            expect(BTC.validatePrivateKey(n)).toBe(false);
        });

        test('should handle whitespace trimming', () => {
            const validKey = '  e284129cc0922579a535bbf4d1a3b25773090d28c909bc0fed73b5e0222cc372  ';
            expect(BTC.validatePrivateKey(validKey)).toBe(true);
        });
    });

    describe('Solana Private Key Validation', () => {
        test('should validate correct hex private key', () => {
            const validKey = '37df573b3ac4ad5b522e064e25b63ea16bcbe79d449e81a0268d104794bcb445';
            expect(Solana.validatePrivateKey(validKey)).toBe(true);
        });

        test('should validate correct base58 private key', () => {
            // Example Solana private key in base58 format (64 bytes)
            const wallet = Solana.createWallet();
            expect(Solana.validatePrivateKey(wallet.privateKey)).toBe(true);
        });

        test('should reject invalid hex length', () => {
            expect(Solana.validatePrivateKey('123')).toBe(false);
        });

        test('should accept all zeros for ed25519', () => {
            // ed25519 allows all 32-byte values including zero
            expect(Solana.validatePrivateKey('0000000000000000000000000000000000000000000000000000000000000000')).toBe(true);
        });

        test('should reject non-hex and non-base58', () => {
            expect(Solana.validatePrivateKey('ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ')).toBe(false);
        });
    });

    describe('Aptos Private Key Validation', () => {
        test('should validate correct private key', () => {
            const validKey = '1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727';
            expect(Aptos.validatePrivateKey(validKey)).toBe(true);
        });

        test('should validate private key with 0x prefix', () => {
            const validKey = '0x1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727';
            expect(Aptos.validatePrivateKey(validKey)).toBe(true);
        });

        test('should reject invalid length', () => {
            expect(Aptos.validatePrivateKey('123')).toBe(false);
        });

        test('should accept all zeros for ed25519', () => {
            expect(Aptos.validatePrivateKey('0000000000000000000000000000000000000000000000000000000000000000')).toBe(true);
        });

        test('should reject non-hex characters', () => {
            expect(Aptos.validatePrivateKey('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')).toBe(false);
        });
    });

    describe('Sui Private Key Validation', () => {
        test('should validate correct hex private key', () => {
            const validKey = '1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727';
            expect(Sui.validatePrivateKey(validKey)).toBe(true);
        });

        test('should validate Bech32 encoded private key', () => {
            const wallet = Sui.createWallet();
            expect(Sui.validatePrivateKey(wallet.privateKey)).toBe(true);
        });

        test('should reject invalid hex length', () => {
            expect(Sui.validatePrivateKey('123')).toBe(false);
        });

        test('should reject invalid Bech32 format', () => {
            expect(Sui.validatePrivateKey('suiprivkeyinvalid')).toBe(false);
        });

        test('should accept all zeros for ed25519 hex format', () => {
            expect(Sui.validatePrivateKey('0000000000000000000000000000000000000000000000000000000000000000')).toBe(true);
        });
    });

    describe('TRON Private Key Validation', () => {
        test('should validate correct private key', () => {
            const validKey = '1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727';
            expect(Tron.validatePrivateKey(validKey)).toBe(true);
        });

        test('should validate private key with 0x prefix', () => {
            const validKey = '0x1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727';
            expect(Tron.validatePrivateKey(validKey)).toBe(true);
        });

        test('should reject all zeros', () => {
            expect(Tron.validatePrivateKey('0000000000000000000000000000000000000000000000000000000000000000')).toBe(false);
        });

        test('should reject keys >= secp256k1 curve order', () => {
            const n = 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141';
            expect(Tron.validatePrivateKey(n)).toBe(false);
        });

        test('should reject invalid length', () => {
            expect(Tron.validatePrivateKey('123')).toBe(false);
        });
    });

    describe('TON Private Key Validation', () => {
        test('should validate correct private key', () => {
            const validKey = '1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727';
            expect(Ton.validatePrivateKey(validKey)).toBe(true);
        });

        test('should reject invalid length', () => {
            expect(Ton.validatePrivateKey('123')).toBe(false);
        });

        test('should accept all zeros for ed25519', () => {
            expect(Ton.validatePrivateKey('0000000000000000000000000000000000000000000000000000000000000000')).toBe(true);
        });

        test('should reject non-hex characters', () => {
            expect(Ton.validatePrivateKey('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')).toBe(false);
        });

        test('should handle whitespace trimming', () => {
            const validKey = '  1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727  ';
            expect(Ton.validatePrivateKey(validKey)).toBe(true);
        });
    });

    describe('NEAR Private Key Validation', () => {
        test('should validate correct private key', () => {
            const validKey = '1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727';
            expect(Near.validatePrivateKey(validKey)).toBe(true);
        });

        test('should reject invalid length', () => {
            expect(Near.validatePrivateKey('123')).toBe(false);
        });

        test('should accept all zeros for ed25519', () => {
            expect(Near.validatePrivateKey('0000000000000000000000000000000000000000000000000000000000000000')).toBe(true);
        });

        test('should reject non-hex characters', () => {
            expect(Near.validatePrivateKey('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')).toBe(false);
        });
    });

    describe('Filecoin Private Key Validation', () => {
        test('should validate correct secp256k1 private key', () => {
            const validKey = '1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727';
            expect(Filecoin.validatePrivateKey(validKey, 'secp256k1')).toBe(true);
        });

        test('should validate correct BLS private key', () => {
            const validKey = '1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727';
            expect(Filecoin.validatePrivateKey(validKey, 'bls')).toBe(true);
        });

        test('should default to secp256k1 validation', () => {
            const validKey = '1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727';
            expect(Filecoin.validatePrivateKey(validKey)).toBe(true);
        });

        test('should reject all zeros for secp256k1', () => {
            expect(Filecoin.validatePrivateKey('0000000000000000000000000000000000000000000000000000000000000000', 'secp256k1')).toBe(false);
        });

        test('should accept all zeros for BLS (ed25519)', () => {
            expect(Filecoin.validatePrivateKey('0000000000000000000000000000000000000000000000000000000000000000', 'bls')).toBe(true);
        });

        test('should reject keys >= secp256k1 curve order for secp256k1', () => {
            const n = 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141';
            expect(Filecoin.validatePrivateKey(n, 'secp256k1')).toBe(false);
        });

        test('should accept keys >= secp256k1 curve order for BLS', () => {
            const n = 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141';
            expect(Filecoin.validatePrivateKey(n, 'bls')).toBe(true);
        });

        test('should reject invalid length', () => {
            expect(Filecoin.validatePrivateKey('123', 'secp256k1')).toBe(false);
            expect(Filecoin.validatePrivateKey('123', 'bls')).toBe(false);
        });
    });

    
    describe("0x and 0X Prefix Tolerance Across All Chains", () => {
        const rawHexKey = "1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727";
        const prefixed0x = "0x" + rawHexKey;
        const prefixed0X = "0X" + rawHexKey;
        const padded0x = "  0x" + rawHexKey + "  ";

        test("EVM derives same address with and without 0x prefix", () => {
            const addr1 = EVM.getAddressByPrivateKey(rawHexKey);
            const addr2 = EVM.getAddressByPrivateKey(prefixed0x);
            const addr3 = EVM.getAddressByPrivateKey(prefixed0X);
            const addr4 = EVM.getAddressByPrivateKey(padded0x);
            expect(addr2).toBe(addr1);
            expect(addr3).toBe(addr1);
            expect(addr4).toBe(addr1);
            expect(EVM.validatePrivateKey(prefixed0x)).toBe(true);
            expect(EVM.validatePrivateKey(prefixed0X)).toBe(true);
            expect(EVM.validatePrivateKey(padded0x)).toBe(true);
        });

        test("Bitcoin derives same address with and without 0x prefix", () => {
            const addr1 = BTC.getAddressByPrivateKey(rawHexKey, "p2wpkh");
            const addr2 = BTC.getAddressByPrivateKey(prefixed0x, "p2wpkh");
            const addr3 = BTC.getAddressByPrivateKey(prefixed0X, "p2wpkh");
            const addr4 = BTC.getAddressByPrivateKey(padded0x, "p2wpkh");
            expect(addr2).toBe(addr1);
            expect(addr3).toBe(addr1);
            expect(addr4).toBe(addr1);
            expect(BTC.validatePrivateKey(prefixed0x)).toBe(true);
            expect(BTC.validatePrivateKey(prefixed0X)).toBe(true);
            expect(BTC.validatePrivateKey(padded0x)).toBe(true);
        });

        test("Tron derives same address with and without 0x prefix", () => {
            const addr1 = Tron.getAddressByPrivateKey(rawHexKey);
            const addr2 = Tron.getAddressByPrivateKey(prefixed0x);
            const addr3 = Tron.getAddressByPrivateKey(prefixed0X);
            expect(addr2).toBe(addr1);
            expect(addr3).toBe(addr1);
            expect(Tron.validatePrivateKey(prefixed0x)).toBe(true);
            expect(Tron.validatePrivateKey(prefixed0X)).toBe(true);
        });

        test("Aptos derives same address with and without 0x prefix", () => {
            const addr1 = Aptos.getAddressByPrivateKey(rawHexKey);
            const addr2 = Aptos.getAddressByPrivateKey(prefixed0x);
            const addr3 = Aptos.getAddressByPrivateKey(prefixed0X);
            expect(addr2).toBe(addr1);
            expect(addr3).toBe(addr1);
            expect(Aptos.validatePrivateKey(prefixed0x)).toBe(true);
            expect(Aptos.validatePrivateKey(prefixed0X)).toBe(true);
        });

        test("Sui derives same address with and without 0x prefix", () => {
            const addr1 = Sui.getAddressByPrivateKey(rawHexKey);
            const addr2 = Sui.getAddressByPrivateKey(prefixed0x);
            const addr3 = Sui.getAddressByPrivateKey(prefixed0X);
            expect(addr2).toBe(addr1);
            expect(addr3).toBe(addr1);
            expect(Sui.validatePrivateKey(prefixed0x)).toBe(true);
            expect(Sui.validatePrivateKey(prefixed0X)).toBe(true);
        });

        test("Solana derives same address with and without 0x prefix", () => {
            const addr1 = Solana.getAddressByPrivateKey(rawHexKey);
            const addr2 = Solana.getAddressByPrivateKey(prefixed0x);
            const addr3 = Solana.getAddressByPrivateKey(prefixed0X);
            expect(addr2).toBe(addr1);
            expect(addr3).toBe(addr1);
            expect(Solana.validatePrivateKey(prefixed0x)).toBe(true);
            expect(Solana.validatePrivateKey(prefixed0X)).toBe(true);
        });

        test("TON derives same address with and without 0x prefix", () => {
            const addr1 = Ton.getAddressByPrivateKey(rawHexKey);
            const addr2 = Ton.getAddressByPrivateKey(prefixed0x);
            const addr3 = Ton.getAddressByPrivateKey(prefixed0X);
            expect(addr2).toBe(addr1);
            expect(addr3).toBe(addr1);
            expect(Ton.validatePrivateKey(prefixed0x)).toBe(true);
            expect(Ton.validatePrivateKey(prefixed0X)).toBe(true);
        });

        test("Near derives same address with and without 0x prefix", () => {
            const addr1 = Near.getAddressByPrivateKey(rawHexKey);
            const addr2 = Near.getAddressByPrivateKey(prefixed0x);
            const addr3 = Near.getAddressByPrivateKey(prefixed0X);
            expect(addr2).toBe(addr1);
            expect(addr3).toBe(addr1);
            expect(Near.validatePrivateKey(prefixed0x)).toBe(true);
            expect(Near.validatePrivateKey(prefixed0X)).toBe(true);
        });

        test("Filecoin derives same address with and without 0x prefix", () => {
            const addr1 = Filecoin.getAddressByPrivateKey(rawHexKey, "secp256k1");
            const addr2 = Filecoin.getAddressByPrivateKey(prefixed0x, "secp256k1");
            const addr3 = Filecoin.getAddressByPrivateKey(prefixed0X, "secp256k1");
            expect(addr2).toBe(addr1);
            expect(addr3).toBe(addr1);
            expect(Filecoin.validatePrivateKey(prefixed0x)).toBe(true);
            expect(Filecoin.validatePrivateKey(prefixed0X)).toBe(true);
        });
    });

    describe('Cross-Chain Edge Cases', () => {
        test('should handle case-insensitive hex for all chains', () => {
            const lowerKey = '1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727';
            const upperKey = '1AB42CC412B618BDEA3A599E3C9BAE199EBF030895B039E9DB1E30DAFB12B727';
            const mixedKey = '1Ab42Cc412B618BdEa3a599E3c9BaE199EbF030895B039E9dB1e30DaFb12B727';

            expect(EVM.validatePrivateKey(lowerKey)).toBe(true);
            expect(EVM.validatePrivateKey(upperKey)).toBe(true);
            expect(EVM.validatePrivateKey(mixedKey)).toBe(true);

            expect(BTC.validatePrivateKey(lowerKey)).toBe(true);
            expect(BTC.validatePrivateKey(upperKey)).toBe(true);
            expect(BTC.validatePrivateKey(mixedKey)).toBe(true);

            expect(Tron.validatePrivateKey(lowerKey)).toBe(true);
            expect(Tron.validatePrivateKey(upperKey)).toBe(true);
            expect(Tron.validatePrivateKey(mixedKey)).toBe(true);
        });

        test('should reject null and undefined for all chains', () => {
            expect(EVM.validatePrivateKey(null as any)).toBe(false);
            expect(EVM.validatePrivateKey(undefined as any)).toBe(false);

            expect(BTC.validatePrivateKey(null as any)).toBe(false);
            expect(BTC.validatePrivateKey(undefined as any)).toBe(false);

            expect(Solana.validatePrivateKey(null as any)).toBe(false);
            expect(Solana.validatePrivateKey(undefined as any)).toBe(false);
        });

        test('should validate wallet-generated private keys', () => {
            const evmWallet = EVM.createWallet();
            expect(EVM.validatePrivateKey(evmWallet.privateKey)).toBe(true);

            const btcWallet = BTC.createWallet();
            expect(BTC.validatePrivateKey(btcWallet.privateKey)).toBe(true);

            const aptosWallet = Aptos.createWallet();
            expect(Aptos.validatePrivateKey(aptosWallet.privateKey)).toBe(true);

            const tonWallet = Ton.createWallet();
            expect(Ton.validatePrivateKey(tonWallet.privateKey)).toBe(true);

            const nearWallet = Near.createWallet();
            expect(Near.validatePrivateKey(nearWallet.privateKey)).toBe(true);
        });
    });
});
