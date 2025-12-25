import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

const LANGUAGE_STORAGE_KEY = 'language';

const getInitialLanguage = (): string => {
    // 1. Проверяем localStorage (если пользователь уже выбирал язык)
    const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLang) {
        return savedLang;
    }

    // 2. Проверяем URL параметр (если пользователь перешел по ссылке)
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && (urlLang === 'en' || urlLang === 'ru')) {
        return urlLang;
    }

    // 3. Берем язык из Telegram (если доступен)
    const tgLang = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
    if (tgLang) {
        const langCode = tgLang.split('-')[0].toLowerCase();
        if (langCode === 'ru' || langCode === 'en') {
            return langCode;
        }
    }

    // 4. Fallback на английский
    return 'en';
};

const initialLanguage = getInitialLanguage();

i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
        lng: initialLanguage,
        fallbackLng: 'en',
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        backend: {
            loadPath: '/locales/{{lng}}.json',
        }
    });

// Сохраняем язык в localStorage при изменении
i18n.on('languageChanged', (lng) => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
});

export default i18n;