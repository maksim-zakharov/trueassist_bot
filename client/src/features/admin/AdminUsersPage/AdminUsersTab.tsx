import {Card} from "../../../components/ui/card.tsx";
import {Typography} from "../../../components/ui/Typography.tsx";
import dayjs from "dayjs";
import React, {useMemo} from "react";
import {ErrorState} from "../../../components/ErrorState.tsx";
import {EmptyState} from "../../../components/EmptyState.tsx";
import {ClipboardPlus} from "lucide-react";
import {Button} from "../../../components/ui/button.tsx";
import {RoutePaths} from "../../../routes.ts";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";

export const AdminUsersTab = ({users, isError, query}) => {
    const navigate = useNavigate()
    const {t} = useTranslation();

    const handleOrderClick = (order: any) => navigate(RoutePaths.Admin.Users.Details(order.id))

    const filteredUsers = useMemo(() => users.filter(user =>
        !query
        || user.id.toLowerCase().includes(query.toLowerCase())
        || user.firstName.toLowerCase().includes(query.toLowerCase())
        || user?.lastName?.toLowerCase().includes(query.toLowerCase())
        || user?.phone?.toLowerCase().includes(query.toLowerCase())
        || user?.username?.toLowerCase().includes(query.toLowerCase())
    ), [users, query]);

    if (isError) {
        return <ErrorState/>
    }

    if (filteredUsers.length === 0) {
        return <EmptyState
            icon={<ClipboardPlus className="h-10 w-10"/>}
            title={t('client_orders_empty_title')}
            description={t('client_orders_empty_description')}
            action={
                <Button onClick={() => navigate(RoutePaths.Root)}
                >
                    {t('client_orders_empty_btn')}
                </Button>}
        />
    }

    return <div className="p-4 flex flex-col gap-4">
        {filteredUsers.length > 0 && <div className="flex flex-col gap-4">
            {filteredUsers.map((ao: any) => <Card className="p-0 pl-4 gap-0 border-none card-bg-color"
                                          onClick={() => handleOrderClick(ao)}>
                <div className={`p-3 pl-0 ${ao.phone && 'separator-shadow-bottom'}`}>
                    <div className="flex justify-between">
                        <Typography.Title>{ao.firstName} {ao.lastName}</Typography.Title>
                        {ao.username && <a href={`https://t.me/${ao.username}`}
                                           target="_blank"><Typography.Title>@{ao.username}</Typography.Title></a>}
                    </div>
                    <div className="flex justify-between">
                        <Typography.Description>id: {ao.id}</Typography.Description>
                        <Typography.Description>{dayjs.utc(ao.createdAt).local().format('D MMMM, HH:mm')}</Typography.Description>
                    </div>
                </div>
                {ao.phone && <div className="p-3 pl-0 flex gap-2 flex-col">
                    <div className="flex justify-between">
                        <div className="flex flex-col">
                            <Typography.Description>Phone</Typography.Description>
                            <Typography.Title>{ao.phone}</Typography.Title>
                        </div>
                    </div>
                </div>}
            </Card>)}
        </div>}
    </div>
}