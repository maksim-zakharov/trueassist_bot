import React, {useMemo} from "react";
import {useGetAdminOrdersQuery} from "../../api/ordersApi.ts";
import {useTranslation} from "react-i18next";
import {ErrorState} from "../../components/ErrorState.tsx";
import {AdminOrdersList} from "../../components/AdminOrdersList.tsx";
import {Tabs, TabsList, TabsTrigger} from "../../components/ui/tabs.tsx";


export const AdminOrdersPage = () => {
    const {t} = useTranslation();
    const {data: orders = [], isLoading, isError} = useGetAdminOrdersQuery(undefined, {
        refetchOnMountOrArgChange: true
    });

    const activeOrders = useMemo(() => orders.filter(o => !['completed', 'canceled'].includes(o.status)).sort((a, b) => b.id - a.id), [orders]);
    const completedOrders = useMemo(() => orders.filter(o => ['completed', 'canceled'].includes(o.status)).sort((a, b) => b.id - a.id), [orders]);

    const tabs = [
        {
            id: 'active',
            label: t('bonuses_tabs_active')
        },
        {
            id: 'completed',
            label: t('bonuses_tabs_completed')
        }
    ]

    const [selectedTab, setSelectedTab] = React.useState<string>(tabs[0].id);

    if (isError) {
        return <ErrorState/>
    }

    return <>
        <Tabs value={selectedTab} defaultValue={selectedTab}>
            <TabsList className="bg-inherit flex pl-8 justify-around">
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
        <AdminOrdersList isLoading={isLoading} orders={selectedTab === 'active' ? activeOrders : completedOrders}/>
    </>
}