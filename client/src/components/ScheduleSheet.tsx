import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,} from "@/components/ui/sheet"
import React, {useCallback, useMemo, useRef, useState} from "react";
import {CardItem} from "./CardItem.tsx";
import {useTelegram} from "../hooks/useTelegram.tsx";
import dayjs from "dayjs";
import {EmptyState} from "./EmptyState.tsx";
import {CalendarX} from "lucide-react";
import {Skeleton} from "./ui/skeleton.tsx";
import {Calendar} from "./ui/calendar.tsx";
import {useTranslation} from "react-i18next";
import {BottomActions} from "./BottomActions.tsx";
import {Button} from "./ui/button.tsx";

interface ScheduleSheetProps {
    selectedTimestamp?: number;
    onSelectDate: (date: number) => void;
    serviceVariantId?: number;
    optionIds?: number[];
}


function generateHourlySlotsForDay(dayTimestamp: number, intervalHours: number = 1): number[] {
    const now = dayjs();
    const threeHoursFromNow = now.add(3, 'hour');

    // Начало дня (00:00)
    const startOfDay = dayjs(dayTimestamp).startOf('day');
    // Ограничиваем время с 8:00 до 21:00 включительно
    const minTime = startOfDay.hour(8).minute(0).second(0);
    const maxTime = startOfDay.hour(21).minute(0).second(0);

    const slots: number[] = [];
    let currentSlot = minTime;

    // Генерируем слоты с интервалом в intervalHours часов до 21:00 включительно
    while (currentSlot.isBefore(maxTime) || currentSlot.isSame(maxTime)) {
        // Проверяем, что слот не раньше чем через 3 часа от текущего времени
        if (currentSlot.isAfter(threeHoursFromNow)) {
            slots.push(currentSlot.valueOf());
        }

        currentSlot = currentSlot.add(intervalHours, 'hour');
    }

    return slots;
}

export function ScheduleSheet({
                                  children,
                                  selectedTimestamp,
                                  onSelectDate,
                                  serviceVariantId,
                                  optionIds = []
                              }: React.PropsWithChildren<ScheduleSheetProps>) {
    const {t} = useTranslation();
    const {vibro, onBackButtonClick, clearBackButtonEvents, getLastBackButtonCallback} = useTelegram();
    const ref = useRef<(() => void) | undefined >(undefined);

    const [tab, setTab] = useState<Date | undefined>(dayjs.utc().startOf('day').toDate());

    // const {data: availableDates = []} = useGetAvailableDatesQuery({
    //     optionIds,
    //     serviceVariantId
    // }, {
    //     skip: !serviceVariantId || !optionIds
    // })

    // const availableDatesSet = useMemo(() => new Set(availableDates.map(formattedDate => dayjs(formattedDate).valueOf()) || []), [availableDates]);

    const isPastDate = useCallback((date: Date) => {
        // Получаем текущую дату в UTC и обнуляем время
        const todayUTC = dayjs().startOf('day');

        // Конвертируем входную дату в UTC и обнуляем время
        const inputDateUTC = dayjs(date).startOf('day');

        // Если дата раньше текущей UTC даты
        return inputDateUTC.isBefore(todayUTC);

        // // Если дата раньше текущей UTC даты
        // if(inputDateUTC.isBefore(todayUTC) || !availableDatesSet.size) {
        //     return true;
        // }

        // Сравниваем timestamp начала дня в UTC
        // const value = inputDateUTC.valueOf();
        // return !availableDatesSet.has(value);
    }, []);

    //  изменить выбор времени и даты заказа на свободный (вместо слотов)
    // const {data: availableSlots = [], isFetching} = useGetExecutorAvailableSlotsQuery({
    //     date: dayjs(tab).format('YYYY-MM-DD'),
    //     serviceVariantId,
    //     optionIds
    // }, {
    //     skip: !tab || !serviceVariantId || !optionIds
    // });

    const isFetching = false;

    const availableSlots = generateHourlySlotsForDay(dayjs(tab).valueOf()).map(timestamp => ({timestamp}));

    const filteredSlots = useMemo(() => availableSlots.filter(sl => dayjs.utc(sl.timestamp).valueOf() > dayjs.utc().valueOf()).map(sl => ({...sl, time: dayjs.utc(sl.timestamp).local().format('HH:mm')})).sort((a, b) => a.time.localeCompare(b.time)), [availableSlots]);

    const [opened, setOpened] = useState<boolean>(false);

    const onOpenChange = (opened: boolean) => {
        if(opened){
            vibro()
            // Нужно сохранить прошлый коллбек чтобы потом вернуть его
            const callback = getLastBackButtonCallback();
            ref.current = callback;
            // Удаляем последний коллбек чтобы он не сработал после закрытия шторки
            clearBackButtonEvents();
            onBackButtonClick(() => onOpenChange(false));
        } else {
            clearBackButtonEvents();
            // @ts-ignore
            onBackButtonClick(ref.current);
            ref.current = undefined;
            setOpened(false);
        }
    }

    const handleOnTriggerClick = () => setOpened(prevState => !prevState)

    return (
        <Sheet open={opened} onOpenChange={onOpenChange}>
            <SheetTrigger asChild onClick={handleOnTriggerClick}>
                {children}
            </SheetTrigger>
            <SheetContent side="bottom" className="h-screen rounded-none">
                <SheetHeader>
                    <SheetTitle
                        className="text-xl font-bold text-tg-theme-text-color text-left">{t('calendar_title')}</SheetTitle>
                </SheetHeader>
                <Calendar className="px-0"
                          mode="single"
                          selected={tab}
                          onSelect={setTab}
                          disabled={isPastDate} // изменить выбор времени и даты заказа на свободный
                          required={false}
                />
                {isFetching && <div className="grid grid-cols-3 gap-2 overflow-x-auto no-scrollbar">
                    <Skeleton className="w-full min-h-[40px]"/>
                    <Skeleton className="w-full min-h-[40px]"/>
                    <Skeleton className="w-full min-h-[40px]"/>
                    <Skeleton className="w-full min-h-[40px]"/>
                    <Skeleton className="w-full min-h-[40px]"/>
                    <Skeleton className="w-full min-h-[40px]"/>
                    <Skeleton className="w-full min-h-[40px]"/>
                    <Skeleton className="w-full min-h-[40px]"/>
                    <Skeleton className="w-full min-h-[40px]"/>
                    <Skeleton className="w-full min-h-[40px]"/>
                    <Skeleton className="w-full min-h-[40px]"/>
                    <Skeleton className="w-full min-h-[40px]"/>
                    <Skeleton className="w-full min-h-[40px]"/>
                    <Skeleton className="w-full min-h-[40px]"/>
                    <Skeleton className="w-full min-h-[40px]"/>
                </div>}
                {!isFetching && filteredSlots.length === 0 &&
                    <EmptyState className="h-50 my-0 flex-none" icon={<CalendarX/>} title="There are no available slots"
                                description="Please choose another day."/>}
                {!isFetching && filteredSlots.length > 0 &&
                    <div className="grid grid-cols-3 gap-2 overflow-x-auto no-scrollbar">
                        {filteredSlots.map(service =>
                            <CardItem
                                textClassName="items-center"
                                className={`min-h-[40px] p-2 border-transparent ${service.timestamp === selectedTimestamp && `[background-color:var(--tg-theme-button-color)!important]`}`}
                                key={service.timestamp}
                                title={service.time}
                                onClick={() => onSelectDate(service.timestamp)}
                            />)}
                    </div>}
                <BottomActions className="[padding-bottom:var(--tg-safe-area-inset-bottom)]">
                    <SheetTrigger asChild>
                        <Button
                            size="default"
                            wide
                            disabled={!selectedTimestamp}
                        >
                            {t('schedule_submit_btn')}
                        </Button>
                    </SheetTrigger>
                </BottomActions>
            </SheetContent>
        </Sheet>
    )
}
