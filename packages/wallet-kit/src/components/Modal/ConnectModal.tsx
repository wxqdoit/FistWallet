import ModalHeader from '../Header/ModalHeader';
import Modal from './index';
import { useTranslation } from 'react-i18next';
import useStore from '../../state/store';
import { type WalletAdapter } from 'wallet-apdater';
import { AppModal, ConnectStatus } from '../../types/configType';
import useProvidersStore from '../../state/providers';
import Icon from '../Icon';
import { adapterIconMap } from '../../adapters/icons';
import { DialogDescription, DialogTitle } from '../ui/dialog';

interface ModalProps {
    isOpen: boolean;
    closeAble?: boolean;
}

export function ConnectModal({isOpen}: ModalProps) {
    const {t} = useTranslation();
    const {chain, setAccount, toggleModal} = useStore()
    const {providers, setConnectedProvider} = useProvidersStore()

    const handleConnect = async (provider: WalletAdapter) => {
        if (!chain || !chain.type) return
        const res = await provider.connect({chainId: chain.id, chainType: chain.type})
        setAccount({
            ...res,
            walletRdns: provider.info.rdns,
            status: ConnectStatus.connected
        })
        setConnectedProvider(provider)
        toggleModal(AppModal.ConnectModal)
    }
    return (
        <Modal isOpen={isOpen} maxHeight={90}>
            <div className="flex max-h-[90vh] flex-col">
                <DialogTitle className="sr-only">{t('title') || 'Connect Wallet'}</DialogTitle>
                <DialogDescription className="sr-only">
                    Select a wallet to connect to this application.
                </DialogDescription>
                <div className="sticky top-0 z-10 bg-white px-5 pt-5">
                    <ModalHeader text={t('title')}/>
                </div>
                <div className="wallet-kit-scrollbar flex-1 overflow-y-auto px-5 pb-5 pt-4">
                    <div className="mx-auto flex flex-col gap-3">
                        {providers && providers.map((provider) => {
                            const iconSrc = provider.info.icon ?? adapterIconMap[provider.info.rdns] ?? '';
                            const installed = provider.info.installed;
                            return (
                                <button
                                    key={provider.info.rdns}
                                    type="button"
                                    disabled={!installed}
                                    className={`flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-left transition-colors ${
                                        installed ? 'bg-slate-50 hover:bg-slate-100' : 'cursor-not-allowed bg-slate-100/70 opacity-70'
                                    }`}
                                    onClick={() => {
                                        if (installed) handleConnect(provider);
                                    }}
                                >
                                    <div className="flex w-full items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm">
                                            <Icon isRadius={false} src={iconSrc}/>
                                        </div>
                                        <span className="flex flex-1 items-center justify-between text-sm font-medium text-slate-800">
											<span>{provider.info.name}</span>
											<span className={`text-xs ${installed ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                {installed ? 'Installed' : 'Not installed'}
                                            </span>
										</span>
                                    </div>
                                </button>
                            );
                        })}

                    </div>

                </div>
            </div>
        </Modal>
    );
}


export function useOpenConnectModal() {
    const openConnectModal = useStore((state: any) => state.openConnectModal);
    const useModalIsOpen = useStore((state: any) => state.modalIsOpen(AppModal.ConnectModal));
    return {
        connectModalOpen: useModalIsOpen,
        openConnectModal
    };
}

export function useCloseConnectModal() {
    const closeConnectModal = useStore((state: any) => state.closeModal(AppModal.ConnectModal));
    return {
        closeConnectModal
    };
}
