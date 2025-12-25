import {useDispatch, useSelector} from "react-redux";
import {Typography} from "../../components/ui/Typography.tsx";
import React, {useEffect, useMemo, useState} from "react";
import {
    BriefcaseBusiness,
    CalendarClock,
    ChevronRight,
    HandCoins,
    MapPin,
    Phone,
    ShieldUser,
    Star,
    X
} from "lucide-react";
import {Button} from "../../components/ui/button.tsx";
import parsePhoneNumberFromString from "libphonenumber-js";
import {Switch} from "../../components/ui/switch.tsx";
import {logout} from "../../slices/createOrderSlice.ts";
import {RoutePaths} from "../../routes.ts";
import {useNavigate} from "react-router-dom";
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "../../components/ui/sheet.tsx";
import {BottomActions} from "../../components/BottomActions.tsx";
import {ListButton} from "@/components/ListButton/ListButton.tsx";
import {ListButtonGroup} from "../../components/ListButton/ListButton.tsx";
import {useGetApplicationQuery, useGetUserInfoQuery, useLoginMutation} from "../../api/api.ts";
import {useTranslation} from "react-i18next";
import {Skeleton} from "../../components/ui/skeleton.tsx";
import {useBackButton} from "../../hooks/useTelegram.tsx";
import {ProfileApplicationCard} from "../../components/ProfileApplicationCard.tsx";
import {ProfileSection, ProfileSkeleton} from "../../components/ProfileSection.tsx";
import {LanguageSelector} from "../../components/LanguageSelector.tsx";

export const ProfilePage = () => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const [loginMutation, {isLoading: isLoginLoading}] = useLoginMutation();
    const {data: application, isLoading: applicationLoading} = useGetApplicationQuery();
    const {isFetching: isUserInfoFetching} = useGetUserInfoQuery(undefined, {
        skip: false
    });
    const [show, setShow] = useState(false);
    const navigate = useNavigate()
    useBackButton(() => navigate(RoutePaths.Root));
    const userInfo = useSelector(state => state.createOrder.userInfo);
    const address = useSelector(state => state.createOrder.geo?.address);
    const [writeAccessReceived, setWriteAccessReceived] = useState<boolean>(false)
    const [isWaitingForRoleChange, setIsWaitingForRoleChange] = useState(false);
    
    // Отслеживаем, когда логин завершился и начался перезапрос userInfo
    useEffect(() => {
        if (isLoginLoading) {
            setIsWaitingForRoleChange(true);
        }
    }, [isLoginLoading]);
    
    // Когда userInfo обновился (перезапрос завершен), сбрасываем флаг
    useEffect(() => {
        if (isWaitingForRoleChange && !isUserInfoFetching && !isLoginLoading) {
            // Небольшая задержка, чтобы App.tsx успел сделать редирект
            const timer = setTimeout(() => {
                setIsWaitingForRoleChange(false);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isWaitingForRoleChange, isUserInfoFetching, isLoginLoading]);
    
    // Показываем скелетон если идет загрузка или ожидается смена роли
    const isLoading = applicationLoading || isLoginLoading || isWaitingForRoleChange;

    const phoneText = useMemo(() => {
        if (!userInfo?.phone) {
            return t('profile_phone_notavailable')
        }

        const phoneNumber = parsePhoneNumberFromString(userInfo.phone, 'RU');
        return phoneNumber?.formatInternational() || userInfo.phone;
    }, [userInfo, t]);

    const handleRequestWriteAccess = () => Telegram.WebApp?.requestWriteAccess(async (isRequested) => {
        if (!isRequested) {
            return;
        }
        setWriteAccessReceived(isRequested)
    })

    const handleRequestContact = () => Telegram.WebApp?.requestContact(async (isRequested) => {
        if (!isRequested) {
            return;
        }
        dispatch(logout())
        window.location.reload();
    })

    const addressText = useMemo(() => {
        if (!address) {
            return t('profile_address_notavailable')
        }

        const text = [];
        if (address.city) text.push(address.city);
        if (address.road) text.push(address.road);
        if (address.house_number) text.push(address.house_number);

        return text.join(', ');
    }, [address, t]);

    const confirmLogout = () => {
        dispatch(logout())
        navigate(RoutePaths.Root)
        Telegram.WebApp?.close()
        // Проверяем, является ли окно PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
            window.close();
        }
        // Fallback если не в ТГ
        window.location.href = 'about:blank';
    }

    const handleLogout = () => {
        Telegram.WebApp.showPopup({
            title: `Confirm log out`,
            message: 'Are you sure you want to log out?',
            buttons: [{
                id: 'ok',
                text: 'Log out',
                type: 'destructive'
            }, {
                id: 'cancel',
                text: 'Cancel',
                type: 'default'
            }]
        }, buttonId => buttonId === 'ok' && confirmLogout())
    }

    const handleWorkClick = () => {
        if (application) {
            navigate(RoutePaths.Application);
        } else {
            setShow(true)
        }
    }

    const handleLogin = async () => {
        setIsWaitingForRoleChange(true);
        try {
            await loginMutation(userInfo?.role === 'client' ? 'executor' : 'client').unwrap();
        } catch (error) {
            setIsWaitingForRoleChange(false);
        }
    }
    
    const handleAdminLogin = async () => {
        setIsWaitingForRoleChange(true);
        try {
            await loginMutation(userInfo?.role !== 'admin' ? 'admin' : 'client').unwrap();
        } catch (error) {
            setIsWaitingForRoleChange(false);
        }
    }

    if (applicationLoading || isLoading) {
        return <div className="flex flex-col gap-6 p-4">
            <ProfileSkeleton/>
            <Skeleton className="w-full h-[112px]"/>
            <Skeleton className="w-full h-[44px]"/>
            <Skeleton className="w-full h-[44px]"/>
            {userInfo?.role === 'executor' && <div>
                <Skeleton className="w-30 h-[24px] pl-2"/>
                <Skeleton className="w-20 h-[20px] pl-2 mt-4 mb-2"/>
                <Skeleton className="w-full h-[44px] rounded-bl-none rounded-br-none"/>
                <Skeleton className="w-full h-[44px] rounded-none"/>
                <Skeleton className="w-full h-[44px] rounded-none"/>
                <Skeleton className="w-full h-[44px] rounded-tl-none rounded-tr-none"/>
            </div>}
            <Skeleton className="w-full h-[40px]"/>
        </div>
    }

    return <>
        {/*<Header className="flex justify-center">*/}
        {/*    <Button variant="ghost"*/}
        {/*            className="flex flex-col items-center h-auto text-tg-theme-text-color text-base font-medium">*/}
        {/*        <Typography.Title>{t('menu_item_profile')}</Typography.Title>*/}
        {/*    </Button>*/}
        {/*</Header>*/}
        <ProfileSection user={userInfo}/>
        <div className="flex flex-col content text-center p-4 gap-6 pb-6 w-full pt-0 mt-6">
            <ListButtonGroup>
                <ListButton icon={<Phone className="p-1 w-7 h-7 bg-[var(--tg-accent-green)] rounded-md"/>}
                            text={<div className="flex flex-col text-left">
                                <Typography.Description>{t('phone')}</Typography.Description>
                                {phoneText}
                            </div>} extra={
                    !userInfo?.phone && <Button className="p-0 border-none h-6" size="sm" variant="default"
                                                onClick={handleRequestContact}>
                        {t('error_refresh_btn')}
                    </Button>}/>

                <ListButton text={<div className="flex flex-col text-left">
                    <Typography.Description>{t('address')}</Typography.Description>
                    {addressText || '-'}
                </div>} icon={<MapPin className="p-1 w-7 h-7 bg-[var(--tg-accent-blue)] rounded-md"/>}/>
            </ListButtonGroup>

            <ListButton icon={<img src="../telegram.svg"
                                   className="absolute mr-4 h-7 w-7 bg-[#2AABEE] rounded-md"/>}
                        text={t('telegram_notifications')}
                        extra={<Switch
                            checked={writeAccessReceived}
                            onCheckedChange={handleRequestWriteAccess}
                        />}/>

            <LanguageSelector/>

            {(!application || application.status !== 'APPROVED') && <Sheet open={show}>
                <SheetTrigger asChild>
                    <ListButton onClick={handleWorkClick}
                                icon={<BriefcaseBusiness className="mr-4 h-7 w-7 rounded-md p-1 bg-[var(--chart-5)]"/>}
                                text={t('request_work_btn')}/>
                </SheetTrigger>
                <SheetContent side="bottom"
                              className="p-0 overflow-hidden pb-[calc(50px+var(--tg-safe-area-inset-bottom))] min-h-[calc(700px+var(--tg-safe-area-inset-bottom))] h-[calc(100vh-50px)]">
                    <Button
                        onClick={() => setShow(false)}
                        className="border-none absolute rounded-3xl p-2 card-bg-color-transparency top-2 left-2"
                        variant="ghost"><X/></Button>
                    <img src="../img_1.png" className="h-[240px] object-cover"/>
                    <div className="p-4">
                        <SheetHeader className="mb-2">
                            <SheetTitle
                                className="text-xl font-bold text-tg-theme-text-color text-left"><Typography.H2
                                className="text-3xl">{t('new_application_title')}</Typography.H2></SheetTitle>
                        </SheetHeader>
                        <div className="flex mb-7">
                            {t('new_application_description')}
                        </div>
                        <div className="grid grid-cols-[56px_auto] mb-3">
                            <CalendarClock className="h-10 w-10 rounded-3xl bg-[var(--chart-1)] p-2 mr-3"/>
                            {t('new_application_first')}
                        </div>
                        <div className="grid grid-cols-[56px_auto] mb-3">
                            <HandCoins className="h-10 w-10 rounded-3xl bg-[var(--chart-2)] p-2 mr-3"/>
                            {t('new_application_second')}
                        </div>
                        <div className="grid grid-cols-[56px_auto] mb-4">
                            <Star className="h-10 w-10 rounded-3xl bg-[var(--chart-5)] p-2 mr-3"/>
                            {t('new_application_thirst')}
                        </div>
                    </div>
                    <BottomActions className="flex [padding-bottom:var(--tg-safe-area-inset-bottom)]">
                        <Button variant="primary" wide
                                onClick={() => navigate(RoutePaths.Application)}>{t('submit_application_btn')}</Button>
                    </BottomActions>
                </SheetContent>
            </Sheet>}
            <ListButtonGroup>
                {application?.status === 'APPROVED' && userInfo?.role !== 'executor' && <ListButton onClick={handleLogin} extra={<ChevronRight
                    className="w-5 h-5 text-tg-theme-hint-color mr-[-8px] opacity-50"/>} icon={<BriefcaseBusiness
                    className="mr-4 h-7 w-7 p-1 bg-[var(--tg-accent-red)] rounded-md"/>}
                                                                   text={`${t('login_as_btn')} Executor`}/>}
                {application?.status === 'APPROVED' && userInfo?.role == 'executor' && <ListButton onClick={handleLogin} extra={<ChevronRight
                    className="w-5 h-5 text-tg-theme-hint-color mr-[-8px] opacity-50"/>} icon={<BriefcaseBusiness
                    className="mr-4 h-7 w-7 p-1 bg-[var(--tg-accent-red)] rounded-md"/>}
                                                                   text={`${t('login_as_btn')} Client`}/>}
                {userInfo?.isAdmin && <ListButton onClick={handleAdminLogin} extra={<ChevronRight
                    className="w-5 h-5 text-tg-theme-hint-color mr-[-8px] opacity-50"/>} icon={<ShieldUser
                    className="mr-4 h-7 w-7 p-1 bg-[var(--tg-accent-red)] rounded-md"/>}
                                                  text={`${t('login_as_btn')}  ${userInfo?.role !== 'admin' ? 'Admin' : 'Client'}`}/>}
            </ListButtonGroup>
            {userInfo?.role === 'executor' && <>
                <Typography.Title className="text-left mb-0 block pl-4">{t('profile_services_title')}</Typography.Title>
                <ProfileApplicationCard
                    application={application}/></>}

            <Button className="[color:var(--tg-theme-destructive-text-color)] rounded-xl" variant="list"
                    onClick={handleLogout}>{t('logout_btn')}</Button>
        </div>
    </>
}