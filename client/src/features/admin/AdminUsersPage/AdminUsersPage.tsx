import React, {useState} from "react";
import {useGetAdminApplicationsQuery, useGetAdminUsersQuery} from "../../../api/ordersApi.ts";
import {Skeleton} from "../../../components/ui/skeleton.tsx";
import {Header} from "../../../components/ui/Header.tsx";
import {Tabs, TabsList, TabsTrigger} from "../../../components/ui/tabs.tsx";
import {AdminUsersTab} from "./AdminUsersTab.tsx";
import {AdminApplicationsTab} from "./AdminApplicationsTab.tsx";
import {useTranslation} from "react-i18next";
import {Input} from "../../../components/ui/input.tsx";


export const AdminUsersPage = () => {
    const {t} = useTranslation();
    const {data: users = [], isLoading, isError} = useGetAdminUsersQuery(undefined, {
        refetchOnMountOrArgChange: true
    });
    const {data: applications = []} = useGetAdminApplicationsQuery();

    const tabs = [
        {
            id: 'users',
            label: t('menu_item_users')
        },
        {
            id: 'applications',
            label: 'Applications'
        }
    ]

    const [selectedTab, setSelectedTab] = React.useState<string>(tabs[0].id);

    const [query, setQuery] = useState<string>('');

    if (isLoading) {
        return <div className="px-4 mb-4">
            <Header className="flex justify-center">
                <Skeleton className="w-[100px] h-[28px]"/>
            </Header>
            <div className="flex flex-col gap-4 mt-4">
                <Skeleton className="w-full h-[144px]"/>
                <Skeleton className="w-full h-[144px]"/>
                <Skeleton className="w-full h-[144px]"/>
                <Skeleton className="w-full h-[144px]"/>
            </div>
        </div>
    }

    return <>
    <div className="px-4 pt-4">
        <Input value={query} onChange={e => setQuery(e.target.value)} className="border-none card-bg-color rounded-lg text-tg-theme-hint-color h-10 placeholder-[var(--tg-theme-hint-color)] text-center" placeholder="Search by phone, name, id"/>
    </div>
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
        {selectedTab === 'users' && <AdminUsersTab users={users} isError={isError} query={query}/>}
        {selectedTab === 'applications' && <AdminApplicationsTab applications={applications} isError={isError} query={query}/>}
    </>
}