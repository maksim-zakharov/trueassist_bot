import React, {FC, useMemo} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {
    useGetAdminApplicationByUserIdQuery, useGetAdminBonusesByUserIdQuery,
    useGetAdminOrdersByUserIdQuery,
    useGetAdminUserByIdQuery
} from "../../../api/ordersApi.ts";
import {Skeleton} from "../../../components/ui/skeleton.tsx";
import {RoutePaths} from "../../../routes.ts";
import {useTranslation} from "react-i18next";
import {ErrorState} from "../../../components/ErrorState.tsx";
import {useBackButton} from "../../../hooks/useTelegram.tsx";
import {Tabs, TabsList, TabsTrigger} from "../../../components/ui/tabs.tsx";
import {AdminOrdersList} from "../../../components/AdminOrdersList.tsx";
import {AdminApplicationTab} from "./AdminApplicationTab.tsx";
import {InvitesList} from "../../../components/InvitesList.tsx";
import {BonusTotal, BonusTotalSkeleton} from "../../../components/BonusTotal.tsx";
import {ProfileSection, ProfileSkeleton} from "../../../components/ProfileSection.tsx";

export const AdminUsersDetailsPage: FC = () => {
    useBackButton(() => navigate(RoutePaths.Admin.Users.List));

    const {t} = useTranslation();
    const navigate = useNavigate()

    const {id} = useParams<string>();
    const {data: application} = useGetAdminApplicationByUserIdQuery({id: id!});
    const {data: bonuses = [], isSuccess: isSuccessInvites, isLoading: isLoadingInvites} = useGetAdminBonusesByUserIdQuery({id: id!});

    const tabs = useMemo(() => {
        const _tabs = [
            {
                id: 'orders',
                label: t('menu_item_orders')
            },
            {
                id: 'invites',
                label: 'Bonuses'
            },
        ];

        if (application) {
            _tabs.unshift(
                {
                    id: 'application',
                    label: t('user_application_title')
                });
        }

        return _tabs;
    }, [application]);

    const [selectedTab, setSelectedTab] = React.useState<string>(tabs[0].id);

    const {data: user, isLoading, isError} = useGetAdminUserByIdQuery({id: id!});
    const {data: orders, isLoading: isLoadingOrders} = useGetAdminOrdersByUserIdQuery({id: id!})

    if (isLoading || !user) {
        return <div className="flex flex-col bg-inherit overflow-y-auto overscroll-none h-screen pb-4 mt-4">
            <div className="flex flex-col gap-5 bg-inherit px-4 py-2">
                <ProfileSkeleton/>
                <BonusTotalSkeleton/>
            </div>
            <Skeleton className="w-full h-[64px]"/>
            <Skeleton className="w-full h-[52px]"/>
        </div>
    }

    if (isError) {
        return <div
            className="h-screen">
            <ErrorState/>
        </div>
    }

    return <div className="flex flex-col bg-inherit overflow-y-auto overscroll-none h-screen pb-4">
        <div className="flex flex-col gap-1 bg-inherit px-4 py-2">
            <ProfileSection user={user}/>
            <BonusTotal bonuses={bonuses} isAdmin userId={user.id}/>
        </div>

        <Tabs value={selectedTab} defaultValue={selectedTab}>
            <TabsList className="bg-inherit flex pl-8">
                {tabs.map(tab => (
                    <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        onClick={() => setSelectedTab(tab.id)}
                    >
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
        {selectedTab === 'orders' && <AdminOrdersList orders={orders} isLoading={isLoadingOrders}/>}

        {selectedTab === 'application' && <AdminApplicationTab application={application}/>}
        {selectedTab === 'invites' && <InvitesList invites={bonuses} isSuccess={isSuccessInvites} isLoading={isLoadingInvites}/>}
    </div>
}