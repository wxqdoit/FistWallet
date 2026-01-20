/**
 * Content script - Injected into web pages
 * This script bridges communication between the page and the extension
 */

console.log('FistWallet content script loaded');

// Inject the provider script into the page
const script = document.createElement('script');
script.src = chrome.runtime.getURL('src/content/injected.ts');
script.onload = function () {
    (this as HTMLScriptElement).remove();
};
(document.head || document.documentElement).appendChild(script);

/**
 * Listen for messages from the injected script
 */
window.addEventListener('message', async (event) => {
    // Only accept messages from the same window
    if (event.source !== window) return;

    // Only accept messages from our injected script
    if (event.data.target !== 'fistwallet-contentscript') return;

    console.log('Content script received message from page:', event.data);

    // Forward to background script
    try {
        const response = await chrome.runtime.sendMessage(event.data.message);

        // Send response back to page
        window.postMessage({
            target: 'fistwallet-inpage',
            id: event.data.id,
            response,
        }, '*');
    } catch (error) {
        console.error('Error forwarding message:', error);
        window.postMessage({
            target: 'fistwallet-inpage',
            id: event.data.id,
            response: { success: false, error: (error as Error).message },
        }, '*');
    }
});

console.log('FistWallet content script ready');
