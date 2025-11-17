import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,} from "@/components/ui/sheet"
import React, {useEffect} from "react";
import {useTelegram} from "../hooks/useTelegram.tsx";
import {Textarea} from "./ui/textarea.tsx";
import {Button} from "./ui/button.tsx";

interface CommentsSheetProps {
    text?: string;
    onChangeText: (text?: string) => void;
}

export function CommentsSheet({
                                  children,
                                  text,
                                  onChangeText
                              }: React.PropsWithChildren<CommentsSheetProps>) {
    const {vibro} = useTelegram();
    const [_text, setText] = React.useState<string | undefined>(text);
    const [_opened, setOpened] = React.useState(false);

    const clearState = () => setText(undefined)

    useEffect(() => {
        if (text) {
            setText(text);
            setOpened(true);
        } else {
            clearState();
        }
    }, [text]);

    const handleOpenChange = (opened: boolean) => {
        opened ? vibro() : null;
        setOpened(opened)
        if (!opened) {
            onChangeText(undefined);
        }
    }


    const handleOnSubmit = async () => {
        onChangeText(_text);
        setOpened(false)
        clearState();
    }

    return (
        <Sheet onOpenChange={handleOpenChange} open={_opened}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent side="bottom">
                <SheetHeader>
                    <SheetTitle className="text-xl font-bold text-tg-theme-text-color text-left">Пожелание к
                        заказу</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col flex-1">
                    <Textarea value={text} onChange={e => setText(e.target.value)}
                              className="mt-2 mb-2 rounded-md resize-none text-[16px]" rows={4}/>
                </div>
                <div className="flex flex-col flex-1">
                    <Button
                        wide
                        size="lg"
                        onClick={handleOnSubmit}
                    >
                        Сохранить
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
} 