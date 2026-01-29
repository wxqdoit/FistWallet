import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './resources';

// i18n.use(LanguageDetector)
i18n.use(initReactI18next).init({
	resources,
	react: {
		useSuspense: true
	},
	fallbackLng: 'en',
	preload: ['zh-CN', 'en', 'zh', 'en-US'],
	keySeparator: false,
	interpolation: {
		escapeValue: false
	}
});

export default i18n;
