import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,} from "@/components/ui/sheet"
import React, { useRef, useState} from "react";
import {useTelegram} from "../hooks/useTelegram.tsx";
import dayjs from "dayjs";
import {Calendar} from "./ui/calendar.tsx";
import {useTranslation} from "react-i18next";
import {BottomActions} from "./BottomActions.tsx";
import {Button} from "./ui/button.tsx";

interface ScheduleSheetProps {
    selectedTimestamp?: Date;
    onSelectDate: (date?: Date) => void;
    disabled?: (date: Date) => boolean;
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

export function CalendarSheet({
                                  children,
                                  selectedTimestamp,
                                  onSelectDate,
    disabled
                              }: React.PropsWithChildren<ScheduleSheetProps>) {
    const {t} = useTranslation();
    const {vibro, onBackButtonClick, clearBackButtonEvents, getLastBackButtonCallback} = useTelegram();
    const ref = useRef<(() => void) | undefined >(undefined);

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
                        className="text-xl font-bold text-tg-theme-text-color text-left">Select date</SheetTitle>
                </SheetHeader>
                <Calendar className="px-0"
                          mode="single"
                          selected={selectedTimestamp}
                          onSelect={onSelectDate}
                          disabled={disabled} // изменить выбор времени и даты заказа на свободный
                          required={false}
                />
                <BottomActions className="[padding-bottom:var(--tg-safe-area-inset-bottom)]">
                    <SheetTrigger asChild>
                        <Button
                            size="default"
                            wide
                            disabled={!selectedTimestamp}
                            onClick={() => onSelectDate(selectedTimestamp)}
                        >
                            {t('schedule_submit_btn')}
                        </Button>
                    </SheetTrigger>
                </BottomActions>
            </SheetContent>
        </Sheet>
    )
}
