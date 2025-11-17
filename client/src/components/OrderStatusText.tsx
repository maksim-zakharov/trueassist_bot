import {memo, useMemo} from "react";
import {useTranslation} from "react-i18next";

const OrderStatusTextFC = ({status}: { status: string }) => {
    const {t} = useTranslation();

    const orderStatusMap = useMemo(() => ({
        'todo': t('client_orders_todo_status'),
        'processed': t('client_orders_processed_status'),
        'completed': t('client_orders_completed_status'),
        'canceled': t('client_orders_canceled_status'),
    }) as { [status: string]: string }, [t]);

    return orderStatusMap[status]

}

export const OrderStatusText = memo(OrderStatusTextFC);