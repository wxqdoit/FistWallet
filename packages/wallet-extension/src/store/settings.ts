import { create } from 'zustand';
import { getStorage, setStorage } from '@core/storage';
import type { AppSettings, LanguageCode, ThemeMode } from '@/types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '@/types';

interface SettingsState extends AppSettings {
    isLoaded: boolean;
    initialize: () => Promise<void>;
    setTheme: (theme: ThemeMode) => Promise<void>;
    language: LanguageCode;
    theme: ThemeMode;
    autoLockMinutes:number;
    setLanguage: (language: LanguageCode) => Promise<void>;
    setAutoLockMinutes: (minutes: number) => Promise<void>;
}

const clampMinutes = (value: number): number => {
    if (!Number.isFinite(value)) {
        return DEFAULT_SETTINGS.autoLockMinutes;
    }
    return Math.min(Math.max(Math.round(value), 1), 1440);
};

const mergeSettings = (stored: Partial<AppSettings> | null): AppSettings => ({
    ...DEFAULT_SETTINGS,
    ...(stored ?? {}),
});

export const useSettingsStore = create<SettingsState>((set, get) => ({
    ...DEFAULT_SETTINGS,
    isLoaded: false,
    initialize: async () => {
        if (get().isLoaded) {
            return;
        }
        const stored = await getStorage<AppSettings>(STORAGE_KEYS.SETTINGS);
        const nextSettings = mergeSettings(stored);
        await setStorage(STORAGE_KEYS.SETTINGS, nextSettings);
        set({ ...nextSettings, isLoaded: true });
    },
    setTheme: async (theme: ThemeMode) => {
        const nextSettings = { ...get(), theme };
        await setStorage(STORAGE_KEYS.SETTINGS, {
            theme: nextSettings.theme,
            language: nextSettings.language,
            autoLockMinutes: nextSettings.autoLockMinutes,
        });
        set({ theme: nextSettings.theme });
    },
    setLanguage: async (language: LanguageCode) => {
        const nextSettings = { ...get(), language };
        await setStorage(STORAGE_KEYS.SETTINGS, {
            theme: nextSettings.theme,
            language: nextSettings.language,
            autoLockMinutes: nextSettings.autoLockMinutes,
        });
        set({ language: nextSettings.language });
    },
    setAutoLockMinutes: async (minutes: number) => {
        const safeMinutes = clampMinutes(minutes);
        const nextSettings = { ...get(), autoLockMinutes: safeMinutes };
        await setStorage(STORAGE_KEYS.SETTINGS, {
            theme: nextSettings.theme,
            language: nextSettings.language,
            autoLockMinutes: nextSettings.autoLockMinutes,
        });
        set({ autoLockMinutes: nextSettings.autoLockMinutes });
    },
}));
