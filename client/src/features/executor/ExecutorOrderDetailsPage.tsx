import {useNavigate, useParams} from "react-router-dom";
import {
    useCompleteOrderMutation,
    useGetOrderByIdFromExecutorQuery,
    useProcessedOrderMutation
} from "../../api/ordersApi.ts";
import React, {useMemo, useState} from "react";
import {Button} from "../../components/ui/button.tsx";
import {BottomActions} from "../../components/BottomActions.tsx";
import {RoutePaths} from "../../routes.ts";
import {Typography} from "@/components/ui/Typography.tsx";
import {ListButton, ListButtonGroup} from "../../components/ListButton/ListButton.tsx";
import {Checkbox} from "../../components/ui/checkbox.tsx";
import {useBackButton, useTelegram} from "../../hooks/useTelegram.tsx";
import {AlertDialogWrapper} from "../../components/AlertDialogWrapper.tsx";
import {toast} from "sonner";
import {CalendarCheck} from "lucide-react";
import {PageLoader} from "../../components/PageLoader.tsx";
import {useTranslation} from "react-i18next";
import dayjs from "dayjs";
import {Header} from "../../components/ui/Header.tsx";
import {ErrorState} from "../../components/ErrorState.tsx";

export const ExecutorOrderDetailsPage = () => {
    const {t} = useTranslation();
    const navigate = useNavigate()

    useBackButton(() => {
        if (window.history.length > 0) {
            window.history.back()
        } else {
            navigate(RoutePaths.Executor.Orders);
        }
    });

    const [completeOrder, {isLoading: completeOrderLoading}] = useCompleteOrderMutation();
    const [processedOrder, {isLoading: processedOrderLoading}] = useProcessedOrderMutation();
    const [orderToDelete, setOrderToDelete] = useState<any | null>(null);
    const {id} = useParams<string>();
    const {vibro} = useTelegram();
    const {data: order, isLoading, isError} = useGetOrderByIdFromExecutorQuery({id: id!});
    const [variantIds, setVariantIds] = useState<any>([]);
    const selectedOptionsIdSet = useMemo(() => new Set(variantIds), [variantIds]);

    const handleFinishOrder = async (order) => {
        await completeOrder(order).unwrap();
        setOrderToDelete(undefined);
        toast(t('orders_notification_complete'), {
            classNames: {
                icon: 'mr-2 h-5 w-5 text-[var(--chart-2)]'
            },
            icon: <CalendarCheck className="h-5 w-5 text-[var(--chart-2)]"/>
        })
        navigate(RoutePaths.Executor.Orders)
    }

    const handleApplyJob = async (order) => {
        try {
            await processedOrder(order).unwrap()
        } catch (e: any) {
            if (e.data.message) {
                toast(e.data.message, {
                    // classNames: {
                    //     icon: 'mr-2 h-5 w-5 text-[var(--chart-2)]'
                    // },
                    // icon: <CalendarCheck className="h-5 w-5 text-[var(--chart-2)]"/>
                })
            }
        }
    }

    const handleOptionToggle = (prefix: string, id: string) => {
        vibro('light');
        const prefId = `${prefix}_${id}`;
        const exist = variantIds.find(opt => opt === prefId);
        let newOptions = [...variantIds];
        if (exist) {
            newOptions = newOptions.filter(opt => opt !== prefId);
        } else {
            newOptions.push(prefId)
        }
        setVariantIds(newOptions);
    }

    const canFinalized = useMemo(() => (order?.options || []).every(op => selectedOptionsIdSet.has(`option_${op.id}`)) && selectedOptionsIdSet.has(`variant_${order?.serviceVariant?.id}`), [selectedOptionsIdSet, order?.options, order?.serviceVariant?.id])

    const canStart = useMemo(() => {
        if (!order) return false;

        const orderDate = dayjs.utc(order.date);
        const today = dayjs.utc();
        return order?.status === 'todo' &&
            orderDate.isSame(today, 'day'); // Сравниваем год, месяц и день в UTC
    }, [order]);

    if (isLoading) {
        // TODO Переписать на скелетон
        return <PageLoader/>
    }

    if(isError){
        return <ErrorState/>
    }

    return <>
        <div className="content px-4">
            <Header className="flex justify-center">
                <Button variant="ghost"
                        className="flex flex-col items-center h-auto text-tg-theme-text-color text-base font-medium">
                    <Typography.Title>{order?.baseService?.name}</Typography.Title>
                    <Typography.Description>{order?.serviceVariant?.name}</Typography.Description>
                </Button>
            </Header>

            {/*<div>{order?.serviceVariant?.duration}</div>*/}
            {/*<div>{order?.date}</div>*/}
            {/*<div>{order?.fullAddress}</div>*/}

            <Typography.H2 className="mb-2">{t('executor_order_details_title')}</Typography.H2>
            <ListButtonGroup>
                <ListButton key={order?.serviceVariant?.id} text={order?.serviceVariant?.name} extra={
                    order?.status === 'processed' &&
                    <Checkbox checked={selectedOptionsIdSet.has(`variant_${order?.serviceVariant?.id}`)}
                              onCheckedChange={() => handleOptionToggle('variant', order?.serviceVariant?.id)}/>}/>
                {order?.options.map(op => <ListButton key={op?.id} text={op?.name} extra={
                    order?.status === 'processed' && <Checkbox checked={selectedOptionsIdSet.has(`option_${op.id}`)}
                                                               onCheckedChange={() => handleOptionToggle('option', op?.id)}/>}>{op?.name} {op?.duration}</ListButton>)}
            </ListButtonGroup>

            {(order?.status === 'processed' || canStart) &&
                <BottomActions className="[padding-bottom:var(--tg-safe-area-inset-bottom)]">
                    {canStart && <Button wide loading={processedOrderLoading}
                                         onClick={() => handleApplyJob(order)}>{t('executor_order_apply_btn')}</Button>}
                    {order?.status === 'processed' &&
                        <Button disabled={!canFinalized} onClick={() => setOrderToDelete(order)}
                                wide>{t('executor_order_complete_btn')}</Button>}
                </BottomActions>}
        </div>
        <AlertDialogWrapper open={Boolean(orderToDelete)} title={t('finalize_order_modal_title')}
                            description={t('finalize_order_modal_description')}
                            onOkText={t('finalize_order_modal_ok_btn')}
                            onCancelText={t('finalize_order_modal_cancel_btn')}
                            okLoading={completeOrderLoading}
                            onCancelClick={() => setOrderToDelete(undefined)}
                            onOkClick={() => handleFinishOrder(orderToDelete)}></AlertDialogWrapper>
    </>
}