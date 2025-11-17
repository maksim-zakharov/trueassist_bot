import {RoutePaths} from "../../routes.ts";
import React, {useEffect, useMemo, useState} from "react";
import {Typography} from "@/components/ui/Typography.tsx";
import {
    useGetApplicationQuery,
    useGetServicesQuery,
    useLoginMutation,
    useSendApplicationMutation
} from "../../api/api.ts";
import {ListButton, ListButtonGroup} from "../../components/ListButton/ListButton.tsx";
import {DynamicIcon} from "lucide-react/dynamic";
import {Checkbox} from "../../components/ui/checkbox.tsx";
import {useBackButton, useTelegram} from "../../hooks/useTelegram.tsx";
import {BottomActions} from "../../components/BottomActions.tsx";
import {Button} from "../../components/ui/button.tsx";
import {FileClock, FileX} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {PageLoader} from "../../components/PageLoader.tsx";
import {useTranslation} from "react-i18next";
import dayjs from "dayjs";
import {ErrorState} from "../../components/ErrorState.tsx";

export const ApplicationPage = () => {

    const {t} = useTranslation();
    const [loginMutation] = useLoginMutation();
    const {data: services = [], isLoading: servicesLoading} = useGetServicesQuery();
    const {data: application, isLoading: applicationLoading, isError} = useGetApplicationQuery();
    const navigate = useNavigate()
    const [sendApplication, {isLoading: sendApplicationLoading}] = useSendApplicationMutation();
    const {vibro} = useTelegram();

    useBackButton(() => navigate(RoutePaths.Profile));

    useEffect(() => {
        if (application?.status === 'APPROVED')
            loginMutation('executor').unwrap()
    }, [application, loginMutation]);

    const [variantIds, setVariantIds] = useState<any>([]);
    const selectedOptionsIdSet = useMemo(() => new Set(variantIds), [variantIds]);

    const handleOptionToggle = (option: any) => {
        vibro('light');
        const exist = variantIds.find(opt => opt === option.id);
        let newOptions = [...variantIds];
        if (exist) {
            newOptions = newOptions.filter(opt => opt !== option.id);
        } else {
            newOptions.push(option.id)
        }
        setVariantIds(newOptions);
    }

    const handleSubmitApplication = () => sendApplication(variantIds).unwrap()

    const isLoading = servicesLoading || applicationLoading;

    if (isLoading) {
        return <PageLoader/>
    }

    if (isError) {
        return <ErrorState/>
    }

    if (!application) {
        return <>
            <div className="content px-4 w-full">
                <Typography.H2 className="text-3xl mb-6">{t('create_application_title')}</Typography.H2>

                <Typography.Title className="pl-4">{t('create_application_question')}</Typography.Title>

                {services.map(s => <div className="mt-4">
                    <Typography.Description className="block mb-2 pl-4">{s.name}</Typography.Description>
                    <ListButtonGroup>
                        {s.variants.map(s => <ListButton text={s.name} extra={
                            <Checkbox checked={selectedOptionsIdSet.has(s.id)}
                                      onCheckedChange={() => handleOptionToggle(s)}/>} icon={<DynamicIcon name={s.icon}
                                                                                                          className="w-7 h-7 p-1 root-bg-color rounded-md"
                                                                                                          strokeWidth={1.5}/>}/>)}
                    </ListButtonGroup>
                </div>)}

                <BottomActions className="bg-inherit [padding-bottom:var(--tg-safe-area-inset-bottom)]">
                    <Button wide disabled={variantIds.length === 0} loading={sendApplicationLoading}
                            onClick={handleSubmitApplication}>{t('create_application_submit_btn')}</Button>
                </BottomActions>
            </div>
        </>
    }

    if (application.status === "PENDING") {
        return <div className="flex flex-col justify-center h-screen items-center m-auto">
            <FileClock className="w-20 h-20 p-2 rounded-3xl card-bg-color mb-4"/>
            <Typography.H2 className="mb-2">{t('create_application_pending_title')}</Typography.H2>
            <Typography.Title
                className="mb-4 font-normal">{t('create_application_pending_description')}</Typography.Title>
            <Button onClick={() => navigate(RoutePaths.Profile)}>{t('create_application_profile_btn')}</Button>
        </div>
    }

    if (application.status === "REJECTED") {
        return <div className="flex flex-col justify-center h-screen items-center m-auto">
            <FileX className="w-20 h-20 p-2 rounded-3xl card-bg-color mb-4"/>
            <Typography.H2 className="mb-2">{t('create_application_rejected_title')}</Typography.H2>
            <Typography.Title className="mb-4 font-normal text-center">{t('create_application_rejected_description_1')}
                <br/> {t('create_application_rejected_description_2')}</Typography.Title>
            <Button onClick={() => navigate(RoutePaths.Profile)}>{t('create_application_profile_btn')}</Button>
            <Button variant="ghost"
                    onClick={() => window.open(`https://t.me/@qlean_clone_bot?start=support_${dayjs.utc().valueOf()}`, '_blank')}>{t('create_application_support_btn')}</Button>
        </div>
    }

    return null;
}