import React, {useMemo, useState} from "react";
import {Typography} from "../../components/ui/Typography.tsx";
import {Card} from "../../components/ui/card.tsx";
import {Button} from "../../components/ui/button.tsx";
import {useGetAdminServicesQuery} from "../../api/ordersApi.ts";
import {ClipboardPlus, Plus} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {Skeleton} from "../../components/ui/skeleton.tsx";
import {EmptyState} from "../../components/EmptyState.tsx";
import {RoutePaths} from "../../routes.ts";
import {useTranslation} from "react-i18next";
import {ErrorState} from "../../components/ErrorState.tsx";
import {Input} from "../../components/ui/input.tsx";
import {Badge} from "../../components/ui/badge.tsx";


export const AdminServicesPage = () => {
    const {t} = useTranslation();
    const navigate = useNavigate()

    const [query, setQuery] = useState<string>('');
    const {data: services = [], isLoading, isError} = useGetAdminServicesQuery(undefined, {
        refetchOnMountOrArgChange: true
    });

    const filteredService = useMemo(() => services.filter(s => s.name.includes(query)), [services, query]);

    const handleOrderClick = (order: any) => navigate(RoutePaths.Admin.Services.Details(order.id))

    if (isLoading) {
        return <div className="px-4 mb-4">
            <div className="flex flex-col gap-4 mt-4">
                <Skeleton className="w-full h-[40px]"/>
                <Skeleton className="w-full h-[48px]"/>
                <Skeleton className="w-full h-[48px]"/>
                <Skeleton className="w-full h-[48px]"/>
                <Skeleton className="w-full h-[48px]"/>
                <Skeleton className="w-full h-[48px]"/>
                <Skeleton className="w-full h-[48px]"/>
                <Skeleton className="w-full h-[48px]"/>
                <Skeleton className="w-full h-[48px]"/>
                <Skeleton className="w-full h-[48px]"/>
                <Skeleton className="w-full h-[48px]"/>
                <Skeleton className="w-full h-[48px]"/>
                <Skeleton className="w-full h-[48px]"/>
            </div>
        </div>
    }

    if (isError) {
        return <ErrorState/>
    }

    if (services.length === 0) {
        return <EmptyState
            icon={<ClipboardPlus className="h-10 w-10"/>}
            title={t('client_orders_empty_title')}
            description={t('client_orders_empty_description')}
            action={
                <Button onClick={() => navigate(RoutePaths.Root)}
                >
                    {t('client_orders_empty_btn')}
                </Button>}
        />
    }

    return <>
        <div className="px-4 pt-4 flex gap-2">
            <Input
                   className="border-none card-bg-color rounded-lg text-tg-theme-hint-color h-10 placeholder-[var(--tg-theme-hint-color)] text-center"
                   placeholder="Search by name" value={query} onChange={e => setQuery(e.target.value)}/>
            <Button
                onClick={() => navigate(RoutePaths.Admin.Services.Create)}
            >
                <Plus className="w-5 h-5 mr-2" />Add
            </Button>
        </div>
        <div className="p-4 flex flex-col gap-4">
            {filteredService.length > 0 && <div className="flex flex-col gap-4">
                {filteredService.map((ao: any) => <Card className="p-0 pl-4 gap-0 border-none card-bg-color"
                                                 onClick={() => handleOrderClick(ao)}>
                    <div className={`p-3 pl-0`}>
                        <div className="flex justify-between">
                            <Typography.Title className="flex gap-2">
                                {ao.name}
                                {ao.deletedAt && (
                                    <Badge className="flex gap-1 items-center" variant="destructive">
                                        DELETED
                                    </Badge>
                                )}
                            </Typography.Title>
                            <Typography.Title>id: {ao.id}</Typography.Title>
                        </div>
                    </div>
                </Card>)}
            </div>}
        </div>
    </>
}