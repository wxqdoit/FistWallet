import { createContext, type ReactNode, useEffect, useMemo, useState } from 'react';
import { type Locals } from '../../types/configType';
import i18n from '../../locals/i18n';

interface I18nProviderProps {
	children: ReactNode;
	language?: Locals;
}

export const detectedBrowserLocale = () => {
	if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
		if (navigator.languages?.length) {
			return navigator.languages[0];
		}

		if (navigator.language) {
			return navigator.language;
		}
	}
	return '';
};

export const I18nContext = createContext<{ i18n: typeof i18n }>({ i18n });

export const I18nProvider = ({ children, language }: I18nProviderProps) => {
	const [updateCount, setUpdateCount] = useState(0);

	const browserLocale: Locals = useMemo(() => {
		return detectedBrowserLocale() as Locals;
	}, []);

	useEffect(() => {
		i18n.on('languageChanged', () => {
			setUpdateCount(count => count + 1);
		});
	}, []);

	useEffect(() => {
		if (language && language !== i18n.language) {
			i18n.changeLanguage(language);
		} else if (!language && browserLocale && browserLocale !== i18n.language) {
			i18n.changeLanguage(browserLocale);
		}
	}, [language, browserLocale]);

	const memoizedValue = useMemo(() => {
		const t = (key: string, options?: any) => i18n.t(key, options);
		return { t, i18n };
	}, [updateCount]);

	return <I18nContext.Provider value={memoizedValue}>{children}</I18nContext.Provider>;
};
