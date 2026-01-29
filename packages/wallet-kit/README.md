# wallet-kit

A React-based TypeScript library for connecting web3 wallets, supporting multiple chains (EVM, Solana, BTC) via a unified strategy pattern.

## 🛠 Technology Stack

- **Core:** React 18, TypeScript
- **State Management:** Zustand (with persistence)
- **Styling:** Tailwind CSS, @react-spring/web (animations)
- **UI Components:** @reach/dialog (accessibility)
- **Internationalization:** i18next, react-i18next
- **Wallet Discovery:** mipd (EIP-6963) via `wallet-apdater`
- **Build Tool:** Vite (library mode) + TypeScript declarations

## 📂 Project Structure

```text
src/
├── components/       # UI Components (ConnectButton, Modal, etc.)
├── adapters/         # Adapter registry + icons
├── chains/           # Chain definitions (EVM, BTC, SOL)
├── hooks/            # React Hooks (useAccount, useDisconnect, etc.)
├── locals/           # i18n configuration and resources
├── state/            # Global state management (Zustand)
└── types/            # UI-level types
```

## 📦 Dependencies Notes

- **Core Dependencies:** `react`, `react-dom`, `wallet-apdater` (EIP-6963 discovery + adapters).
- **Styling:** Tailwind CSS with PostCSS.
- **Translation:** `i18next-xhr-backend` loads locales at runtime; evaluate whether bundling JSON is preferred for your distribution model.

## 🧪 Test Coverage

**Status: ⚠️ Critical Missing**

- Although `@testing-library/react` and `jest-dom` are present in `devDependencies`, **no test files (`*.test.ts`, `*.spec.ts`) were found** in the codebase.
- **Action Item:** Urgent need to implement unit tests, especially for:
  - `src/core/strategy` (logic is complex here)
  - `src/state/store.ts` (state persistence and updates)

## ♻️ Refactoring & Improvements

1.  **Explicit Typing:** Ensure `zustand` stores remain strictly typed.
2.  **Translation Strategy:** Review `i18next-xhr-backend`. For a library, shipping JSON files or using a memory backend might be more robust than runtime fetches.
3.  **Bundle Review:** Confirm `wallet-apdater` is externalized in consuming apps to avoid duplicate dependencies.

## 🚀 Performance & Security

- **Performance:**
  - Check bundle size impact of `@react-spring/web` if animations are minimal.
- **Security:**
  - `localStorage` is used to persist connection state (`WALLET_KIT_APP`). This is generally safe for non-sensitive data (like "connected address"), but ensure no private keys or signing capabilities are ever stored here.
