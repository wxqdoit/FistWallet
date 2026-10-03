import { EVM, BTC, Solana, Aptos, Tron } from "../index";
import { sha256 } from "@noble/hashes/sha256";

describe("wallet-core Advanced Production Features Suite", () => {
    describe("EVM EIP-712 Typed Data", () => {
        const mailTypedData = {
            types: {
                EIP712Domain: [
                    { name: "name", type: "string" },
                    { name: "version", type: "string" },
                    { name: "chainId", type: "uint256" },
                    { name: "verifyingContract", type: "address" }
                ],
                Person: [
                    { name: "name", type: "string" },
                    { name: "wallet", type: "address" }
                ],
                Mail: [
                    { name: "from", type: "Person" },
                    { name: "to", type: "Person" },
                    { name: "contents", type: "string" }
                ]
            },
            primaryType: "Mail",
            domain: {
                name: "Ether Mail",
                version: "1",
                chainId: 1,
                verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC"
            },
            message: {
                from: { name: "Cow", wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826" },
                to: { name: "Bob", wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB" },
                contents: "Hello, Bob!"
            }
        };

        const pk = "4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f360318";
        const expectedAddress = EVM.getAddressByPrivateKey(pk);

        it("hashes, signs and verifies EIP-712 structured typed data", () => {
            const digest = EVM.hashTypedData(mailTypedData);
            expect(digest).toBeInstanceOf(Uint8Array);
            expect(digest.length).toBe(32);

            const signature = EVM.signTypedData(pk, mailTypedData);
            expect(signature.startsWith("0x")).toBe(true);
            expect(signature.length).toBe(132);

            const isValid = EVM.verifyTypedData(mailTypedData, signature, expectedAddress);
            expect(isValid).toBe(true);

            const isInvalid = EVM.verifyTypedData(mailTypedData, signature, "0x0000000000000000000000000000000000000000");
            expect(isInvalid).toBe(false);
        });
    });

    describe("EVM EIP-1559 (Type 2) Transactions", () => {
        const pk = "4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f360318";

        it("signs EIP-1559 transaction starting with 0x02 prefix", () => {
            const tx = {
                type: 2,
                chainId: 1,
                nonce: 5,
                maxPriorityFeePerGas: "0x3b9aca00", // 1 Gwei
                maxFeePerGas: "0x77359400",         // 2 Gwei
                gasLimit: "0x5208",                 // 21000
                to: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
                value: "0xde0b6b3a7640000",         // 1 ETH
                data: "0x"
            };

            const signed = EVM.signTransaction(pk, tx);
            expect(signed.startsWith("0x02")).toBe(true);
            expect(signed.length).toBeGreaterThan(100);
        });
    });

    describe("Bitcoin Taproot & Schnorr", () => {
        const pk = "cbe1b1fd32eccd265e4a324f218664402bec7fdc69e9789d4a90fd102d61d04a";

        it("derives valid BIP-341 Taproot address with bc1p prefix", () => {
            const taprootAddr = BTC.getAddressByPrivateKey(pk, "p2tr");
            expect(taprootAddr.startsWith("bc1p")).toBe(true);
            expect(taprootAddr.length).toBe(62);
            expect(BTC.validateAddress(taprootAddr)).toBe(true);
        });

        it("signs and verifies 64-byte BIP-340 Schnorr signatures", () => {
            const message = sha256(new TextEncoder().encode("Test Schnorr message"));
            const pubKey = BTC.getPublicKey(pk);
            const xOnlyPub = pubKey.slice(2); // 32-byte x-only

            const sig = BTC.signSchnorr(pk, message);
            expect(sig.length).toBe(128); // 64 bytes in hex

            const verified = BTC.verifySchnorr(sig, message, xOnlyPub);
            expect(verified).toBe(true);
        });
    });

    describe("Solana Versioned Transactions (v0)", () => {
        const pk = "4uEVpuX7DjNsCxdfosipqApHbWHweGVjxqj5GJxQNSMsbjJ3CyyQBHsp1MUs5ej5qQhurjH6FtwLpado6PqmpbeQ";
        const payerPub = Solana.getAddressByPrivateKey(pk);

        it("serializes v0 message and signs versioned transaction", () => {
            const v0Message = {
                header: {
                    numRequiredSignatures: 1,
                    numReadonlySignedAccounts: 0,
                    numReadonlyUnsignedAccounts: 1
                },
                staticAccountKeys: [
                    payerPub,
                    "11111111111111111111111111111111" // System Program
                ],
                recentBlockhash: "GfV4P8gK9g1eTqN4yYf8N5pW2sD9vK3k4mF1qW7jE8tZ",
                compiledInstructions: [
                    {
                        programIdIndex: 1,
                        accountKeyIndexes: [0],
                        data: new Uint8Array([2, 0, 0, 0])
                    }
                ]
            };

            const serializedMsg = Solana.serializeV0Message(v0Message);
            expect(serializedMsg[0]).toBe(0x80); // Version 0 flag

            const signedTx = Solana.signVersionedTransaction([pk], v0Message);
            expect(signedTx).toBeInstanceOf(Uint8Array);
            expect(signedTx.length).toBeGreaterThan(serializedMsg.length);
        });
    });

    describe("Custom HD Derivation Paths", () => {
        const mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

        it("derives different keys for different custom paths", () => {
            const key1 = EVM.getPrivateKeyByMnemonic(mnemonic, "m/44'/60'/0'/0/0");
            const key2 = EVM.getPrivateKeyByMnemonic(mnemonic, "m/44'/60'/0'/0/1");
            const keyCustom = EVM.getPrivateKeyByMnemonic(mnemonic, "m/44'/60'/99'/0/0");

            expect(key1.privateKey).not.toBe(key2.privateKey);
            expect(key1.privateKey).not.toBe(keyCustom.privateKey);

            const btcKey1 = BTC.getPrivateKeyByMnemonic(mnemonic, "m/84'/0'/0'/0/0");
            const btcKeyCustom = BTC.getPrivateKeyByMnemonic(mnemonic, "m/86'/0'/0'/0/0");
            expect(btcKey1.privateKey).not.toBe(btcKeyCustom.privateKey);
        });
    });

    describe("BIP-39 Passphrase Support (25th Word)", () => {
        const mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

        it("derives different master seed and keys when passphrase is provided", () => {
            const walletNoPass = EVM.getPrivateKeyByMnemonic(mnemonic);
            const walletWithPass = EVM.getPrivateKeyByMnemonic(mnemonic, undefined, "my-secret-passphrase");
            const walletWithOtherPass = EVM.getPrivateKeyByMnemonic(mnemonic, undefined, "other-passphrase");

            expect(walletNoPass.privateKey).not.toBe(walletWithPass.privateKey);
            expect(walletWithPass.privateKey).not.toBe(walletWithOtherPass.privateKey);
            expect(walletNoPass.publicKey).not.toBe(walletWithPass.publicKey);

            const btcNoPass = BTC.getPrivateKeyByMnemonic(mnemonic);
            const btcWithPass = BTC.getPrivateKeyByMnemonic(mnemonic, undefined, "my-secret-passphrase");
            expect(btcNoPass.privateKey).not.toBe(btcWithPass.privateKey);

            const solNoPass = Solana.getPrivateKeyByMnemonic(mnemonic);
            const solWithPass = Solana.getPrivateKeyByMnemonic(mnemonic, undefined, "my-secret-passphrase");
            expect(solNoPass).not.toBe(solWithPass);
        });
    });

    describe("EVM Signature Recovery Utilities", () => {
        const pk = "4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f360318";
        const expectedAddress = EVM.getAddressByPrivateKey(pk);

        it("recovers signer address accurately from personal_sign signature", () => {
            const message = "Sign in to FistWallet Production DApp";
            const signature = EVM.signMessage(pk, message);

            const recoveredAddress = EVM.recoverPersonalSignature(message, signature);
            expect(recoveredAddress.toLowerCase()).toBe(expectedAddress.toLowerCase());
        });

        it("recovers signer address accurately from EIP-712 typed data signature", () => {
            const typedData = {
                types: {
                    EIP712Domain: [{ name: "name", type: "string" }],
                    Message: [{ name: "action", type: "string" }]
                },
                primaryType: "Message",
                domain: { name: "RecoveryTest" },
                message: { action: "ApproveSwap" }
            };

            const signature = EVM.signTypedData(pk, typedData);
            const recoveredAddress = EVM.recoverTypedSignature(typedData, signature);
            expect(recoveredAddress.toLowerCase()).toBe(expectedAddress.toLowerCase());
        });
    });

    describe("Solana verifyMessage", () => {
        const pk = "4uEVpuX7DjNsCxdfosipqApHbWHweGVjxqj5GJxQNSMsbjJ3CyyQBHsp1MUs5ej5qQhurjH6FtwLpado6PqmpbeQ";
        const pubKey = Solana.getAddressByPrivateKey(pk);

        it("verifies solana message signature with verifyMessage alias", () => {
            const message = "Solana Authenticate Message";
            const signature = Solana.signMessage(pk, message);
            const isValid = Solana.verifyMessage(message, signature, pubKey);
            expect(isValid).toBe(true);
        });
    });
});
