import {EmptyState} from "./EmptyState.tsx";
import {GiftIcon} from "lucide-react";
import {Skeleton} from "./ui/skeleton.tsx";
import {Card} from "./ui/card.tsx";
import {Typography} from "./ui/Typography.tsx";
import dayjs from "dayjs";
import React from "react";
import {useTranslation} from "react-i18next";
import {moneyFormat} from "../lib/utils.ts";

export const InvitesList = ({invites, isSuccess, isLoading}) => {
    const {t} = useTranslation();

    if (isLoading) {
        return <Skeleton className="w-full h-[200px] rounded-none"/>;
    }

    if (!invites?.length && isSuccess) {
        return <EmptyState icon={<GiftIcon/>} title={t('bonuses_invites_empty_title')}
                           description={t("bonuses_invites_empty_description")}/>;
    }

    const typeLabel:  {[key: string]: string} = {
        'INVITE': 'Bring a friend',
        "GIFT": 'Gift',
        "ORDER": 'Order'
    }

    return <div className="flex flex-col gap-2 pb-3 pt-2 px-3">
        {invites.map(ao =>
            <Card className="p-0 gap-0 pl-4">
                <div className="p-3 pl-0">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <Typography.Title>{typeLabel[ao.type] || 'Gift'}</Typography.Title>
                            <Typography.Description>{ao.description}</Typography.Description>
                        </div>
                        <div className="flex flex-col text-right">
                            <Typography.Title>{moneyFormat(ao.value)}</Typography.Title>
                            <Typography.Description>{dayjs.utc(ao.createdAt).local().format('D MMMM')}</Typography.Description>
                        </div>
                    </div>
                </div>
            </Card>)}
    </div>
}