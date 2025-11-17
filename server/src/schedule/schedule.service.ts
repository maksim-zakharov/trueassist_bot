import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DayOfWeek, ServiceOption, ServiceVariant, User } from '@prisma/client';
import * as dayjs from 'dayjs';

const calculateOrderDuration = (
  serviceVariant: ServiceVariant,
  options: Partial<ServiceOption>[],
) =>
  serviceVariant.duration +
  options.reduce((sum, option) => sum + option.duration, 0);

const minutesToMilliseconds = (minutes: number) => minutes * 60_000;

@Injectable()
export class ScheduleService {
  private parseTime(time: string): Date {
    const [hours, minutes] = time.split(':');
    return new Date(`1970-01-01T${hours}:${minutes}:00Z`);
  }

  constructor(private prisma: PrismaService) {}

  async findSchedule(userId: User['id']) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        scheduleDays: {
          include: { timeSlots: true },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user.scheduleDays.map((day) => ({
      dayOfWeek: day.dayOfWeek,
      isDayOff: day.isDayOff,
      timeSlots: day.timeSlots.map((slot) => ({
        time: dayjs(slot.time).format('HH:mm'),
      })),
    }));
  }

  async updateSchedule(userId: User['id'], updateScheduleDto: any) {
    return this.prisma.$transaction(async (tx) => {
      // Проверяем существование пользователя
      // const user = await tx.user.findUnique({ where: { id: userId } });
      // if (!user) throw new NotFoundException('User not found');

      // Удаление старых данных
      const existingDays = await tx.scheduleDay.findMany({
        where: { userId },
        select: { id: true },
      });

      if (existingDays.length > 0) {
        await tx.timeSlot.deleteMany({
          where: { scheduleDayId: { in: existingDays.map((d) => d.id) } },
        });
        await tx.scheduleDay.deleteMany({ where: { userId } });
      }

      // Создание нового расписания
      for (const dayDto of updateScheduleDto.days) {
        await tx.scheduleDay.create({
          data: {
            dayOfWeek: dayDto.dayOfWeek,
            isDayOff: dayDto.isDayOff,
            userId,
            timeSlots: {
              create: dayDto.isDayOff
                ? []
                : dayDto.timeSlots.map((slot) => ({
                    time: this.parseTime(slot),
                  })),
            },
          },
        });
      }

      return this.findSchedule(userId);
    });
  }

  async getAvailableSlots(
    date: string,
    serviceVariantId: number,
    optionIds: number[] = [],
  ) {
    const startOfDay = dayjs(date).startOf('day');
    const endOfDay = dayjs(date).endOf('day');
    const dayOfWeek = startOfDay.format('ddd').toUpperCase() as DayOfWeek;

    // Получаем информацию о длительности услуг
    const serviceVariant = await this.prisma.serviceVariant.findUnique({
      where: { id: serviceVariantId },
      include: {
        baseService: {
          include: {
            options: {
              where: {
                id: { in: optionIds },
              },
              select: { duration: true },
            },
          },
        },
      },
    });

    if (!serviceVariant) {
      throw new NotFoundException('Service variant not found');
    }

    // Вычисляем общую длительность заказа в минутах
    const totalDuration = calculateOrderDuration(
      serviceVariant,
      serviceVariant.baseService.options,
    );

    // Получаем всех исполнителей (пользователей с одобренной заявкой)
    const executors = await this.prisma.user.findMany({
      where: {
        application: {
          status: 'APPROVED',
          variants: {
            some: {
              variantId: serviceVariantId,
            },
          },
        },
        scheduleDays: {
          some: {
            dayOfWeek,
            // Если у исполнителя выходной, пропускаем
            isDayOff: false,
          },
        },
      },
      include: {
        scheduleDays: {
          where: {
            dayOfWeek,
          },
          include: {
            timeSlots: true,
          },
        },
      },
    });

    // Получаем занятые слоты с их длительностью
    const busyOrders = await this.prisma.order.findMany({
      where: {
        date: {
          gte: startOfDay.toDate(),
          lte: endOfDay.toDate(),
        },
        status: {
          notIn: ['completed', 'canceled'],
        },
      },
      include: {
        serviceVariant: {
          include: {
            baseService: {
              include: {
                options: true,
              },
            },
          },
        },
        options: true,
      },
    });

    // Создаем массив занятых интервалов
    const busyIntervals = busyOrders.map((order) => {
      const orderDuration = calculateOrderDuration(
        order.serviceVariant,
        order.options,
      );

      return {
        start: order.date.getTime(),
        end: order.date.getTime() + minutesToMilliseconds(orderDuration), // конвертируем минуты в миллисекунды
      };
    });

    // Фильтруем слоты, оставляя только те, которые:
    // 1. Есть в графике хотя бы у одного исполнителя
    // 2. Не пересекаются с занятыми интервалами
    const availableSlots = new Set<number>();

    for (const executor of executors) {
      const scheduleDay = executor.scheduleDays[0];

      // Сортируем слоты по времени
      const sortedSlots = scheduleDay.timeSlots.sort(
        (a, b) => dayjs(a.time).valueOf() - dayjs(b.time).valueOf(),
      );

      // Проверяем каждый слот как потенциальное начало заказа
      for (let i = 0; i < sortedSlots.length; i++) {
        const startSlot = sortedSlots[i];
        const startTime = dayjs(startSlot.time);
        const startTimestamp = startOfDay
          .hour(startTime.hour())
          .minute(startTime.minute())
          .valueOf();

        const endTimestamp =
          startTimestamp + minutesToMilliseconds(totalDuration);

        // Проверяем, что все слоты в интервале доступны
        let isIntervalAvailable = true;
        let currentSlotIndex = i;

        while (currentSlotIndex < sortedSlots.length) {
          const currentSlot = sortedSlots[currentSlotIndex];
          const currentTime = dayjs(currentSlot.time);
          const currentTimestamp = startOfDay
            .hour(currentTime.hour())
            .minute(currentTime.minute())
            .valueOf();

          // Если текущий слот выходит за пределы рабочего дня, прерываем
          if (currentTimestamp >= endOfDay.valueOf()) {
            isIntervalAvailable = false;
            break;
          }

          // Если достигли конца интервала, прерываем
          if (currentTimestamp >= endTimestamp) {
            break;
          }

          // Проверяем, не пересекается ли текущий слот с занятыми интервалами
          const isSlotBusy = busyIntervals.some(
            (interval) =>
              (currentTimestamp >= interval.start &&
                currentTimestamp < interval.end) || // начало слота попадает в занятый интервал
              (currentTimestamp + 60 * 60_1000 > interval.start &&
                currentTimestamp + 60 * 60_1000 <= interval.end) || // конец слота попадает в занятый интервал
              (currentTimestamp <= interval.start &&
                currentTimestamp + 60 * 60_1000 >= interval.end), // слот полностью содержит занятый интервал
          );

          if (isSlotBusy) {
            isIntervalAvailable = false;
            break;
          }

          currentSlotIndex++;
        }

        // Если нашли непрерывный интервал нужной длительности, добавляем начальный слот
        if (
          isIntervalAvailable &&
          currentSlotIndex - i >= Math.ceil(totalDuration / 60)
        ) {
          availableSlots.add(startTimestamp);
        }
      }
    }

    return Array.from(availableSlots).map((timestamp) => ({ timestamp }));
  }

  async getAvailableDates(serviceVariantId: number, optionIds: number[] = []) {
    // Получаем информацию о длительности услуг
    const serviceVariant = await this.prisma.serviceVariant.findUnique({
      where: { id: serviceVariantId },
      include: {
        baseService: {
          include: {
            options: {
              where: {
                id: { in: optionIds },
              },
              select: { duration: true },
            },
          },
        },
      },
    });

    if (!serviceVariant) {
      throw new NotFoundException('Service variant not found');
    }

    // Вычисляем общую длительность заказа в минутах
    const totalDuration = calculateOrderDuration(
      serviceVariant,
      serviceVariant.baseService.options,
    );

    // Получаем всех исполнителей (пользователей с одобренной заявкой)
    const executors = await this.prisma.user.findMany({
      where: {
        application: {
          status: 'APPROVED',
          variants: {
            some: {
              variantId: serviceVariantId,
            },
          },
        },
        scheduleDays: {
          some: {
            // Если у исполнителя выходной, пропускаем
            isDayOff: false,
          },
        },
      },
      include: {
        scheduleDays: {
          include: {
            timeSlots: true,
          },
        },
      },
    });

    // Получаем занятые слоты на следующие 30 дней
    const startDate = dayjs().startOf('day');
    const endDate = startDate.add(30, 'day');

    // Получаем занятые слоты с их длительностью
    const busyOrders = await this.prisma.order.findMany({
      where: {
        date: {
          gte: startDate.toDate(),
          lt: endDate.toDate(),
        },
        status: {
          notIn: ['completed', 'canceled'],
        },
      },
      include: {
        serviceVariant: {
          include: {
            baseService: {
              include: {
                options: true,
              },
            },
          },
        },
        options: true,
      },
    });

    // Создаем массив занятых интервалов
    const busyIntervals = busyOrders.map((order) => {
      const orderDuration = calculateOrderDuration(
        order.serviceVariant,
        order.options,
      );

      return {
        start: order.date.getTime(),
        end: order.date.getTime() + minutesToMilliseconds(orderDuration), // конвертируем минуты в миллисекунды
      };
    });

    // Формируем массив доступных дат
    const availableDates = new Set<string>([]);

    const executorIdDayOfWeekScheduleDayMap = executors.reduce(
      (acc, executor) => {
        acc[executor.id] = executor.scheduleDays.reduce((acc, scheduleDay) => {
          acc[scheduleDay.dayOfWeek] = scheduleDay;
          return acc;
        }, {});

        return acc;
      },
      {},
    );

    // Пройдемся по каждому дню и узнаем есть ли время хотя бы у одного исполнителя для данного заказа в этот день
    for (let i = 0; i < 30; i++) {
      const currentDate = startDate.add(i, 'day');
      const startOfDay = dayjs(currentDate).startOf('day');
      const endOfDay = dayjs(currentDate).endOf('day');
      const dayOfWeek = currentDate.format('ddd').toUpperCase() as DayOfWeek;

      // Проверяем, есть ли исполнители с доступными слотами в этот день
      for (const executor of executors) {
        const scheduleDay =
          executorIdDayOfWeekScheduleDayMap[executor.id]?.[dayOfWeek];
        if (!scheduleDay || scheduleDay.isDayOff) continue;

        // Получаем занятые интервалы для текущего дня
        const dayBusyIntervals = busyIntervals.filter((order) =>
          dayjs(order.start).isSame(currentDate, 'day'),
        );

        // Сортируем слоты по времени
        const sortedSlots = scheduleDay.timeSlots.sort(
          (a, b) => dayjs(a.time).valueOf() - dayjs(b.time).valueOf(),
        );

        // Проверяем каждый слот как потенциальное начало заказа
        for (let i = 0; i < sortedSlots.length; i++) {
          const startSlot = sortedSlots[i];
          const startTime = dayjs(startSlot.time);
          const startTimestamp = startOfDay
            .hour(startTime.hour())
            .minute(startTime.minute())
            .valueOf();

          const endTimestamp =
            startTimestamp + minutesToMilliseconds(totalDuration);

          // Проверяем, что все слоты в интервале доступны
          let isIntervalAvailable = true;
          let currentSlotIndex = i;

          while (currentSlotIndex < sortedSlots.length) {
            const currentSlot = sortedSlots[currentSlotIndex];
            const currentTime = dayjs(currentSlot.time);
            const currentTimestamp = startOfDay
              .hour(currentTime.hour())
              .minute(currentTime.minute())
              .valueOf();

            // Если текущий слот выходит за пределы рабочего дня, прерываем
            if (currentTimestamp >= endOfDay.valueOf()) {
              isIntervalAvailable = false;
              break;
            }

            // Если достигли конца интервала, прерываем
            if (currentTimestamp >= endTimestamp) {
              break;
            }

            // Проверяем, не пересекается ли текущий слот с занятыми интервалами
            const isSlotBusy = dayBusyIntervals.some(
              (interval) =>
                (currentTimestamp >= interval.start &&
                  currentTimestamp < interval.end) || // начало слота попадает в занятый интервал
                (currentTimestamp + 60 * 60_1000 > interval.start &&
                  currentTimestamp + 60 * 60_1000 <= interval.end) || // конец слота попадает в занятый интервал
                (currentTimestamp <= interval.start &&
                  currentTimestamp + 60 * 60_1000 >= interval.end), // слот полностью содержит занятый интервал
            );

            if (isSlotBusy) {
              isIntervalAvailable = false;
              break;
            }

            currentSlotIndex++;
          }

          // Если нашли непрерывный интервал нужной длительности, добавляем начальный слот
          if (
            isIntervalAvailable &&
            currentSlotIndex - i >= Math.ceil(totalDuration / 60)
          ) {
            availableDates.add(startOfDay.format('YYYY-MM-DD'));
            // Если хотя бы 1 слот есть - уже можно брейкать цикл
            break;
          }
        }
        if (availableDates.has(startOfDay.format('YYYY-MM-DD'))) {
          // И из этого цикла тоже выходим, достаточно
          break;
        }
      }
    }

    return Array.from(availableDates);
  }
}
