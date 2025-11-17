import {EmptyState} from "./EmptyState.tsx";
import {ClipboardPlus} from "lucide-react";
import {RoutePaths} from "../routes.ts";
import React from "react";
import {Card} from "./ui/card.tsx";
import {Typography} from "./ui/Typography.tsx";
import {moneyFormat} from "../lib/utils.ts";
import dayjs from "dayjs";
import {OrderStatusText} from "./OrderStatusText.tsx";
import {useNavigate} from "react-router-dom";
import {Skeleton} from "./ui/skeleton.tsx";
import {useTranslation} from "react-i18next";

export const AdminOrdersList = ({orders, isLoading}) => {
    const navigate = useNavigate()
    const {t} = useTranslation();
    const handleOrderClick = (order: any) => navigate(RoutePaths.Admin.Order.Details(order.id))

    if (isLoading) {
        return <div className="px-4 mb-4">
            <div className="flex flex-col gap-4 mt-4">
                <Skeleton className="w-full h-[136px]"/>
                <Skeleton className="w-full h-[136px]"/>
                <Skeleton className="w-full h-[136px]"/>
                <Skeleton className="w-full h-[136px]"/>
                <Skeleton className="w-full h-[136px]"/>
            </div>
        </div>
    }

    if (orders?.length === 0) {
        return <EmptyState
            icon={<ClipboardPlus className="h-10 w-10"/>}
            title={t('client_orders_empty_title')}
        />
    }
    return <div className="p-4 flex flex-col gap-4">
        {orders.length > 0 && <div className="flex flex-col gap-4">
            {orders.map((ao: any) => <Card className="p-0 pl-4 gap-0 border-none card-bg-color"
                                           onClick={() => handleOrderClick(ao)}>
                <div className="p-3 pl-0 separator-shadow-bottom">
                    <div className="flex justify-between">
                        <Typography.Title>{ao.baseService?.name}</Typography.Title>
                        <Typography.Title>{moneyFormat(ao.serviceVariant?.basePrice + ao.options.reduce((acc, curr) => acc + curr?.price, 0))}</Typography.Title>
                    </div>
                    <div className="flex justify-between">
                        <Typography.Description>{ao.fullAddress}</Typography.Description>
                        <Typography.Description>{dayjs.utc(ao.date).local().format('D MMMM, HH:mm')}</Typography.Description>
                    </div>
                </div>
                <div className="p-3 pl-0 flex gap-2 flex-col">
                    <div className="flex justify-between">
                        <Typography.Title>№{ao.id}</Typography.Title>
                        <Typography.Title><OrderStatusText status={ao.status}/></Typography.Title>
                    </div>
                    <div className="flex justify-between align-bottom items-center">
                        <Typography.Description>Executor: {ao.executor ? `${ao.executor?.firstName} ${ao.executor?.lastName}` : '-'}</Typography.Description>
                        {ao.startedAt &&
                            <Typography.Description>{dayjs.utc(ao.startedAt).local().format('D MMMM, HH:mm')}</Typography.Description>}
                    </div>
                </div>
            </Card>)}
        </div>}
    </div>
}