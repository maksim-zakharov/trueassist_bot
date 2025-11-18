import {Button} from "@/components/ui/button"
import {Calendar, ChevronRight, MessageSquare} from "lucide-react"
import {useNavigate} from "react-router-dom"
import {Checkbox} from "@/components/ui/checkbox"
import React, {useMemo, useState} from "react";
import EstimatedTime from "../../components/EstimatedTime.tsx";
import {ScheduleSheet} from "../../components/ScheduleSheet.tsx";
import {useBackButton, useTelegram} from "../../hooks/useTelegram.tsx";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from "../../components/ui/accordion.tsx"
import {BottomActions} from "@/components/BottomActions.tsx"
import {CommentsSheet} from "../../components/CommentsSheet.tsx";
import dayjs from "dayjs";
import {Typography} from "../../components/ui/Typography.tsx";
import {useGetAddressesQuery, useGetBonusesQuery} from "../../api/api.ts";
import {useAddOrderMutation} from "../../api/ordersApi.ts";
import {moneyFormat} from "../../lib/utils.ts";
import {useDispatch, useSelector} from "react-redux";
import {AddressSheet} from "../../components/AddressSheet.tsx";
import {selectBonus, selectDate, selectFullAddress} from "../../slices/createOrderSlice.ts";
import {Header} from "../../components/ui/Header.tsx";
import {AlertDialogWrapper} from "../../components/AlertDialogWrapper.tsx";
import {RoutePaths} from "../../routes.ts";
import {ListButton, ListButtonGroup} from "../../components/ListButton/ListButton.tsx";
import {useTranslation} from "react-i18next";
import {Slider} from "../../components/ui/slider.tsx";
import {Card} from "../../components/ui/card.tsx";


export const OrderCheckoutPage = () => {
    const {t} = useTranslation();
    const [addOrder, {isLoading}] = useAddOrderMutation();
    const {data: bonuses = []} = useGetBonusesQuery();

    const total = useMemo(() => bonuses.reduce((acc, curr) => acc + curr.value, 0), [bonuses]);

    const bonus = useSelector(state => state.createOrder.bonuses || 0)
    const selectedTimestamp = useSelector(state => state.createOrder.date)
    const baseService = useSelector(state => state.createOrder.baseService)
    const options = useSelector(state => state.createOrder.options)
    const serviceVariant = useSelector(state => state.createOrder.serviceVariant)
    const fullAddress = useSelector(state => state.createOrder.fullAddress?.fullAddress)
    const orderId = useSelector(state => state.createOrder.id)
    const dispatch = useDispatch();

    const [error, setError] = useState<string | undefined>();

    const navigate = useNavigate()

    // Если создаем - true, если редактируем - false;
    const isDraft = !orderId;
    useBackButton(() => {
        if (isDraft) {
            navigate(RoutePaths.Order.Create)
        } else
            navigate(RoutePaths.Order.List)
    });

    const [comment, setComment] = useState<string | undefined>();
    const {vibro} = useTelegram();
    const {data: addresses = []} = useGetAddressesQuery();
    const totalPrice = useMemo(() => options.reduce((sum, option) => sum + option.price, serviceVariant?.basePrice || 0), [serviceVariant, options]);
    const totalWithBonus = useMemo(() => totalPrice - bonus, [totalPrice, bonus]);

    // Считаем общее время
    const totalDuration = useMemo(() => options.reduce((sum, option) => sum + (option?.duration || 0), serviceVariant?.duration || 0), [serviceVariant, options]);

    const dateTitle = useMemo(() => {
        if (!selectedTimestamp) {
            return t('client_checkout_date_placeholder');
        }

        return dayjs.utc(selectedTimestamp).local().format('dddd, D MMMM HH:mm');
    }, [selectedTimestamp, t]);

    const handleSelectAddress = (address: any) => {
        dispatch(selectFullAddress(address))
    }

    const handleSelectDate = (date) => dispatch(selectDate({date}));

    const handleOnSubmit = async () => {
        try {
            await addOrder(
                {
                    baseService,
                    serviceVariant,
                    fullAddress,
                    options,
                    date: selectedTimestamp,
                    comment,
                    bonus
                }).unwrap();
            navigate(RoutePaths.Order.List)
        } catch (e) {
            let description = t("error_500_title")
            if (!selectedTimestamp) {
                description = t('client_checkout_date_error')
            }
            if (!fullAddress) {
                description = t('client_checkout_address_error')
            }
            setError(description);
        }
    }

    const handleOnSelectBonuses = (values: number[]) => dispatch(selectBonus({bonuses: values[0]}));

    const maxBonus = useMemo(() => Math.min(total,totalPrice ), [total, totalPrice]);

    return (
        <>
            <AlertDialogWrapper open={Boolean(error)} title={t('client_checkout_dialog_error_title')} description={error}
                                onOkText="Ok"
                                onOkClick={() => setError(undefined)}/>
            <Header className="flex justify-center">
                <AddressSheet
                    addresses={addresses}
                    onAddressSelect={handleSelectAddress}
                >
                    <Button variant="ghost"
                            className="flex flex-col items-center h-auto text-tg-theme-text-color text-base font-medium">
                        <Typography.Title>{t('client_checkout_title')}</Typography.Title>
                        <Typography.Description>{fullAddress}</Typography.Description>
                    </Button>
                </AddressSheet>
            </Header>

            <div className="content flex flex-col gap-6 p-4">
                <ListButtonGroup>
                    <ScheduleSheet serviceVariantId={serviceVariant?.id} optionIds={options.map(o => o.id)} selectedTimestamp={selectedTimestamp} onSelectDate={handleSelectDate}
                    >
                        <ListButton icon={<Calendar
                            className="p-1 h-7 w-7 bg-[#2AABEE] rounded-md"/>} text={dateTitle}
                                    extra={<ChevronRight
                                        className="w-5 h-5 text-tg-theme-hint-color mr-[-8px] opacity-50"/>}/>
                    </ScheduleSheet>
                    <CommentsSheet onChangeText={setComment} text={comment}>

                        <ListButton icon={<MessageSquare
                            className="mr-4 h-7 w-7 p-1 bg-[var(--tg-accent-orange)] rounded-md"/>} text={t('payments_comments')}
                                    extra={<ChevronRight
                                        className="w-5 h-5 text-tg-theme-hint-color mr-[-8px] opacity-50"/>}/>
                    </CommentsSheet>
                </ListButtonGroup>

                {/* убрать отображение цен */}
                {/*<div>*/}
                {/*    <Typography.Description*/}
                {/*        className="block mb-2 text-left pl-4 text-sm uppercase">Bonuses</Typography.Description>*/}
                {/*    <Card className="p-3 px-4 pb-7">*/}
                {/*        <div className="grid grid-cols-3">*/}
                {/*            <Typography.Description*/}
                {/*                className="block mb-2 text-left text-md uppercase">0</Typography.Description>*/}
                {/*            <span*/}
                {/*                className="text-tg-theme-text-color text-center">{moneyFormat(bonus)}</span>*/}
                {/*            <Typography.Description*/}
                {/*                className="block mb-2 text-md uppercase text-right">{moneyFormat(maxBonus)}</Typography.Description>*/}
                {/*        </div>*/}
                {/*        <Slider max={maxBonus} step={50} value={[bonus]} onValueChange={handleOnSelectBonuses} />*/}
                {/*    </Card>*/}
                {/*</div>*/}

                {/* Order Summary */}
                {/*{baseService && <Accordion*/}
                {/*    type="single"*/}
                {/*    collapsible*/}
                {/*    defaultValue="services"*/}
                {/*    onValueChange={() => vibro()}*/}
                {/*>*/}
                {/*    <AccordionItem value="services">*/}
                {/*        <AccordionTrigger disabled={!options.length}>*/}
                {/*            <div className="flex justify-between w-full">*/}
                {/*                <span className="text-lg font-medium text-tg-theme-text-color">{t('client_order_details_services_summary')}</span>*/}
                {/*                <div className="flex items-center gap-1 pr-2">*/}
                {/*                        <span*/}
                {/*                            className="text-lg font-medium text-tg-theme-text-color">{moneyFormat(totalWithBonus)}</span>*/}
                {/*                </div>*/}
                {/*            </div>*/}
                {/*        </AccordionTrigger>*/}
                {/*        <AccordionContent className="flex flex-col gap-2">*/}
                {/*            <div key={baseService?.id} className="flex justify-between">*/}
                {/*                <span className="text-tg-theme-text-color">{baseService?.name}</span>*/}
                {/*                <span*/}
                {/*                    className="text-tg-theme-text-color">{moneyFormat(serviceVariant?.basePrice)}</span>*/}
                {/*            </div>*/}
                {/*            {options.map((service, index) => (*/}
                {/*                <div key={index} className="flex justify-between">*/}
                {/*                    <span className="text-tg-theme-text-color">{service.name}</span>*/}
                {/*                    <span*/}
                {/*                        className="text-tg-theme-text-color">{moneyFormat(service.price)}</span>*/}
                {/*                </div>*/}
                {/*            ))}*/}
                {/*            {Boolean(bonus) && <div key="bonus" className="flex justify-between">*/}
                {/*                <span className="text-tg-theme-text-color">Bonus</span>*/}
                {/*                <span*/}
                {/*                    className="text-tg-theme-text-color">{moneyFormat(-bonus)}</span>*/}
                {/*            </div>}*/}
                {/*        </AccordionContent>*/}
                {/*    </AccordionItem>*/}
                {/*</Accordion>}*/}

                {/*<EstimatedTime totalDuration={totalDuration}/>*/}

                {/* Promo Code */}
                {/*<Button*/}
                {/*  variant="ghost"*/}
                {/*  className="w-full bg-tg-theme-bg-color rounded-2xl h-auto py-4 px-4 flex items-center justify-center"*/}
                {/*  onClick={() => /!* TODO: Open promo code input *!/}*/}
                {/*>*/}
                {/*  <span className="text-tg-theme-text-color">У меня есть промокод</span>*/}
                {/*</Button>*/}

                {/* Terms Checkbox */}
                <div className="flex items-center gap-2">
                    <Checkbox id="terms"/>
                    <label htmlFor="terms" className="text-sm text-tg-theme-text-color">
                        {t('client_accept_1')} <span className="text-tg-theme-link-color">{t('client_accept_2')}</span>
                    </label>
                </div>
            </div>

            {/* Submit Button */}
            <BottomActions className="[padding-bottom:var(--tg-safe-area-inset-bottom)]">
                <Button
                    size="default"
                    wide
                    loading={isLoading}
                    onClick={handleOnSubmit}
                >
                    {t('client_checkout_submit_btn')}
                </Button>
            </BottomActions>
        </>
    )
}
