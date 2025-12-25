import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "./ui/sheet.tsx";
import {ListButton} from "./ListButton/ListButton.tsx";
import {ChevronRight, Languages} from "lucide-react";
import {useTranslation} from "react-i18next";
import {useState} from "react";
import {Button} from "./ui/button.tsx";
import {Typography} from "./ui/Typography.tsx";
import i18n from "../i18n";

interface LanguageOption {
    code: string;
    name: string;
    nativeName: string;
}

const languages: LanguageOption[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
];

export const LanguageSelector = () => {
    const {t, i18n: i18nInstance} = useTranslation();
    const [open, setOpen] = useState(false);
    const currentLang = i18nInstance.language;

    const getCurrentLanguageName = () => {
        const lang = languages.find(l => l.code === currentLang);
        return lang ? lang.nativeName : currentLang.toUpperCase();
    };

    const handleLanguageChange = (langCode: string) => {
        i18n.changeLanguage(langCode);
        setOpen(false);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <ListButton
                    icon={<Languages className="p-1 w-7 h-7 bg-[var(--tg-accent-blue)] rounded-md"/>}
                    text={t('language')}
                    extra={
                        <div className="flex items-center gap-2">
                            <span className="text-tg-theme-hint-color text-sm">{getCurrentLanguageName()}</span>
                            <ChevronRight className="w-5 h-5 text-tg-theme-hint-color opacity-50"/>
                        </div>
                    }
                />
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
                <SheetHeader>
                    <SheetTitle className="text-xl font-bold text-tg-theme-text-color text-left">
                        {t('select_language')}
                    </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-4">
                    {languages.map((lang) => (
                        <Button
                            key={lang.code}
                            variant={currentLang === lang.code ? "default" : "ghost"}
                            className={`w-full justify-start text-left ${
                                currentLang === lang.code ? 'bg-tg-theme-button-color' : ''
                            }`}
                            onClick={() => handleLanguageChange(lang.code)}
                        >
                            <div className="flex flex-col items-start w-full">
                                <Typography.Title className="text-base font-medium">
                                    {lang.nativeName}
                                </Typography.Title>
                                <Typography.Description className="text-xs text-tg-theme-hint-color">
                                    {lang.name}
                                </Typography.Description>
                            </div>
                            {currentLang === lang.code && (
                                <div className="ml-auto w-2 h-2 rounded-full bg-tg-theme-button-text-color"/>
                            )}
                        </Button>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
};

