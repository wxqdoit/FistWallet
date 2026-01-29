import { type ReactNode, useMemo } from 'react';
import { type Theme } from '../../types/configType';

interface IWalletKitThemeProvider {
	theme?: Theme;
	children: ReactNode;
}

export function WalletKitThemeProvider({ theme, children }: IWalletKitThemeProvider) {
	const themeClassName = useMemo(() => {
		return theme === 'darkMode' ? 'wallet-kit-theme dark' : 'wallet-kit-theme';
	}, [theme]);
	return <div className={themeClassName}>{children}</div>;
}
