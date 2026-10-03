import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from './storage';

describe('wallet-extension Storage & Crypto Vault Suite', () => {
  const password = 'SuperSecretMasterPassword123!';
  const testPayload = JSON.stringify({
    version: 1,
    wallets: [
      {
        id: 'w-1',
        name: 'Account 1',
        mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
      },
    ],
  });

  it('encrypts and decrypts payload successfully with correct password', async () => {
    const encrypted = await encrypt(testPayload, password);

    expect(encrypted.data).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.salt).toBeDefined();
    expect(encrypted.data).not.toContain('abandon');

    const decrypted = await decrypt(encrypted, password);
    expect(decrypted).toBe(testPayload);

    const parsed = JSON.parse(decrypted);
    expect(parsed.wallets[0].id).toBe('w-1');
  });

  it('generates unique salt and iv for each encryption run', async () => {
    const enc1 = await encrypt(testPayload, password);
    const enc2 = await encrypt(testPayload, password);

    expect(enc1.salt).not.toBe(enc2.salt);
    expect(enc1.iv).not.toBe(enc2.iv);
    expect(enc1.data).not.toBe(enc2.data);
  });

  it('fails decryption when provided with wrong password', async () => {
    const encrypted = await encrypt(testPayload, password);
    await expect(decrypt(encrypted, 'WrongPassword999!')).rejects.toThrow(
      'Invalid password or corrupted data'
    );
  });

  it('fails decryption if ciphertext is tampered', async () => {
    const encrypted = await encrypt(testPayload, password);
    const tampered = {
      ...encrypted,
      data: '00' + encrypted.data.slice(2),
    };

    await expect(decrypt(tampered, password)).rejects.toThrow(
      'Invalid password or corrupted data'
    );
  });
});
