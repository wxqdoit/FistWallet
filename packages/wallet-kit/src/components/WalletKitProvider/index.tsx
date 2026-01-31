import { type ReactNode } from 'react';
import { ChainProvider } from './ChainProvider';
import { ConnectModal } from '../Modal/ConnectModal';
import useStore from '../../state/store';
import { I18nProvider } from './I18nProvider';
import { ChainType } from 'wallet-apdater';
import {AppModal, type Locals, type Theme} from '../../types/configType';
import { WalletKitThemeProvider } from './ThemeProvider';

interface IWalletKitProvider {
	children: ReactNode;
	language?: Locals;
	defaultChainId?: number | string;
	defaultChainType?: ChainType;
	theme?: Theme;
}

export function WalletKitProvider({ children, language, defaultChainId, defaultChainType,theme }: IWalletKitProvider) {
	const useModalIsOpen = useStore((state: any) => state.modalIsOpen(AppModal.ConnectModal));
	return (
		<ChainProvider defaultChainId={defaultChainId} defaultChainType={defaultChainType}>
			<I18nProvider language={language}>
				<WalletKitThemeProvider theme={theme}>
					<ConnectModal isOpen={useModalIsOpen} />
					<div>{children}</div>
				</WalletKitThemeProvider>
			</I18nProvider>
		</ChainProvider>
	);
}
