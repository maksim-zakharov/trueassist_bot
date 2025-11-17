import {ClipboardList, ListChecks, LucideIcon, MessageCircle, User, Users} from "lucide-react"
import {Outlet, useNavigate} from "react-router-dom"
import {useTelegram} from "../../hooks/useTelegram.tsx";
import React, {useMemo} from "react";
import {Avatar, AvatarFallback, AvatarImage} from "../ui/avatar.tsx";
import {useSelector} from "react-redux";
import {Skeleton} from "../ui/skeleton.tsx";
import {RoutePaths} from "../../routes.ts";
import {Navbar} from "../ui/navbar.tsx";
import {useTranslation} from "react-i18next";

type MenuItem = {
    icon: LucideIcon | any
    label: string
    path: string
}

export const AdminLayout = () => {
    const {t} = useTranslation();
    const userInfo = useSelector(state => state.createOrder.userInfo);
    const navigate = useNavigate()
    const {isReady} = useTelegram();

    const Profile = () => <Avatar className="size-[22px]" onClick={() => navigate(RoutePaths.Executor.Profile)}>
        <AvatarImage src={userInfo?.photoUrl}/>
        <AvatarFallback><User/></AvatarFallback>
    </Avatar>

    const menuItems: MenuItem[] = useMemo(() => [
        {
            icon: Users,
            label: t('menu_item_users'),
            path: RoutePaths.Admin.Users.List
        },
        {
            icon: ClipboardList,
            label: t('menu_item_orders'),
            path: RoutePaths.Admin.Order.List
        },
        {
            icon: ListChecks,
            label: t('menu_item_services'),
            path: RoutePaths.Admin.Services.List
        },
        {
            icon: MessageCircle,
            label: t('menu_item_chat'),
            path: RoutePaths.Admin.Chat.List
        },
        {
            icon: Profile,
            label: t('menu_item_profile'),
            path: RoutePaths.Admin.Profile
        }
    ], [Profile, t])

    if (!isReady) {
        return <div>
            <Skeleton className="w-full h-[56px] rounded-none"/>
            <div className="px-4 mb-6 mt-4 flex flex-col gap-2">
                <Skeleton className="w-[100px] h-[28px] mb-1"/>
                <div className="flex gap-2">
                    <Skeleton className="w-full h-[140px]"/>
                    <Skeleton className="w-full h-[140px]"/>
                </div>
                <div className="flex gap-2">
                    <Skeleton className="w-full h-[140px]"/>
                    <Skeleton className="w-full h-[140px]"/>
                </div>
                <div className="flex gap-2">
                    <Skeleton className="w-full h-[140px]"/>
                    <Skeleton className="w-full h-[140px]"/>
                </div>
                <div className="flex gap-2">
                    <Skeleton className="w-full h-[140px]"/>
                    <Skeleton className="w-full h-[140px]"/>
                </div>
                <div className="flex gap-2">
                    <Skeleton className="w-full h-[140px]"/>
                    <Skeleton className="w-full h-[140px]"/>
                </div>
            </div>
        </div>;
    }

    return <>
        <div className="content w-full">
            <Outlet/>
        </div>

        <Navbar menuItems={menuItems}/>
    </>
} 