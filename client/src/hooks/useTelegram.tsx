import {createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {RoutePaths} from "../routes.ts";

export const safeTgHeight =
    window.innerHeight -
    Telegram.WebApp?.contentSafeAreaInset.bottom -
    Telegram.WebApp?.contentSafeAreaInset.top;

Telegram.WebApp?.ready();

interface TelegramContextType {
    isReady: boolean;
    error?: string;
    tg: typeof Telegram.WebApp;
    isOpenKeyboard: boolean;
    bottomOffset: number;
    photoUrl?: string;
    vibro: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    colorScheme?: string;
    onBackButtonClick: (callback: () => void) => void;
    deleteLastBackButtonCallback: () => void
    clearBackButtonEvents: () => void
    getLastBackButtonCallback: () => (() => void) | undefined;
    hideBackButton: () => void
    user: TelegramUser | null;
    userId?: number;
}

interface TelegramUser {
    id?: number;
    photo_url?: string;
    // добавьте другие необходимые свойства пользователя
}

interface TelegramProviderProps {
    children: ReactNode;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export const TelegramProvider = ({children}: TelegramProviderProps) => {
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<string>();
    const [isOpenKeyboard, setOpenKeyboard] = useState(false);
    const [bottomOffset, setBottomOffset] = useState(0);
    const events = useRef<{ [eventType: string]: (() => void)[] }>({});

    const isReady = (!isLoading && !error);

    const onThemeChangedHandler = useCallback(() => {
        const colorScheme = Telegram.WebApp?.colorScheme;
        if (colorScheme === 'dark') {
            document.documentElement.classList.add('dark');
            Telegram.WebApp.setHeaderColor(
                getComputedStyle(document.documentElement)
                    .getPropertyValue('--tg-theme-bg-color')
                    .trim()
            );
        } else {
            document.documentElement.classList.remove('dark');
            Telegram.WebApp.setHeaderColor(
                getComputedStyle(document.documentElement)
                    .getPropertyValue('--tg-theme-secondary-bg-color')
                    .trim()
            );
        }
    }, []);

    const vibro = useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
        Telegram.WebApp.HapticFeedback?.impactOccurred(style);
    }, []);

    const onKeyboard = useCallback(() => {
        const offset = safeTgHeight - Telegram.WebApp?.viewportHeight;
        setOpenKeyboard(offset > 200);
        setBottomOffset(offset);
    }, []);

    const onEvent = (eventType: string, callback: () => void) => {
        if (!events.current[eventType])
            events.current[eventType] = [];
        events.current[eventType].push(callback);
        Telegram.WebApp.onEvent(eventType as never, callback);
    }

    const onBackButtonClick = (callback: () => void) => {
        onEvent('backButtonClicked', callback)
        Telegram.WebApp?.BackButton?.show();
    }

    const clearEvent = (eventType: string) => {
        if(events.current[eventType]){
            events.current[eventType].forEach(callback => Telegram.WebApp.offEvent(eventType as never, callback))
            events.current[eventType] = [];
        }
    }

    const clearBackButtonEvents = () => clearEvent('backButtonClicked');

    const hideBackButton = () => {
        clearBackButtonEvents()
        Telegram.WebApp?.BackButton?.hide();
    }

    const getLastBackButtonCallback = () => events.current['backButtonClicked']?.slice(-1)[0]

    const deleteLastBackButtonCallback = () => {
        const lastCallback = getLastBackButtonCallback();
        if(!lastCallback){
            return;
        }
        Telegram.WebApp.offEvent('backButtonClicked', lastCallback);
        events.current['backButtonClicked'] = events.current['backButtonClicked'].filter(callback => callback !== lastCallback);
    }

    useEffect(() => {
        Telegram.WebApp?.ready();
        Telegram.WebApp?.expand(); // Развернуть на весь экран
        Telegram.WebApp?.enableClosingConfirmation(); // Опционально: подтверждение перед закрытием
    }, []);

    useEffect(() => {
        let tryies = 0;
        const check = () => {
            tryies++;
            if (Telegram.WebApp?.themeParams?.bg_color) {
                setLoading(false);
                return;
            }
            if (tryies > 30) {
                setLoading(false);
                setError('Telegram.WebApp not found');
                return;
            }
            setTimeout(check, 100);
        };

        check();
    }, []);

    useEffect(() => {
        if (!isReady) return;

        Telegram.WebApp.onEvent('themeChanged', onThemeChangedHandler);
        onThemeChangedHandler();

        Telegram.WebApp.SettingsButton.onClick(() => navigate(RoutePaths.Profile));
        Telegram.WebApp.SettingsButton.show();

        return () => {
            Telegram.WebApp.offEvent('themeChanged', onThemeChangedHandler);
        };
    }, [isReady, navigate, onThemeChangedHandler]);

    useEffect(() => {
        Telegram.WebApp.onEvent('viewportChanged', onKeyboard);
        return () => {
            Telegram.WebApp.offEvent('viewportChanged', onKeyboard);
        };
    }, [onKeyboard]);

    const value = {
        isReady,
        error,
        tg: Telegram.WebApp,
        isOpenKeyboard,
        bottomOffset,
        photoUrl: Telegram.WebApp?.initDataUnsafe?.user?.photo_url,
        vibro,
        colorScheme: Telegram.WebApp?.colorScheme,
        onBackButtonClick: onBackButtonClick,
        deleteLastBackButtonCallback,
        clearBackButtonEvents,
        getLastBackButtonCallback,
        hideBackButton,
        user: Telegram.WebApp?.initDataUnsafe?.user ?? null,
        userId: Telegram.WebApp?.initDataUnsafe?.user?.id,
    };

    return (
        <TelegramContext.Provider value={value}>
            {children}
        </TelegramContext.Provider>
    );
};

export function useTelegram() {
    const context = useContext(TelegramContext);
    if (!context) {
        throw new Error('useTelegram must be used within a TelegramProvider');
    }
    return context;
}

export const useBackButton = (callback: () => void) => {
    const {onBackButtonClick, deleteLastBackButtonCallback} = useTelegram();

    useEffect(() => {
        deleteLastBackButtonCallback();
        onBackButtonClick(callback)
    }, []);
}