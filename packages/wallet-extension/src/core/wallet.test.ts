import { describe, it, expect } from 'vitest';
import {
  generateMnemonic,
  validateMnemonic,
  deriveAddress,
  deriveAllAddresses,
  createWallet,
  importWalletFromPrivateKey,
  normalizePrivateKey,
  getPrivateKey,
  createNextAccount,
  exportAccountPrivateKey,
  exportWalletMnemonic
} from './wallet';
import { addCustomNetwork, getCustomNetworks, deleteCustomNetwork } from './networks';
import browser from 'webextension-polyfill';
import { ChainType } from '../types';

describe('wallet-extension Wallet Core Integration Suite', () => {
  it('generates valid 12-word mnemonic', () => {
    const mnemonic = generateMnemonic(12);
    const words = mnemonic.trim().split(/\s+/);
    expect(words.length).toBe(12);
    expect(validateMnemonic(mnemonic)).toBe(true);
  });

  it('generates valid 24-word mnemonic', () => {
    const mnemonic = generateMnemonic(24);
    const words = mnemonic.trim().split(/\s+/);
    expect(words.length).toBe(24);
    expect(validateMnemonic(mnemonic)).toBe(true);
  });

  it('correctly rejects invalid mnemonic strings', () => {
    expect(validateMnemonic('')).toBe(false);
    expect(validateMnemonic('invalid word list that is not in bip39 dictionary')).toBe(false);
    expect(validateMnemonic('hello world test')).toBe(false);
  });
});

describe('wallet-extension Multi-Chain Derivation Suite', () => {
  const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

  it('derives correct addresses for supported blockchains', async () => {
    const evmAddr = await deriveAddress(mnemonic, ChainType.EVM, 0);
    expect(evmAddr.startsWith('0x')).toBe(true);
    expect(evmAddr.length).toBe(42);

    const btcAddr = await deriveAddress(mnemonic, ChainType.BITCOIN, 0);
    expect(btcAddr.startsWith('bc1') || btcAddr.startsWith('1') || btcAddr.startsWith('3')).toBe(true);

    const solAddr = await deriveAddress(mnemonic, ChainType.SOLANA, 0);
    expect(solAddr.length).toBeGreaterThan(30);

    const tronAddr = await deriveAddress(mnemonic, ChainType.TRON, 0);
    expect(tronAddr.startsWith('T')).toBe(true);
  });

  it('derives all 9 chain accounts for a wallet', async () => {
    const addressesMap = await deriveAllAddresses(mnemonic, 0);
    const keys = Object.keys(addressesMap);
    expect(keys.length).toBe(9);

    expect(addressesMap[ChainType.EVM]).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(addressesMap[ChainType.BITCOIN]).toMatch(/^bc1/);
    expect(addressesMap[ChainType.TRON]).toMatch(/^T/);
    expect(addressesMap[ChainType.SOLANA].length).toBeGreaterThan(30);
  });

  it('creates encrypted wallet and stores in vault', async () => {
    const password = 'StrongPassword888!';
    const wallet = await createWallet(password, mnemonic);

    expect(wallet.id).toBeDefined();
    expect(wallet.accounts.length).toBe(1);
    expect(Object.keys(wallet.accounts[0].addresses).length).toBe(9);
    expect(wallet.accounts[0].addresses[ChainType.EVM]).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });
});

describe('wallet-extension Private Key Import and 0x Prefix Suite', () => {
  const password = 'StrongPassword888!';
  const rawKey = '1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727';
  const keyWith0x = '0x' + rawKey;
  const keyWith0X = '0X' + rawKey;
  const paddedKey = '   0x' + rawKey + '   ';

  it('normalizes hex private keys with various 0x prefixes and padding', () => {
    expect(normalizePrivateKey(rawKey)).toBe(rawKey);
    expect(normalizePrivateKey(keyWith0x)).toBe(rawKey);
    expect(normalizePrivateKey(keyWith0X)).toBe(rawKey);
    expect(normalizePrivateKey(paddedKey)).toBe(rawKey);
  });

  it('successfully imports wallet from private key with 0x prefix', async () => {
    const wallet = await importWalletFromPrivateKey(password, keyWith0x, ChainType.EVM);

    expect(wallet.id).toBeDefined();
    expect(wallet.type).toBe('privateKey');
    expect(wallet.accounts.length).toBe(1);

    const evmAddress = wallet.accounts[0].addresses[ChainType.EVM];
    expect(evmAddress).toBeDefined();
    expect(evmAddress.startsWith('0x')).toBe(true);
    expect(evmAddress.length).toBe(42);

    // Exported private key can be retrieved
    const exported = await getPrivateKey(password, wallet.accounts[0].id, ChainType.EVM);
    expect(exported).toBe(rawKey);
  });

  it('prevents duplicate import whether 0x prefix is included or not', async () => {
    // Attempting to re-import without 0x prefix should be recognized as duplicate
    await expect(importWalletFromPrivateKey(password, rawKey, ChainType.EVM)).rejects.toThrow(
      'Private key already imported'
    );

    // Attempting to re-import with padding and 0x should also be rejected
    await expect(importWalletFromPrivateKey(password, paddedKey, ChainType.EVM)).rejects.toThrow(
      'Private key already imported'
    );
  });
});

describe('wallet-extension Multi-Account Derivation and Export Suite', () => {
  const password = 'StrongPassword888!';
  const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

  it('creates multi-derived accounts under the same mnemonic wallet', async () => {
    const wallet = await createWallet(password, mnemonic);
    expect(wallet.accounts.length).toBe(1);

    const account2 = await createNextAccount(wallet.id, password, 'Account 2');
    expect(account2.index).toBe(1);
    expect(account2.name).toBe('Account 2');
    expect(account2.addresses[ChainType.EVM]).not.toBe(wallet.accounts[0].addresses[ChainType.EVM]);

    const account3 = await createNextAccount(wallet.id, password, 'Account 3');
    expect(account3.index).toBe(2);
    expect(account3.addresses[ChainType.EVM]).not.toBe(account2.addresses[ChainType.EVM]);
  });

  it('securely exports account private key and mnemonic after authentication', async () => {
    const wallet = await createWallet(password, mnemonic);
    const exportedMnemonic = await exportWalletMnemonic(password, wallet.id);
    expect(exportedMnemonic).toBe(mnemonic);

    const exportedPK = await exportAccountPrivateKey(password, wallet.accounts[0].id, ChainType.EVM);
    expect(exportedPK).toBeDefined();
    expect(exportedPK.length).toBe(64);
  });

  it('manages custom EVM networks', async () => {
    const customNet = {
      id: 'custom_999',
      name: 'Test Sidechain',
      chainType: 'evm' as any,
      chainId: 999,
      rpcUrl: 'https://test-rpc.example.com',
      nativeCurrency: { name: 'TEST', symbol: 'TEST', decimals: 18 }
    };

    await addCustomNetwork(customNet);
    const networks = await getCustomNetworks();
    expect(networks.some(n => n.chainId === 999)).toBe(true);

    await deleteCustomNetwork('custom_999');
    const updatedNetworks = await getCustomNetworks();
    expect(updatedNetworks.some(n => n.chainId === 999)).toBe(false);
  });
});
