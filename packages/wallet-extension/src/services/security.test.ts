import { describe, it, expect } from 'vitest';
import { checkOriginSecurity, checkRecipientSecurity } from './security';

describe('Security & Phishing Guard', () => {
    it('allows localhost and local dev environments', () => {
        const res = checkOriginSecurity('http://localhost:5173');
        expect(res.isSafe).toBe(true);
        expect(res.riskLevel).toBe('low');
    });

    it('flags unencrypted remote HTTP sites as unsafe', () => {
        const res = checkOriginSecurity('http://my-crypto-site.com');
        expect(res.isSafe).toBe(false);
        expect(res.riskLevel).toBe('high');
        expect(res.reason).toContain('Unencrypted HTTP');
    });

    it('flags homograph punycode domains', () => {
        const res = checkOriginSecurity('https://xn--uniswp-yva.org');
        expect(res.isSafe).toBe(false);
        expect(res.riskLevel).toBe('high');
        expect(res.reason).toContain('homograph');
    });

    it('flags phishing pattern keywords', () => {
        const res = checkOriginSecurity('https://airdrop-claim-now.xyz');
        expect(res.isSafe).toBe(false);
        expect(res.riskLevel).toBe('high');
        expect(res.reason).toContain('airdrop-claim');
    });

    it('approves legitimate HTTPS domains', () => {
        const res = checkOriginSecurity('https://app.uniswap.org');
        expect(res.isSafe).toBe(true);
        expect(res.riskLevel).toBe('low');
    });

    it('identifies zero address and burn address transfers', () => {
        const zeroCheck = checkRecipientSecurity('0x0000000000000000000000000000000000000000');
        expect(zeroCheck.isSafe).toBe(false);
        expect(zeroCheck.warning).toContain('zero address');

        const burnCheck = checkRecipientSecurity('0x000000000000000000000000000000000000dEaD');
        expect(burnCheck.isSafe).toBe(false);
        expect(burnCheck.warning).toContain('burn address');
    });

    it('flags self-transfers with a friendly note', () => {
        const check = checkRecipientSecurity(
            '0x63d902123456789012345678901234567890d548',
            '0x63d902123456789012345678901234567890d548'
        );
        expect(check.isSafe).toBe(true);
        expect(check.warning).toContain('own current address');
    });
});
