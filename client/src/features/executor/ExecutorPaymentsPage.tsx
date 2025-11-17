import React, {useMemo, useState} from "react";
import {Typography} from "../../components/ui/Typography.tsx";
import {Card} from "../../components/ui/card.tsx";
import {Button} from "../../components/ui/button.tsx";
import {useGetExecutorOrdersQuery} from "../../api/ordersApi.ts";
import dayjs from "dayjs";
import {CalendarSync, Star, Banknote} from "lucide-react";
import {moneyFormat} from "../../lib/utils.ts";
import {Skeleton} from "../../components/ui/skeleton.tsx";
import {EmptyState} from "../../components/EmptyState.tsx";
import {Area, AreaChart, CartesianGrid, XAxis} from "recharts"
import {ChartConfig, ChartContainer} from "../../components/ui/chart.tsx";
import {useTranslation} from "react-i18next";
import {ErrorState} from "../../components/ErrorState.tsx";
import {Header} from "../../components/ui/Header.tsx";

export const ExecutorPaymentsPage = () => {
    const {t} = useTranslation();
    const {data: orders = [], isLoading, isError} = useGetExecutorOrdersQuery(undefined, {
        refetchOnMountOrArgChange: true
    });

    const chartConfig = {
        payment: {
            label: "Mobile",
            color: "hsl(var(--chart-2))",
        },
        date: {
            label: "Mobile",
            color: "hsl(var(--chart-2))",
        },
    } satisfies ChartConfig

    const [paymentsPeriod, setPaymentsPeriod] = useState<'week' | 'month'>('week');

    const completedOrders = useMemo(() => orders.filter(o => ['completed'].includes(o.status)).sort((a, b) => b.id - a.id), [orders]);
    const filteredOrders = useMemo(() => orders.filter(o => ['completed'].includes(o.status)).filter(order => {
        const orderDate = dayjs.utc(order.date);
        return orderDate.isAfter(dayjs.utc().subtract(1, paymentsPeriod));
    }), [orders, paymentsPeriod])

    const totalSum = useMemo(() => filteredOrders.reduce((acc, curr) => acc + curr.serviceVariant?.basePrice + curr.options.reduce((acc, curr) => acc + curr?.price, 0), 0), [filteredOrders]);

    const chartData = filteredOrders.reduce((acc, curr, index) => {
        acc.push({date: curr.date, payment: curr.serviceVariant?.basePrice + curr.options.reduce((acc, curr) => acc + curr?.price, 0) + (acc[index - 1]?.payment || 0)});
        return acc;
    }, [])

    const paymentsLabel = useMemo(() => ({
        'week': t('payments_period_week'),
        'month': t('payments_period_month'),
    }), [t])

    if (isLoading) {
        return <div className="p-4">
            <div className="flex flex-col gap-4">
                <Skeleton className="w-full h-[84px]"/>
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
        return <EmptyState
            icon={<Banknote className="h-10 w-10"/>}
            title={t('payments_empty_title')}
            description={t('payments_empty_description')}
        />
    }

    return <>
        <Header className="flex justify-center">
            <Button variant="ghost"
                    className="flex flex-col items-center h-auto text-tg-theme-text-color text-base font-medium">
                <Typography.Title>{t('menu_item_payments')}</Typography.Title>
            </Button>
        </Header>
        <div className="p-4 flex flex-col gap-4">
        <Card className="card-bg-color px-4 py-3 flex-row justify-between border-0">
            <div className="flex flex-col">
                <Button className="p-0 border-none h-6 w-max" variant="default" size="sm" onClick={() => setPaymentsPeriod(prevState => prevState !== 'week' ? 'week' : 'month')}>
                    <CalendarSync className="w-4 h-4 mr-1" /><Typography.Description className="text-tg-theme-button-color">{t('payments_payments_per')} {paymentsLabel[paymentsPeriod]}</Typography.Description>
                </Button>
                <Typography.H2 className="mb-0 text-[24px]">{moneyFormat(totalSum)}</Typography.H2>
            </div>
            <ChartContainer config={chartConfig} className="w-[120px] mb-[-8px]">
                <AreaChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                        left: 0,
                        right: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                            <stop
                                offset="5%"
                                stopColor="var(--chart-2)"
                                stopOpacity={1.0}
                            />
                            <stop
                                offset="95%"
                                stopColor="var(--chart-2)"
                                stopOpacity={0.1}
                            />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} horizontal={false}/>
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={2}
                        minTickGap={60}
                        tickFormatter={val => dayjs.utc(val).format('D')}
                    />
                    <Area
                        fill="url(#fillDesktop)"
                        dataKey="payment"
                        type="natural"
                        fillOpacity={0.3}

                        stroke="var(--chart-2)"
                        stackId="a"
                    />
                </AreaChart>
            </ChartContainer>
        </Card>
        {completedOrders.length > 0 && <div className="flex flex-col gap-4">
            {completedOrders.map(ao => <Card className="card-bg-color pl-4 gap-0 p-3 pb-0 border-0">
                <div className="flex justify-between">
                    <Typography.Title>{ao.baseService?.name}</Typography.Title>
                    <Typography.Title>{moneyFormat(ao.serviceVariant?.basePrice + ao.options.reduce((acc, curr) => acc + curr?.price, 0))}</Typography.Title>
                </div>
                <div className="flex justify-between">
                    <Typography.Description>{ao.fullAddress}</Typography.Description>
                    <Typography.Description>{dayjs.utc(ao.date).local().format('D MMMM, HH:mm')}</Typography.Description>
                </div>
                <div className="flex gap-2 mt-2 pb-3">
                    <Star className="w-4 h-4 text-tg-theme-button-color"/>
                    <Star className="w-4 h-4 text-tg-theme-button-color"/>
                    <Star className="w-4 h-4 text-tg-theme-button-color"/>
                    <Star className="w-4 h-4 text-tg-theme-button-color"/>
                    <Star className="w-4 h-4 text-tg-theme-button-color"/>
                </div>
                {ao.comment &&<div className="flex flex-col mt-1 separator-shadow-top py-3">
                    <Typography.Description>{t('payments_comments')}</Typography.Description>
                    <Typography.Title>{ao.comment}</Typography.Title>
                </div>}
            </Card>)}
        </div>}
    </div>
        </>
}