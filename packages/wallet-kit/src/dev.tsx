import React from 'react';
import { createRoot } from 'react-dom/client';
import { WalletKitProvider } from './components/WalletKitProvider';
import './styles.css';

function App() {
  return (
    <WalletKitProvider>
      <div className="p-6 text-sm text-neutral-800">wallet-kit dev preview</div>
    </WalletKitProvider>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
