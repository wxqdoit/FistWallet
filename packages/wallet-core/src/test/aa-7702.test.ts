import { EVM } from '../index';
import type { UserOperation, EIP7702Authorization } from '../types';

describe('Account Abstraction (ERC-4337) and EIP-7702 in wallet-core', () => {
    const testPrivateKey = '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f361b97';
    const testSender = '0xa508dD875f10C33C52a8abb20E16fc04400dec05';
    const entryPoint = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
    const chainId = 1;

    it('calculates deterministic UserOperation hash and signs it', () => {
        const userOp: UserOperation = {
            sender: testSender,
            nonce: 0n,
            initCode: '0x',
            callData: '0x',
            callGasLimit: 100000n,
            verificationGasLimit: 150000n,
            preVerificationGas: 21000n,
            maxFeePerGas: 2000000000n,
            maxPriorityFeePerGas: 1000000000n,
            paymasterAndData: '0x',
        };

        const hash = EVM.getUserOperationHash(userOp, entryPoint, chainId);
        expect(hash).toMatch(/^0x[a-f0-9]{64}$/i);

        const signedOp = EVM.signUserOperation(userOp, testPrivateKey, entryPoint, chainId);
        expect(signedOp.signature).toBeDefined();
        expect(signedOp.signature).toMatch(/^0x[a-f0-9]{130}$/i);

        const packed = EVM.packUserOperation(signedOp);
        expect(packed.sender).toBe(testSender);
        expect(packed.signature).toBe(signedOp.signature);
    });

    it('signs EIP-7702 delegation authorization payload', () => {
        const auth: EIP7702Authorization = {
            chainId: 1,
            address: '0x1234567890123456789012345678901234567890',
            nonce: 0n,
        };

        const hash = EVM.hashAuthorization(auth, 1);
        expect(hash).toMatch(/^0x[a-f0-9]{64}$/i);

        const signedAuth = EVM.signAuthorization(auth, testPrivateKey, 1);
        expect(signedAuth.r).toMatch(/^0x[a-f0-9]{64}$/i);
        expect(signedAuth.s).toMatch(/^0x[a-f0-9]{64}$/i);
        expect([0, 1]).toContain(signedAuth.yParity);
    });
});
