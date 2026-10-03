import { describe, it, expect, beforeEach, vi } from 'vitest';
import useStore from './state/store';
import useProvidersStore from './state/providers';
import { AppModal, Theme, Locals } from './types/configType';
import { ChainType } from 'wallet-apdater';

describe('wallet-kit Store and State Management', () => {
  beforeEach(() => {
    // Reset state before each test
    useStore.setState({
      chain: null,
      modalStatus: null,
      language: null,
      theme: null,
      account: null,
    });
    localStorage.clear();
  });

  it('manages modal open/close state transitions', () => {
    expect(useStore.getState().modalStatus).toBeNull();

    useStore.getState().toggleModal(AppModal.ConnectModal);
    expect(useStore.getState().modalStatus).toBe(AppModal.ConnectModal);

    // Toggling again should close it
    useStore.getState().toggleModal(AppModal.ConnectModal);
    expect(useStore.getState().modalStatus).toBeNull();

    (useStore.getState() as any).openConnectModal();
    expect(useStore.getState().modalStatus).toBe(AppModal.ConnectModal);

    (useStore.getState() as any).closeModal();
    expect(useStore.getState().modalStatus).toBeNull();
  });

  it('manages theme and language preferences', () => {
    (useStore.getState() as any).setTheme('darkMode');
    expect(useStore.getState().theme).toBe('darkMode');

    (useStore.getState() as any).setLanguage('en');
    expect(useStore.getState().language).toBe('en');
  });

  it('manages current active chain and account data', () => {
    useStore.getState().setChain({
      id: 1,
      name: 'Ethereum Mainnet',
      type: ChainType.EVM,
      isMainnet: true,
    });

    expect(useStore.getState().chain).toEqual({
      id: 1,
      name: 'Ethereum Mainnet',
      type: ChainType.EVM,
      isMainnet: true,
    });

    useStore.getState().setAccount({
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      chainType: ChainType.EVM,
      chainId: 1,
      walletRdns: 'io.metamask',
      status: 'connected',
    });

    const account = useStore.getState().account;
    expect(account).toBeDefined();
    expect(account?.address).toBe('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
    expect(account?.status).toBe('connected');
  });

  it('manages provider registry in useProvidersStore', () => {
    const mockProvider = {
      info: { rdns: 'test.wallet', name: 'Test Wallet', installed: true },
      supports: [ChainType.EVM],
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    useProvidersStore.getState().setProviders([mockProvider as any]);
    expect(useProvidersStore.getState().providers.length).toBe(1);

    useProvidersStore.getState().setConnectedProvider(mockProvider as any);
    expect(useProvidersStore.getState().connectedProvider?.info.rdns).toBe('test.wallet');
  });

  it('handles hook exports cleanly', async () => {
    const { useSwitchChain, useSignTypedData, useSignMessage, useChain, useAutoReconnect } = await import('./index');
    expect(typeof useSwitchChain).toBe('function');
    expect(typeof useSignTypedData).toBe('function');
    expect(typeof useSignMessage).toBe('function');
    expect(typeof useChain).toBe('function');
    expect(typeof useAutoReconnect).toBe('function');
  });
});
