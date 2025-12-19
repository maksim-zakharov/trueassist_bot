import {Header} from "../../components/ui/Header.tsx";
import {Typography} from "../../components/ui/Typography.tsx";
import React from "react";
import {useTranslation} from "react-i18next";
import {Button} from "../../components/ui/button.tsx";
import { QrCode} from "lucide-react";
import {useSelector} from "react-redux";
import {useGetBonusesQuery} from "../../api/api.ts";
import {QRCodeSheet} from "../../components/QRCodeSheet.tsx";
import {InvitesList} from "../../components/InvitesList.tsx";
import {BonusTotal, BonusTotalSkeleton} from "../../components/BonusTotal.tsx";

export const GiftsPage = () => {
    const {t} = useTranslation();
    const userInfo = useSelector(state => state.createOrder.userInfo);
    const {data: bonuses = [], isLoading, isSuccess} = useGetBonusesQuery();

    const inviteLink = `https://t.me/trueassist_bot?startapp=ref_${userInfo.id}`;

    const handleShareButtonClick = async () => {
        const text = t('bonuses_title');

        try {
            await navigator.share({
                title: text,
                text: text,
                url: inviteLink, // Опционально
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }

    if(isLoading){
        return <div className="pt-[56px] px-4">
            <BonusTotalSkeleton/>
        </div>
    }

    return <>
        <Header className="grid grid-cols-3">
            <div>
                <QRCodeSheet onClick={handleShareButtonClick} url={inviteLink}>
                    <Button className="p-0 border-none h-100%" variant="default" size="sm">
                        <QrCode className="w-6 h-6 mr-2"/>
                    </Button>
                </QRCodeSheet>
            </div>
            <Typography.Title
                className="items-center flex justify-center">{t('menu_item_gifts')}</Typography.Title>
        </Header>
        <div className="px-4">
            <BonusTotal bonuses={bonuses}/>
        </div>
        <img src="../img_1.png" className="h-[240px] object-cover mb-4"/>
        <div className="content px-4 w-full">
            <div className="flex flex-col gap-4">
                <Typography.H2 className="text-3xl m-0 text-center">{t('bonuses_title')}</Typography.H2>

                <Typography.Title className="text-center">{t('bonuses_description')}</Typography.Title>
                <Button
                    wide
                    size="lg"
                    onClick={handleShareButtonClick}
                >
                    {t('bonuses_recommended_btn')}
                </Button>
            </div>
        </div>

        <Typography.H2 className="p-4 pb-0">
            {t('bonuses_invites_title')}
        </Typography.H2>
        <InvitesList invites={bonuses} isSuccess={isSuccess} isLoading={isLoading}/>
    </>
}
