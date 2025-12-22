import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,} from "@/components/ui/sheet"
import React, {useEffect} from "react";
import {useTelegram} from "../hooks/useTelegram.tsx";
import {Textarea} from "./ui/textarea.tsx";
import {Button} from "./ui/button.tsx";
import {useTranslation} from "react-i18next";

interface CommentsSheetProps {
    text?: string;
    label: string;
    onChangeText: (text?: string) => void;
}

export function CommentsSheet({
    label,
                                  children,
                                  text,
                                  onChangeText
                              }: React.PropsWithChildren<CommentsSheetProps>) {
    const {t} = useTranslation();
    const {vibro} = useTelegram();
    const [_text, setText] = React.useState<string | undefined>(text);
    const [_opened, setOpened] = React.useState(false);

    // Синхронизируем локальное состояние с пропсом только при открытии окна
    useEffect(() => {
        if (_opened) {
            setText(text || '');
        }
    }, [_opened, text]);

    const handleOpenChange = (opened: boolean) => {
        if (opened) {
            vibro();
            setText(text || '');
        }
        setOpened(opened);
    }

    const handleOnSubmit = async () => {
        onChangeText(_text);
        setOpened(false);
    }

    return (
        <Sheet onOpenChange={handleOpenChange} open={_opened}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent side="bottom">
                <SheetHeader>
                    <SheetTitle className="text-xl font-bold text-tg-theme-text-color text-left">{label}</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col flex-1">
                    <Textarea value={_text || ''} onChange={e => setText(e.target.value)}
                              className="mt-2 mb-2 rounded-md resize-none text-[16px]" rows={4}/>
                </div>
                <div className="flex flex-col flex-1">
                    <Button
                        wide
                        size="lg"
                        onClick={handleOnSubmit}
                    >
                        {t('save')}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
