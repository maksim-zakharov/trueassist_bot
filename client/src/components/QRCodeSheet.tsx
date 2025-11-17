import {useTelegram} from "../hooks/useTelegram.tsx";
import React from "react";
import {Button} from "./ui/button.tsx";
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "../components/ui/sheet.tsx";
import {QRCodeSVG} from "qrcode.react";
import {Share} from "lucide-react";
import {Typography} from "./ui/Typography.tsx";
import {SafeAreaBottom} from "./SafeAreaBottom.tsx";

export const QRCodeSheet = ({children, url, onClick}) => {

    const {vibro} = useTelegram();

    const [_opened, setOpened] = React.useState(false);

    const handleOpenChange = (opened: boolean) => {
        opened ? vibro() : null;
        setOpened(opened)
    }

    return (
        <Sheet onOpenChange={handleOpenChange} open={_opened}>
            <SheetTrigger asChild onClick={() => setOpened(true)}>
                {children}
            </SheetTrigger>
            <SheetContent side="bottom">
                <SheetHeader>
                    <SheetTitle
                        className="text-xl font-bold text-tg-theme-text-color text-left">Show the QR-code to your friends</SheetTitle>
                    <Typography.Description>If someone registers through the link, you both get a bonus</Typography.Description>
                </SheetHeader>
                <div className="flex gap-4 mt-4 mb-4 justify-center">
                    <QRCodeSVG
                        value={url}
                        size="80%"
                        className="rounded-3xl"
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="L"
                        includeMargin={true}
                    />
                </div>
                <SafeAreaBottom>
                    <Button
                        wide
                        size="lg"
                        onClick={onClick}
                    >
                        <Share className="w-5 h-5 mr-2" />Share
                    </Button>
                </SafeAreaBottom>
            </SheetContent>
        </Sheet>
    )
}