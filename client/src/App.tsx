import {Navigate, Route, Routes, useNavigate, useSearchParams} from "react-router-dom"
import {ClientLayout} from "./components/layout/ClientLayout.tsx"
import MainPage from "./features/client/MainPage.tsx"
import {OrderCreationPage} from "./features/client/OrderCreationPage.tsx"
import {OrderCheckoutPage} from "./features/client/OrderCheckoutPage.tsx"
import {ClientOrdersPage} from "./features/client/ClientOrdersPage.tsx";
import {useGetServicesQuery, useGetUserInfoQuery} from "./api/api.ts";
import {OrderDetailsPage} from "./features/client/OrderDetailsPage.tsx";
import {ProfilePage} from "./features/client/ProfilePage.tsx";
import {RoutePaths} from "./routes.ts";
import React, {useEffect} from "react";
import {useDispatch} from "react-redux";
import {saveInLocalStorage, startOrderFlow} from "./slices/createOrderSlice.ts";
import {useTelegram} from "./hooks/useTelegram.tsx";
import {ExecutorLayout} from "./components/layout/ExecutorLayout.tsx";
import {ExecutorOrdersPage} from "./features/executor/ExecutorOrdersPage.tsx";
import {ExecutorPaymentsPage} from "./features/executor/ExecutorPaymentsPage.tsx";
import {ExecutorSchedulePage} from "./features/executor/ExecutorSchedulePage.tsx";
import {ApplicationPage} from "./features/client/ApplicationPage.tsx";
import './i18n';
import {useGeoLocation} from "./hooks/useGeoLocation.tsx";
import {useEffect} from "react";
import i18n from './i18n';
import {AdminLayout} from "./components/layout/AdminLayout.tsx";
import {GiftsPage} from "./features/client/GiftsPage.tsx";
import {REF_HEADER} from "./api/baseQuery.ts";
import {AdminOrdersPage} from "./features/admin/AdminOrdersPage.tsx";
import {AdminUsersPage} from "./features/admin/AdminUsersPage/AdminUsersPage.tsx";
import {AdminServicesPage} from "./features/admin/AdminServicesPage.tsx";
import {AdminServiceDetailsPage} from "./features/admin/AdminServiceDetailsPage.tsx";
import {AdminUsersDetailsPage} from "./features/admin/AdminUsersDetailsPage/AdminUsersDetailsPage.tsx";
import {PageLoader} from "./components/PageLoader.tsx";
import {AdminEditServicePage} from "./features/admin/AdminEditServicePage.tsx";
import {AdminChatPage} from "./features/admin/AdminChatPage.tsx";
import {AdminChatDetailsPage} from "./features/admin/AdminChatDetailsPage.tsx";

function App() {
    const {isReady} = useTelegram();

    useGeoLocation({enabled: isReady});

    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const startParam = Telegram.WebApp.initDataUnsafe.start_param || searchParams.get('tgWebAppStartParam') || searchParams.get('startapp') || '';

    // Обработка параметра lang из URL (только если нет сохраненного языка)
    useEffect(() => {
        if (!localStorage.getItem('language')) {
            const urlLang = searchParams.get('lang');
            if (urlLang && (urlLang === 'en' || urlLang === 'ru')) {
                i18n.changeLanguage(urlLang);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        const [key, refId] = startParam.split('ref_');
        if(refId){
            saveInLocalStorage(REF_HEADER, refId);
        }
    }, [startParam]);

    const [serviceId, variantId] = startParam.split('_').filter((_, i) => i % 2 !== 0);

    const {data: userinfo, isLoading} = useGetUserInfoQuery(undefined, {
        skip: !isReady
    });
    const {data: services = []} = useGetServicesQuery();

    useEffect(() => {
        if (serviceId && services?.length > 0) {
            // Загрузка данных
            const baseService = services.find((service) => service.id?.toString() === serviceId);
            if (!baseService)
                return;

            const serviceVariant = baseService?.variants?.find((variant) => variant.id.toString() === variantId) || baseService?.variants[0];

            dispatch(startOrderFlow({baseService, serviceVariant}))
            navigate(RoutePaths.Order.Create);
        }
    }, [serviceId, variantId, services, dispatch, navigate]);

    if (!userinfo || isLoading || !isReady) {
        return <PageLoader/>
    }

    if (userinfo.role === 'admin') {
        return <div className="content-wrapper">
            <Routes>
                <Route element={<AdminLayout/>}>
                    <Route path={RoutePaths.Admin.Users.List} element={<AdminUsersPage/>}/>
                    <Route path={RoutePaths.Admin.Order.List} element={<AdminOrdersPage/>}/>
                    <Route path={RoutePaths.Admin.Services.List} element={<AdminServicesPage/>}/>
                    <Route path={RoutePaths.Admin.Chat.List} element={<AdminChatPage/>}/>
                    <Route path={RoutePaths.Admin.Bonuses} element={<ProfilePage/>}/>
                    <Route path={RoutePaths.Admin.Profile} element={<ProfilePage/>}/>
                </Route>
                <Route path={RoutePaths.Admin.Users.Details(':id')} element={<AdminUsersDetailsPage/>}/>

                <Route path={RoutePaths.Admin.Chat.Details(':id')} element={<AdminChatDetailsPage/>}/>

                <Route path={RoutePaths.Admin.Services.Create} element={<AdminEditServicePage/>}/>
                <Route path={RoutePaths.Admin.Services.Edit(':id')} element={<AdminEditServicePage isEdit/>}/>
                <Route path={RoutePaths.Admin.Services.Details(':id')} element={<AdminServiceDetailsPage/>}/>

                <Route path={RoutePaths.Admin.Order.Create} element={<OrderCreationPage isAdmin/>}/>
                <Route path={RoutePaths.Admin.Order.Details(':id')} element={<OrderDetailsPage isAdmin/>}/>

                <Route path="*" element={<Navigate to={RoutePaths.Admin.Users.List}/>}/>
            </Routes>
        </div>
    }

    if (userinfo.role === 'executor') {
        return <div className="content-wrapper">
            <Routes>
                <Route element={<ExecutorLayout/>}>
                    <Route path={RoutePaths.Executor.Orders} element={<ExecutorOrdersPage/>}/>
                    <Route path={RoutePaths.Executor.Payments} element={<ExecutorPaymentsPage/>}/>
                    <Route path={RoutePaths.Executor.Schedule} element={<ExecutorSchedulePage/>}/>
                    <Route path={RoutePaths.Executor.Profile} element={<ProfilePage/>}/>
                    <Route path="*" element={<Navigate to={RoutePaths.Executor.Orders}/>}/>
                </Route>
                <Route path={RoutePaths.Executor.Details(':id')} element={<OrderDetailsPage isExecutor/>}/>
            </Routes>
        </div>
    }


    return (
        <div className="content-wrapper">
            <Routes>
                <Route element={<ClientLayout/>}>
                    <Route path={RoutePaths.Root} element={<MainPage/>}/>
                    <Route path={RoutePaths.Order.List} element={<ClientOrdersPage/>}/>
                    <Route path={RoutePaths.Bonuses} element={<GiftsPage/>}/>
                    <Route path={RoutePaths.Profile} element={<ProfilePage/>}/>
                </Route>
                <Route path={RoutePaths.Order.Create} element={<OrderCreationPage/>}/>
                <Route path={RoutePaths.Order.Checkout} element={<OrderCheckoutPage/>}/>
                <Route path={RoutePaths.Order.Details(':id')} element={<OrderDetailsPage/>}/>
                <Route path={RoutePaths.Application} element={<ApplicationPage/>}/>
                <Route path="*" element={<Navigate to={RoutePaths.Root}/>}/>
            </Routes>
        </div>
    )
}

export default App
