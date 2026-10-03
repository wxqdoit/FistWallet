/**
 * Security & Phishing Detection Engine
 * Guarding against malicious DApps, zero address transfers, and phishing attacks
 */

const KNOWN_SUSPICIOUS_KEYWORDS = [
    'airdrop-claim',
    'free-mint',
    'drainer',
    'token-claim',
    'wallet-connect-fix',
    'support-desk-crypto',
    'validate-key',
    'sync-phrase',
];

export interface OriginSecurityResult {
    isSafe: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    reason?: string;
}

export function checkOriginSecurity(origin: string): OriginSecurityResult {
    if (!origin) return { isSafe: true, riskLevel: 'low' };

    try {
        const url = new URL(origin);

        // Localhost and internal extensions are always safe
        if (
            url.hostname === 'localhost' ||
            url.hostname === '127.0.0.1' ||
            url.protocol === 'chrome-extension:' ||
            url.protocol === 'moz-extension:'
        ) {
            return { isSafe: true, riskLevel: 'low' };
        }

        // Flag unencrypted HTTP for remote sites
        if (url.protocol === 'http:') {
            return {
                isSafe: false,
                riskLevel: 'high',
                reason: 'Unencrypted HTTP connection detected. Never connect to insecure sites.',
            };
        }

        // Flag punycode homograph attack domains (e.g. xn--...)
        if (url.hostname.includes('xn--')) {
            return {
                isSafe: false,
                riskLevel: 'high',
                reason: 'Suspicious internationalized domain name (possible homograph phishing attempt).',
            };
        }

        // Flag suspicious keywords
        const lowerHostname = url.hostname.toLowerCase();
        for (const kw of KNOWN_SUSPICIOUS_KEYWORDS) {
            if (lowerHostname.includes(kw)) {
                return {
                    isSafe: false,
                    riskLevel: 'high',
                    reason: `Domain matches phishing pattern keyword: "${kw}".`,
                };
            }
        }

        return { isSafe: true, riskLevel: 'low' };
    } catch {
        return { isSafe: false, riskLevel: 'medium', reason: 'Malformed domain URL' };
    }
}

export interface RecipientSecurityResult {
    isSafe: boolean;
    warning?: string;
}

export function checkRecipientSecurity(recipient: string, senderAddress?: string): RecipientSecurityResult {
    const clean = recipient.trim().toLowerCase();

    // Check zero address
    if (clean === '0x0000000000000000000000000000000000000000') {
        return {
            isSafe: false,
            warning: 'Recipient is the zero address (0x0). Assets sent here will be burned permanently.',
        };
    }

    // Check dead address
    if (clean === '0x000000000000000000000000000000000000dead') {
        return {
            isSafe: false,
            warning: 'Recipient is a known burn address (0x...dEaD). Assets cannot be recovered.',
        };
    }

    // Check self-transfer
    if (senderAddress && clean === senderAddress.trim().toLowerCase()) {
        return {
            isSafe: true,
            warning: 'Note: You are transferring funds to your own current address.',
        };
    }

    return { isSafe: true };
}
