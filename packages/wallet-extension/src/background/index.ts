import browser from 'webextension-polyfill';
import type { Message, Response, MessageType } from '../types';

console.log('FistWallet background service worker initialized');

/**
 * Handle messages from popup and content scripts
 */
browser.runtime.onMessage.addListener((message: Message, sender) => {
    console.log('Background received message:', message.type, 'from:', sender);

    return handleMessage(message);
});

/**
 * Message handler
 */
async function handleMessage(message: Message): Promise<Response> {
    try {
        switch (message.type) {
            case 'CREATE_WALLET' as MessageType:
                // Handled by popup directly
                return { success: true };

            case 'UNLOCK_WALLET' as MessageType:
                // Handled by popup directly
                return { success: true };

            case 'SEND_TRANSACTION' as MessageType:
                // TODO: Implement transaction sending
                return { success: false, error: 'Not implemented' };

            case 'SIGN_MESSAGE' as MessageType:
                // TODO: Implement message signing
                return { success: false, error: 'Not implemented' };

            case 'CONNECT_DAPP' as MessageType:
                // TODO: Implement DApp connection
                return { success: false, error: 'Not implemented' };

            default:
                return { success: false, error: 'Unknown message type' };
        }
    } catch (error) {
        console.error('Error handling message:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Handle extension installation
 */
browser.runtime.onInstalled.addListener((details) => {
    console.log('FistWallet installed:', details.reason);

    if (details.reason === 'install') {
        // Open welcome page on first install
        browser.tabs.create({
            url: browser.runtime.getURL('index.html'),
        });
    }
});

/**
 * Keep service worker alive
 */
setInterval(() => {
    console.log('Service worker heartbeat');
}, 20000);
