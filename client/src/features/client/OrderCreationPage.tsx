import React, {FC, useMemo} from 'react'
import {useNavigate} from 'react-router-dom'
import {Button} from '@/components/ui/button'
import {Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {List} from "../../components/ui/list.tsx";
import {useBackButton, useTelegram} from "../../hooks/useTelegram.tsx";
import {Info, Star} from 'lucide-react'
import EstimatedTime from "../../components/EstimatedTime.tsx";
import {Header} from "../../components/ui/Header.tsx";
import {BottomActions} from "../../components/BottomActions.tsx";
import {Typography} from "../../components/ui/Typography.tsx";
import {Badge} from "../../components/ui/badge.tsx";
import {moneyFormat} from "../../lib/utils.ts";
import {usePatchAdminOrderMutation, usePatchOrderMutation} from "../../api/ordersApi.ts";
import {useDispatch, useSelector} from "react-redux";
import {clearState, selectBaseService, selectOptions, selectVariant} from "../../slices/createOrderSlice.ts";
import {RoutePaths} from "../../routes.ts";
import {Checkbox} from "../../components/ui/checkbox.tsx";
import {useTranslation} from "react-i18next";

export const OrderCreationPage: FC<{isAdmin?: boolean}> = ({isAdmin}) => {
    const {t} = useTranslation();
    const [patchOrder, {isLoading: patchOrderLoading}] = (isAdmin ? usePatchAdminOrderMutation : usePatchOrderMutation)();
    const services = useSelector(state => state.createOrder.services);
    const orderId = useSelector(state => state.createOrder.id)
    const baseService = useSelector(state => state.createOrder.baseService)
    const options = useSelector(state => state.createOrder.options)
    const serviceVariant = useSelector(state => state.createOrder.serviceVariant)

    const {vibro} = useTelegram();
    const navigate = useNavigate()

    const dispatch = useDispatch();

    // Если создаем - true, если редактируем - false;
    const isDraft = !orderId;

    useBackButton(() => {
        dispatch(clearState())
        if (isDraft) {
            navigate(isAdmin ? RoutePaths.Admin.Order.List : RoutePaths.Root)
        } else
        navigate(isAdmin ? RoutePaths.Admin.Order.List : RoutePaths.Order.List)
    });

    // Либо мы перешли сюда из других страниц, либо просто откуда то как то - и берем первый сервис из списка
    const currentService = useMemo(() => services.find(s => baseService ? s.id === baseService.id : s) || services[0], [services, baseService]);

    // Находим варианты услуг по базовой услуге
    const variants = currentService?.variants || []
    // Получаем доступные опции для типа услуги
    const availableOptions = currentService?.options || []

    const variantId = useMemo(() => {
        return serviceVariant?.id || variants[0]?.id
    }, [serviceVariant, services, variants]);

    const selectedOptionsIdSet = useMemo(() => new Set(options.map(o => o.id)), [options]);

    // Считаем общую сумму
    const totalPrice = useMemo(() => options.reduce((sum, option) => sum + option.price, serviceVariant?.basePrice || 0), [serviceVariant, options]);

    // Считаем общее время
    const totalDuration = useMemo(() => options.reduce((sum, option) => sum + (option?.duration || 0), serviceVariant?.duration || 0), [serviceVariant, options]);

    const handleOptionToggle = (option: any) => {
        vibro('light');
        const exist = options.find(opt => opt.id === option.id);
        let newOptions = [...options];
        if (exist) {
            newOptions = newOptions.filter(opt => opt.id !== option.id);
        } else {
            newOptions.push(option)
        }
        dispatch(selectOptions({options: newOptions}))
    }

    const handleNext = async () => {
        if (isDraft) {
            dispatch(selectBaseService({baseService, serviceVariant, options}))

            navigate(RoutePaths.Order.Checkout);
        } else {
            await patchOrder({id: orderId, serviceVariant, options}).unwrap();
            navigate(isAdmin ? RoutePaths.Admin.Order.Details(orderId) : RoutePaths.Order.Details(orderId));
        }
    }

    const handleSelectVariant = (serviceVariant: any) => {
        dispatch(selectVariant({serviceVariant}))
    }

    if (!baseService) {
        return null
    }

    return (
        <>
            <Header>
                <Typography.Title
                    className="items-center flex justify-center">{baseService?.name}</Typography.Title>
            </Header>
            <div className="content">
                <Tabs defaultValue={variantId} value={variantId}>
                    <TabsList>
                        {variants.map(tab => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                onClick={() => handleSelectVariant(tab)}
                            >
                                {tab.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
                <List itemClassName="flex-col gap-2" className="mb-4 rounded-none">
                    {availableOptions.map((option) => <>
                        <div className="flex items-center gap-3 w-full justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Info
                                    className="flex-none w-[18px] h-[18px] mt-0.5 text-tg-theme-subtitle-text-color"/>
                                <span
                                    className="text-[16px] [line-height:20px] [font-weight:400] text-tg-theme-text-color truncate">{option.name}</span>
                                {option.isPopular ? (
                                    <Badge className="flex gap-1 items-center"><Star
                                        className="w-3 h-3"/>{t('client_creation_popular_label')}</Badge>
                                ) : <div/>}
                            </div>
                            {/*<span*/}
                            {/*    className="text-[15px] font-normal text-tg-theme-text-color whitespace-nowrap">{moneyFormat(option.price)}</span>*/}
                            <Checkbox checked={selectedOptionsIdSet.has(option.id)}
                                      onCheckedChange={() => handleOptionToggle(option)}/>
                        </div>
                    </>)}
                </List>
                {/*<EstimatedTime totalDuration={totalDuration}/>*/}
            </div>

            <BottomActions className="[padding-bottom:var(--tg-safe-area-inset-bottom)]">
                <Button
                    wide
                    onClick={handleNext}
                    loading={patchOrderLoading}
                    size="lg"
                ><span
                    className="flex-1 text-center">{isDraft ? t('client_creation_continue_btn') : t('client_creation_save_btn')}</span>
                    {/*<span>{moneyFormat(totalPrice)}</span>*/}
                </Button>
            </BottomActions>
        </>
    )
}
