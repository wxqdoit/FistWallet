import { describe, it, expect, vi } from 'vitest';
import {
  createDefaultAdapterRegistry,
  createAdapterRegistry,
  MetamaskAdapter,
  FistWalletAdapter,
  WalletConnectAdapter,
  PhantomAdapter,
  OkxAdapter,
  UnisatAdapter,
  TronLinkAdapter,
  LedgerAdapter,
  ChainType,
  AdapterError,
  ADAPTER_ERROR_CODES,
  BaseAdapter,
  type WalletAdapter,
  rememberConnectedWallet,
  getRememberedWallet,
  clearRememberedWallet,
  parseRpcError,
} from './index';

describe('wallet-apdater Suite', () => {
  describe('Adapter Registry', () => {
    it('creates registry and lists default adapters', () => {
      const { registry, stop } = createDefaultAdapterRegistry();
      const allAdapters = registry.list();
      expect(allAdapters.length).toBeGreaterThan(0);

      // Verify popular adapters exist by RDNS
      const metamask = allAdapters.find((a) => a.info.rdns === 'io.metamask');
      expect(metamask).toBeDefined();
      expect(metamask?.info.name).toBe('Metamask');

      const okx = allAdapters.find((a) => a.info.rdns === 'com.okex.wallet');
      expect(okx).toBeDefined();

      const phantom = allAdapters.find((a) => a.info.rdns === 'app.phantom');
      expect(phantom).toBeDefined();

      stop();
    });

    it('subscribes to adapter updates', () => {
      const registry = createAdapterRegistry();
      const subscriber = vi.fn();
      const unsub = registry.subscribe(subscriber);

      // Initially called with empty or existing adapters
      expect(subscriber).toHaveBeenCalled();

      registry.refresh();
      expect(subscriber).toHaveBeenCalledTimes(2);

      unsub();
      registry.refresh();
      expect(subscriber).toHaveBeenCalledTimes(2);
    });

    it('supports custom adapter factory in registry', () => {
      const customFactory = {
        rdns: 'org.custom.wallet',
        create: () => ({
          info: {
            rdns: 'org.custom.wallet',
            name: 'Custom Wallet',
            installed: true,
          },
          supports: [ChainType.EVM],
          connect: vi.fn(),
          disconnect: vi.fn(),
        }),
      };

      const registry = createAdapterRegistry([customFactory]);
      registry.refresh();
      const list = registry.list();
      expect(list.length).toBe(1);
      expect(list[0]?.info.name).toBe('Custom Wallet');
      expect(list[0]?.supports).toContain(ChainType.EVM);
    });
  });

  describe('BaseAdapter Event and Chain Handling', () => {
    class MockAdapter extends BaseAdapter {
      info = {
        rdns: 'test.mock.wallet',
        name: 'Mock Wallet',
        installed: true,
      };
      supports = [ChainType.EVM];

      constructor() {
        super();
        this.providers.set(ChainType.EVM, {
          connect: vi.fn().mockResolvedValue({
            address: '0x123',
            chainType: ChainType.EVM,
          }),
          disconnect: vi.fn().mockResolvedValue(undefined),
          on: (event: string, listener: any) => {
            (this as any)[`emit_${event}`] = listener;
            return () => {
              delete (this as any)[`emit_${event}`];
            };
          },
        });
      }
    }

    it('connects to supported chain successfully', async () => {
      const adapter = new MockAdapter();
      const account = await adapter.connect({ chainType: ChainType.EVM });
      expect(account.address).toBe('0x123');
      expect(account.chainType).toBe(ChainType.EVM);
    });

    it('throws UNSUPPORTED_CHAIN when connecting unsupported chain', async () => {
      const adapter = new MockAdapter();
      let caught: any;
      try {
        await adapter.connect({ chainType: ChainType.SOL });
      } catch (err) {
        caught = err;
      }
      expect(caught).toBeInstanceOf(AdapterError);
      expect(caught.code).toBe(ADAPTER_ERROR_CODES.UNSUPPORTED_CHAIN);
    });

    it('handles event listeners through onAccountChanged and onNetworkChanged', () => {
      const adapter = new MockAdapter();
      const accountCb = vi.fn();
      const unsub = adapter.onAccountChanged(accountCb);

      const trigger = (adapter as any)['emit_accountsChanged'];
      expect(trigger).toBeDefined();

      trigger(['0xabc']);
      expect(accountCb).toHaveBeenCalledWith(['0xabc']);

      unsub();
      expect((adapter as any)['emit_accountsChanged']).toBeUndefined();
    });
  });

  describe('Error Hierarchy', () => {
    it('creates AdapterError with code and details', () => {
      const err = new AdapterError(
        ADAPTER_ERROR_CODES.WALLET_NOT_INSTALLED,
        'Wallet is not installed in the browser'
      );
      expect(err.code).toBe(ADAPTER_ERROR_CODES.WALLET_NOT_INSTALLED);
      expect(err.message).toBe('Wallet is not installed in the browser');
      expect(err.name).toBe('AdapterError');
    });
  });

  describe('Specific Adapters Initialization & Detection', () => {
        it('instantiates FistWalletAdapter correctly', () => {
      const adapter = new FistWalletAdapter();
      expect(adapter.info.rdns).toBe('io.fistwallet');
      expect(adapter.info.name).toBe('FistWallet');
      expect(adapter.supports).toContain(ChainType.EVM);
      expect(adapter.supports).toContain(ChainType.SOL);
      expect(adapter.supports).toContain(ChainType.BTC);
      expect(adapter.supports).toContain(ChainType.TRON);
      expect(adapter.supports).toContain(ChainType.APTOS);
      expect(adapter.supports).toContain(ChainType.SUI);
    });

    it('instantiates MetamaskAdapter correctly', () => {
      const adapter = new MetamaskAdapter();
      expect(adapter.info.rdns).toBe('io.metamask');
      expect(adapter.info.name).toBe('Metamask');
      expect(adapter.supports).toContain(ChainType.EVM);
    });

    it('instantiates PhantomAdapter correctly', () => {
      const adapter = new PhantomAdapter();
      expect(adapter.info.rdns).toBe('app.phantom');
      expect(adapter.info.name).toBe('Phantom');
      expect(adapter.supports).toContain(ChainType.SOL);
      expect(adapter.supports).toContain(ChainType.BTC);
      expect(adapter.supports).toContain(ChainType.EVM);
    });

    it('instantiates UnisatAdapter correctly', () => {
      const adapter = new UnisatAdapter();
      expect(adapter.info.rdns).toBe('io.unisat');
      expect(adapter.info.name).toBe('UniSat');
      expect(adapter.supports).toContain(ChainType.BTC);
    });

    it('instantiates TronLinkAdapter correctly', () => {
      const adapter = new TronLinkAdapter();
      expect(adapter.info.rdns).toBe('org.tronlink');
      expect(adapter.info.name).toBe('TronLink');
      expect(adapter.supports).toContain(ChainType.TRON);
    });

    it('throws WALLET_NOT_INSTALLED when connecting without browser provider', async () => {
      const adapter = new MetamaskAdapter();
      await expect(adapter.connect({ chainType: ChainType.EVM })).rejects.toThrow();
    });

    it("instantiates and connects WalletConnectAdapter", async () => {
      let capturedUri = "";
      const adapter = new WalletConnectAdapter({
        qrUriHandler: (uri) => { capturedUri = uri; }
      });
      expect(adapter.info.rdns).toBe("org.walletconnect");
      expect(adapter.info.name).toBe("WalletConnect");
      expect(adapter.supports).toContain(ChainType.EVM);
      expect(adapter.supports).toContain(ChainType.SOL);

      const account = await adapter.connect({ chainType: ChainType.EVM, chainId: 1 });
      expect(account.chainType).toBe(ChainType.EVM);
      expect(capturedUri.startsWith("wc:")).toBe(true);

      await adapter.disconnect();
    });

    it('manages remembered wallet connections in storage', () => {
      clearRememberedWallet();
      expect(getRememberedWallet()).toBeNull();

      rememberConnectedWallet('io.metamask', ChainType.EVM);
      const remembered = getRememberedWallet();
      expect(remembered?.adapterId).toBe('io.metamask');
      expect(remembered?.chainType).toBe(ChainType.EVM);

      clearRememberedWallet();
      expect(getRememberedWallet()).toBeNull();
    });

    it('parses standard RPC errors accurately', () => {
      const userRejection = parseRpcError({ code: 4001, message: 'User rejected the request.' });
      expect(userRejection.isUserRejection).toBe(true);
      expect(userRejection.code).toBe(4001);

      const chainError = parseRpcError({ code: 4902, message: 'Unrecognized chain ID.' });
      expect(chainError.isChainNotAdded).toBe(true);

      const unauthorized = parseRpcError({ code: 4100, message: 'The requested account has not been authorized' });
      expect(unauthorized.isUnauthorized).toBe(true);
    });

    it('instantiates and connects LedgerAdapter', async () => {
      const statuses: string[] = [];
      const adapter = new LedgerAdapter({
        onStatusChange: (status) => statuses.push(status),
      });

      expect(adapter.info.rdns).toBe('com.ledger');
      expect(adapter.info.name).toBe('Ledger');
      expect(adapter.supports).toContain(ChainType.EVM);
      expect(adapter.supports).toContain(ChainType.SOL);
      expect(adapter.supports).toContain(ChainType.BTC);

      const evmAccount = await adapter.connect({ chainType: ChainType.EVM, chainId: 1 });
      expect(evmAccount.address).toMatch(/^0x/);
      expect(evmAccount.chainType).toBe(ChainType.EVM);
      expect(statuses).toContain('waiting_device');
      expect(statuses).toContain('connected');

      const solAccount = await adapter.connect({ chainType: ChainType.SOL });
      expect(solAccount.chainType).toBe(ChainType.SOL);

      const btcAccount = await adapter.connect({ chainType: ChainType.BTC });
      expect(btcAccount.chainType).toBe(ChainType.BTC);
      expect(btcAccount.address).toMatch(/^bc1/);

      const txResult = await adapter.sendTransaction({
        chainType: ChainType.EVM,
        transaction: { to: '0x123', value: '100' },
      });
      expect(txResult.hash).toBeDefined();

      await adapter.disconnect();
    });

  });
});

