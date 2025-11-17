import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "../../components/ui/accordion.tsx";
import React, {useMemo, useState} from "react";
import dayjs from "dayjs";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group.tsx";
import {useGetScheduleQuery, useUpdateScheduleMutation} from "../../api/api.ts";
import {toast} from "sonner";
import {CalendarCheck} from "lucide-react";
import {useTranslation} from "react-i18next";
import {Skeleton} from "../../components/ui/skeleton.tsx";
import {ErrorState} from "../../components/ErrorState.tsx";
import {Header} from "../../components/ui/Header.tsx";
import {Button} from "../../components/ui/button.tsx";
import {Typography} from "../../components/ui/Typography.tsx";

function generateTimeSlots(parentDate) {
    const slots = [];
    const start = parentDate.startOf('day').add(8, 'hour');
    const end = parentDate.startOf('day').add(24, 'hour');

    let current = start;
    const i = 0;

    while (current.isBefore(end)) {
        const slotStart = current;
        const slotEnd = current.add(60, 'minute');

        slots.push({
            timestamp: slotStart.valueOf(),
            time: slotStart.format('HH:mm')
        });

        current = slotEnd;
    }

    return slots;
}


export const ExecutorSchedulePage = () => {
    const {t} = useTranslation();
    const {data: schedule = [], isLoading} = useGetScheduleQuery({})
    const [updateSchedule, {isLoading: updateScheduleLoading, isError}] = useUpdateScheduleMutation()
    const slots = useMemo(() => generateTimeSlots(dayjs.utc()), []);
    const weekDays = useMemo(() => {

        const weekDays = [];

// Создаем базовую дату (понедельник)
        const baseDate = dayjs.utc().startOf('week');

// Генерируем массив дней недели
        for (let i = 0; i < 7; i++) {
            const currentDate = baseDate.add(i, 'day');

            weekDays.push({
                label: currentDate.format('dddd'), // Полное название на русском
                value: currentDate.locale('en').format('ddd').toUpperCase(), // Сокращение на английском
            });
        }
        return weekDays;
    }, []);
    const [defaultValue, setdefaultValue] = useState<string>(weekDays[0].value);

    const convertUTCToLocal = (localTime) => {
        const [hours, minutes] = localTime.split(':');
        const date = dayjs.utc()
            .hour(hours)
            .minute(minutes)
            .startOf('minute');

        return date.local().format('HH:mm');
    }

    const scheduleMap = useMemo(() => schedule.reduce((acc, curr) => {
        const {isDayOff, timeSlots} = curr;
        if (isDayOff) {
            acc[curr.dayOfWeek] = [];
        } else {
            acc[curr.dayOfWeek] = timeSlots.map((curr) => convertUTCToLocal(curr.time))
        }

        return acc;
    }, {}), [schedule]);

    const handleOnToggle = async (day: any, event: any) => {
        // включить
        if (event.target.dataset.state === 'off') {
            if (event.target.dataset.value === 'dayoff') {
                scheduleMap[day] = [];
            } else {
                if (!scheduleMap[day]) {
                    scheduleMap[day] = [];
                }
                scheduleMap[day].push(event.target.dataset.value)
            }
        } else {
            scheduleMap[day] = scheduleMap[day].filter(val => val !== event.target.dataset.value)
        }

        // Преобразуем локальное время в UTC
        const convertToUTC = (localTime) => {
            const [hours, minutes] = localTime.split(':');
            const date = dayjs()
                .hour(hours)
                .minute(minutes)
                .startOf('minute');

            return date.utc().format('HH:mm');
        }

        await updateSchedule({
            "days": Object.entries<any[]>(scheduleMap).map(([dayOfWeek, timeSlots]) => ({
                dayOfWeek,
                isDayOff: timeSlots?.length <= 0,
                timeSlots: timeSlots?.map(convertToUTC),
            }))
        }).unwrap()

        toast(t('schedule_update_success'), {
            classNames: {
                icon: 'mr-2 h-5 w-5 text-[var(--chart-2)]'
            },
            icon: <CalendarCheck className="h-5 w-5 text-[var(--chart-2)]"/>
        })
    }

    const calculateDayStatus = (slots: string[]) => {
        if (slots?.length > 0) {
            const conf = slots.reduce((acc, curr) => {
                if (!acc.start) {
                    acc.start = curr;
                }
                if (!acc.end) {
                    acc.end = curr;
                }

                if (acc.start.localeCompare(curr) === 1) {
                    acc.start = curr;
                }

                if (acc.end.localeCompare(curr) === -1) {
                    acc.end = curr;
                }

                return acc;
            }, {start: '', end: ''});

            return `${conf.start} - ${conf.end}`;
        } else {
            return t('schedule_update_dayoff');
        }
    };

    if (isLoading) {
        return <div className="px-4">
            <div className="flex flex-col gap-2 mt-4">
                <Skeleton className="w-full h-[180px]"/>
                <Skeleton className="w-full h-[52px]"/>
                <Skeleton className="w-full h-[52px]"/>
                <Skeleton className="w-full h-[52px]"/>
                <Skeleton className="w-full h-[52px]"/>
                <Skeleton className="w-full h-[52px]"/>
                <Skeleton className="w-full h-[52px]"/>
            </div>
        </div>
    }

    if (isError) {
        return <ErrorState/>
    }

    return <>
        <Header className="flex justify-center">
            <Button variant="ghost"
                    className="flex flex-col items-center h-auto text-tg-theme-text-color text-base font-medium">
                <Typography.Title>{t('menu_item_schedule')}</Typography.Title>
            </Button>
        </Header>
        <div className="p-4">
            <Accordion
                type="single"
                collapsible
                value={defaultValue}
                onValueChange={v => setdefaultValue(v)}
                className="flex flex-col gap-2"
            >
                {weekDays.map(day => <AccordionItem value={day.value} className="rounded-xl">
                    <AccordionTrigger hideChevron>
                        <div className="flex justify-between w-full">
                            <span className="text-lg font-medium text-tg-theme-text-color">{day.label}</span>
                            <span
                                className="text-lg font-medium text-tg-theme-text-color">{calculateDayStatus(scheduleMap[day.value.toUpperCase()])}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <ToggleGroup type="multiple" className="grid grid-cols-6 w-full gap-0.5"
                                     disabled={updateScheduleLoading}
                                     value={scheduleMap[day.value.toUpperCase()]?.length > 0 ? scheduleMap[day.value.toUpperCase()] : 'dayoff'}>
                            {slots.map(slot => <ToggleGroupItem onClick={event => handleOnToggle(day.value, event)}
                                                                value={slot.time}
                                                                className="border-[0.5px] border-tg-theme-hint-color first:rounded-none last:rounded-none">
                                {slot.time}
                            </ToggleGroupItem>)}
                            <ToggleGroupItem value="dayoff" onClick={event => handleOnToggle(day.value, event)}
                                             className="border-[0.5px] border-tg-theme-hint-color first:rounded-none last:rounded-none col-span-2">
                                {t('schedule_update_dayoff')}
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </AccordionContent>
                </AccordionItem>)}
            </Accordion>
        </div>
    </>
}