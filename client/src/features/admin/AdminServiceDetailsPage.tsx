import {Typography} from "../../components/ui/Typography.tsx";
import React, {FC} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {
    useDeleteAdminServiceByIdMutation,
    useGetAdminServicesByIdQuery, useRestoreAdminServiceByIdMutation
} from "../../api/ordersApi.ts";
import {Button} from "../../components/ui/button.tsx";
import {Card} from "../../components/ui/card.tsx";
import {BottomActions} from "../../components/BottomActions.tsx";
import {Skeleton} from "../../components/ui/skeleton.tsx";
import {RoutePaths} from "../../routes.ts";
import {ErrorState} from "../../components/ErrorState.tsx";
import {useBackButton} from "../../hooks/useTelegram.tsx";
import {moneyFormat} from "../../lib/utils.ts";
import {formatDuration} from "../../components/EstimatedTime.tsx";
import {DynamicIcon} from "lucide-react/dynamic";

export const AdminServiceDetailsPage: FC = () => {
    useBackButton(() => navigate(RoutePaths.Admin.Services.List));

    const [deleteService, {isLoading: deleteLoading}] = useDeleteAdminServiceByIdMutation();
    const [restoreService, {isLoading: restoreLoading}] = useRestoreAdminServiceByIdMutation();
    const navigate = useNavigate()

    const {id} = useParams<string>();
    const {data: baseService, isLoading, isError} = useGetAdminServicesByIdQuery({id: id!});

    const handleRestoreClick = () => {
        Telegram.WebApp.showPopup({
            title: `Are you sure you want to restore ${baseService?.name}?`,
            message: 'The service will be visible to customers',
            buttons: [{
                id: 'ok',
                text: 'Restore',
                type: 'destructive'
            },{
                id: 'cancel',
                text: 'Cancel',
                type: 'default'
            }]
        }, id => id === 'ok' && restoreService({id: baseService?.id}).unwrap())
    }

    const handleCloseClick = () => {
        Telegram.WebApp.showPopup({
            title: `Are you sure you want to delete ${baseService?.name}?`,
            message: 'The service is not permanently deleted, it can be restored.',
            buttons: [{
                id: 'ok',
                text: 'Delete',
                type: 'destructive'
            },{
                id: 'cancel',
                text: 'Cancel',
                type: 'default'
            }]
        }, id => id === 'ok' && deleteService({id: baseService.id}).unwrap().then(() => navigate(RoutePaths.Admin.Services.List)))
    }

    if (isLoading || deleteLoading || !baseService) {
        return <div className="p-4 mt-[56px] flex flex-col gap-4">
            <Skeleton className="w-full h-[112px]"/>
            <Skeleton className="w-full h-[192px]"/>
            <Skeleton className="w-full h-[164px]"/>
        </div>
    }

    if (isError) {
        return <div
            className="h-screen">
            <ErrorState/>
        </div>
    }

    return <div className="flex flex-col bg-inherit overflow-y-auto overscroll-none h-screen">
        <div className="flex flex-col gap-4 bg-inherit p-4">
            <Card className="p-0 p-3 gap-0">
                <div className="flex justify-between">
                    <Typography.Title>{baseService.name}</Typography.Title>
                    <Typography.Title>
                        №{baseService.id}
                    </Typography.Title>
                </div>
            </Card>
            <div className="flex flex-col gap-2">
                <Typography.Title>Options</Typography.Title>
                {baseService?.options?.map(o => <Card className="p-0 gap-0 pl-4" key={o.id}>
                    <div className="p-3 pl-0 separator-shadow-bottom flex justify-between items-center">
                        <Typography.Title>Name</Typography.Title>
                        <Typography.Description className="text-base">{o.name}</Typography.Description>
                    </div>
                    <div className="p-3 pl-0 separator-shadow-bottom flex justify-between items-center">
                        <Typography.Title>Duration</Typography.Title>
                        <Typography.Description
                            className="text-base">{formatDuration(o.duration)}</Typography.Description>
                    </div>
                    <div className="p-3 pl-0 flex justify-between items-center">
                        <Typography.Title>Price</Typography.Title>
                        <Typography.Description className="text-base">{moneyFormat(o.price)}</Typography.Description>
                    </div>
                </Card>)}
            </div>
            <div className="flex flex-col gap-2">
                <Typography.Title>Variants</Typography.Title>
                {baseService?.variants?.map((ao: any) => <Card key={ao.id} className="p-0 pl-4 gap-0 border-none card-bg-color">
                    <div className={`p-3 pl-0`}>
                        <div className="flex justify-between">
                            <Typography.Title className="flex gap-2"><DynamicIcon name={ao.icon}
                                                                                  className="w-5 h-5 text-tg-theme-button-color"
                                                                                  strokeWidth={1.5}/>{ao.name}
                            </Typography.Title>
                            <Typography.Title>{moneyFormat(ao.basePrice)}</Typography.Title>
                        </div>
                        <div className="flex justify-between">
                            <Typography.Description>{ao.nameAccusative}</Typography.Description>
                            <Typography.Description>{formatDuration(ao.duration)}</Typography.Description>
                        </div>
                    </div>
                </Card>)}
            </div>
        </div>
        <BottomActions
            className="flex flex-col gap-2 [min-height:calc(58px+var(--tg-safe-area-inset-bottom))] [padding-bottom:var(--tg-safe-area-inset-bottom)]">
            {baseService?.deletedAt && <>
                <Button
                    wide
                    size="lg"
                    loading={restoreLoading}
                    onClick={handleRestoreClick}
                >
                    Restore
                </Button>
            </>}
            {!baseService?.deletedAt && <>
                <Button
                    wide
                    size="lg"
                    onClick={() => navigate(RoutePaths.Admin.Services.Edit(baseService?.id))}
                >
                    Edit
                </Button>
                <Button
                    wide
                    size="lg"
                    className="border-none"
                    variant="default"
                    onClick={handleCloseClick}
                >
                    Delete
                </Button>
            </>}
        </BottomActions>
    </div>
}