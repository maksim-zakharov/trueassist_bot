import React, {useEffect, useMemo, useState} from "react";
import {Typography} from "../../components/ui/Typography.tsx";
import {Button} from "../../components/ui/button.tsx";
import {useCompleteOrderMutation, useGetExecutorOrdersQuery} from "../../api/ordersApi.ts";
import dayjs from "dayjs";
import {CalendarCheck, ClipboardPlus} from "lucide-react";
import {moneyFormat} from "../../lib/utils.ts";
import {useNavigate, useSearchParams} from "react-router-dom";
import {Skeleton} from "../../components/ui/skeleton.tsx";
import {EmptyState} from "../../components/EmptyState.tsx";
import {Tabs, TabsList, TabsTrigger} from "../../components/ui/tabs.tsx";
import {Header} from "../../components/ui/Header.tsx";


import {formatDuration} from "../../components/EstimatedTime.tsx";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "../../components/ui/accordion.tsx";
import {useTelegram} from "../../hooks/useTelegram.tsx";
import {AlertDialogWrapper} from "../../components/AlertDialogWrapper.tsx";
import {toast} from "sonner";
import {RoutePaths} from "../../routes.ts";
import {useTranslation} from "react-i18next";
import {ErrorState} from "../../components/ErrorState.tsx";

export const ExecutorOrdersPage = () => {
    const {t} = useTranslation();
    const [completeOrder, {isLoading: completeOrderLoading}] = useCompleteOrderMutation();
    const navigate = useNavigate()
    const [orderToDelete, setOrderToDelete] = useState<any | null>(null);
    const {vibro, hideBackButton} = useTelegram();

    useEffect(() => {
        hideBackButton()
    }, [hideBackButton]);

    const tabs = [
        {
            key: 'active',
            label: 'Active'
        },
        {
            key: 'archive',
            label: 'Archive'
        }
    ]

    const {data: orders = [], isLoading, isError} = useGetExecutorOrdersQuery(undefined, {
        refetchOnMountOrArgChange: true
    });

    function generateTimeSlots(parentDate) {
        const slots = [];
        const start = parentDate.startOf('day').add(8, 'hour');
        const end = parentDate.startOf('day').add(22, 'hour');

        let current = start;

        while (current.isBefore(end)) {
            const slotStart = current;
            const slotEnd = current.add(30, 'minute');

            slots.push({
                timestamp: slotStart.valueOf(),
                time: slotStart.format('HH:mm')
            });

            current = slotEnd;
        }

        return slots.filter(s => dayjs.utc(s.timestamp).isAfter(dayjs.utc()) || dayjs.utc(s.timestamp).isSame(dayjs.utc()));
    }

    const result = useMemo(() => Array.from({length: 7}, (_, i) => {
        const date = dayjs.utc().add(i, 'day').startOf('day');
        return {
            date: date.locale('en').format('dd, D MMM').toLowerCase(),
            timestamp: date.valueOf(),
            slots: generateTimeSlots(date)
        };
    }).filter(s => s.slots.length > 0), []);

    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get('tab') || 'active'; // result[0]?.timestamp.toString();
    const filteredOrders = useMemo(() => orders.filter(o => (tab === 'active' ? !['completed', 'canceled'].includes(o.status) :  ['completed', 'canceled'].includes(o.status))).sort((a, b) => a.date.localeCompare(b.date)), [orders, tab]);
    const activeOrders = useMemo(() => filteredOrders.filter(o => o.status === 'processed').sort((a, b) => b.id - a.id), [filteredOrders]);

    const handleFinishOrder = async (order) => {
        await completeOrder(order).unwrap();
        setOrderToDelete(undefined);
        toast(t('orders_notification_complete'), {
            classNames: {
                icon: 'mr-2 h-5 w-5 text-[var(--chart-2)]'
            },
            icon: <CalendarCheck className="h-5 w-5 text-[var(--chart-2)]"/>
        })
    }

    const onChangeTab = (tab) => {
        searchParams.set('tab', tab);
        setSearchParams(searchParams);
    }

    if (isLoading) {
        return <div>
            <Skeleton className="w-full h-[50px] mb-3 rounded-none"/>
            <div className="mb-6 mt-4 px-4 flex flex-col gap-4">
                <Skeleton className="w-full h-[88px]"/>
                <Skeleton className="w-full h-[88px]"/>
                <Skeleton className="w-full h-[88px]"/>
                <Skeleton className="w-full h-[88px]"/>
                <Skeleton className="w-full h-[88px]"/>
            </div>
        </div>
    }

    if (isError) {
        return <ErrorState/>
    }

    if (orders.length === 0) {
        return <EmptyState className="flex justify-center h-screen items-center m-auto"
                           icon={<ClipboardPlus className="h-10 w-10"/>} title={t('orders_empty_title')}
                           description={t('orders_empty_description')}/>
    }

    return <div className="flex flex-col">
        <Header className="p-0">
            <Tabs defaultValue={tab} onValueChange={onChangeTab} className="px-4 h-full">
                <TabsList className="bg-inherit px-0 h-full grid grid-cols-2">
                    {tabs.map(r => <TabsTrigger
                        key={r.key}
                        value={r.key}
                    >
                        {r.label}
                    </TabsTrigger>)}
                </TabsList>
            </Tabs>
        </Header>
        <div className="flex flex-col gap-4 py-4">
            {filteredOrders.length === 0 && <EmptyState className="flex justify-center h-screen items-center m-auto"
                                                        icon={<ClipboardPlus className="h-10 w-10"/>}
                                                        title={t('orders_empty_title')}
                                                        description={t('orders_empty_description')}/>
            }
            {activeOrders.length > 0 && <div className="flex flex-col px-4 gap-4">
                <Typography.H2 className="mb-0">
                    {t('orders_in_progress_title')}
                </Typography.H2>
            </div>
            }
            {filteredOrders.map(ao => <Accordion
                className="p-0 px-4 gap-0"
                type="single"
                collapsible
                defaultValue="services"
                onClick={() => navigate(RoutePaths.Executor.Details(ao.id))}
                onValueChange={() => vibro()}
            >
                <AccordionItem value="services" className="rounded-xl">
                    <AccordionTrigger className="flex justify-normal py-0" hideChevron
                                      onClick={(e) => navigate(RoutePaths.Executor.Details(ao.id))}>
                        <div className="p-3 px-0 flex flex-col w-full">
                            <div className="flex justify-between">
                                <Typography.Title>{ao.baseService?.name}</Typography.Title>
                                {/*<Typography.Title>{moneyFormat(ao.serviceVariant?.basePrice + ao.options.reduce((acc, curr) => acc + curr?.price, 0))}</Typography.Title>*/}
                            </div>
                            <div className="flex justify-between">
                                <Typography.Description>{ao.fullAddress}</Typography.Description>
                                <Typography.Description>{dayjs.utc(ao.date).local().format('D MMMM, HH:mm')}</Typography.Description>
                            </div>
                        </div>
                    </AccordionTrigger>
                    {ao.options.length > 0 &&
                        <AccordionContent className="gap-1 flex flex-col pt-3 mt-[1px] separator-shadow-top pr-4"
                                          wrapperClassName="pr-0">
                            {ao.options.map((service, index) => (
                                <div key={index} className="flex justify-between">
                                    <span className="text-xs text-tg-theme-hint-color font-medium">{service.name}</span>
                                    {/*<span*/}
                                    {/*    className="text-xs text-tg-theme-hint-color font-medium">{formatDuration(service.duration)}</span>*/}
                                </div>
                            ))}
                            {ao.status === 'processed' &&
                                <Button className="mt-3"
                                        onClick={() => setOrderToDelete(ao)}>{t('orders_complete_btn')}</Button>
                            }
                        </AccordionContent>}
                </AccordionItem>
            </Accordion>)}
        </div>
        <AlertDialogWrapper open={Boolean(orderToDelete)} title={t('finalize_order_modal_title')}
                            description={t('finalize_order_modal_description')}
                            onOkText={t('finalize_order_modal_ok_btn')}
                            onCancelText={t('finalize_order_modal_cancel_btn')}
                            okLoading={completeOrderLoading}
                            onCancelClick={() => setOrderToDelete(undefined)}
                            onOkClick={() => handleFinishOrder(orderToDelete)}></AlertDialogWrapper>
    </div>
}
