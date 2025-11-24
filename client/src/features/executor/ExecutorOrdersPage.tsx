import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Typography} from "../../components/ui/Typography.tsx";
import {Button} from "../../components/ui/button.tsx";
import {useCompleteOrderMutation, useGetExecutorOrdersQuery} from "../../api/ordersApi.ts";
import dayjs from "dayjs";
import {Calendar, CalendarCheck, ClipboardPlus, X} from "lucide-react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {Skeleton} from "../../components/ui/skeleton.tsx";
import {EmptyState} from "../../components/EmptyState.tsx";
import {Tabs, TabsList, TabsTrigger} from "../../components/ui/tabs.tsx";
import {Header} from "../../components/ui/Header.tsx";


import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "../../components/ui/accordion.tsx";
import {useTelegram} from "../../hooks/useTelegram.tsx";
import {AlertDialogWrapper} from "../../components/AlertDialogWrapper.tsx";
import {toast} from "sonner";
import {RoutePaths} from "../../routes.ts";
import {useTranslation} from "react-i18next";
import {ErrorState} from "../../components/ErrorState.tsx";
import {ListButton} from "../../components/ListButton/ListButton.tsx";
import {CalendarSheet} from "../../components/CalendarSheet.tsx";
import {FilterChips, FilterChipOption} from "../../components/ui/filter-chips.tsx";

export const ExecutorOrdersPage = () => {
    const [selectedTimestamp, handleSelectDate] = useState<Date | undefined>();
    const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'canceled'>('all');
    const {t} = useTranslation();
    const [completeOrder, {isLoading: completeOrderLoading}] = useCompleteOrderMutation();
    const navigate = useNavigate()
    const [orderToDelete, setOrderToDelete] = useState<any | null>(null);
    const {vibro, hideBackButton} = useTelegram();

    const dateTitle = useMemo(() => {
        if (!selectedTimestamp) {
            return t('client_checkout_date_placeholder');
        }

        return dayjs.utc(selectedTimestamp).local().format('dddd, D MMMM');
    }, [selectedTimestamp, t]);

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

    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get('tab') || 'active'; // result[0]?.timestamp.toString();
    
    const statusFilterOptions: FilterChipOption[] = useMemo(() => [
        { value: 'all', label: t('orders_filter_all') || 'All' },
        { value: 'completed', label: t('client_orders_completed_status') },
        { value: 'canceled', label: t('client_orders_canceled_status') },
    ], [t]);
    
    const filteredOrders = useMemo(() => {
        if (tab === 'active') {
            return orders
                .filter(o => !['completed', 'canceled'].includes(o.status))
                .sort((a, b) => b.date.localeCompare(a.date));
        }
        
        // Archive tab filtering
        let archiveOrders = orders.filter(o => ['completed', 'canceled'].includes(o.status));
        
        // Apply status filter
        if (statusFilter !== 'all') {
            archiveOrders = archiveOrders.filter(o => o.status === statusFilter);
        }
        
        // Apply date filter
        if (selectedTimestamp) {
            archiveOrders = archiveOrders.filter(o => 
                dayjs(o.date).startOf('day').isSame(dayjs(selectedTimestamp).startOf('day'))
            );
        }
        
        return archiveOrders.sort((a, b) => b.date.localeCompare(a.date));
    }, [orders, tab, selectedTimestamp, statusFilter]);
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

    const isPastDate = useCallback((date: Date) => {
        // Получаем текущую дату в UTC и обнуляем время
        const todayUTC = dayjs().startOf('day');

        // Конвертируем входную дату в UTC и обнуляем время
        const inputDateUTC = dayjs(date).startOf('day');

        // Если дата раньше текущей UTC даты
        return inputDateUTC.isAfter(todayUTC);
    }, []);

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
        {tab === 'archive' && <div className="ml-3 mr-3 mt-2 flex flex-col gap-2">
            <CalendarSheet disabled={isPastDate} selectedTimestamp={selectedTimestamp} onSelectDate={handleSelectDate}
            >
                <ListButton icon={<Calendar
                    className="p-1 h-7 w-7 bg-[#2AABEE] rounded-md"/>} text={dateTitle}
                            extra={selectedTimestamp && <X onClick={(e) => {
                                e.stopPropagation()
                                handleSelectDate(undefined)
                            }}
                                                           className="w-5 h-5 text-tg-theme-hint-color mr-[-8px] opacity-50"/>}/>
            </CalendarSheet>
            <FilterChips
                options={statusFilterOptions}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as 'all' | 'completed' | 'canceled')}
            />
        </div>}
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
