import {CircleX} from "lucide-react";
import {Button} from "./ui/button.tsx";
import {EmptyState} from "./EmptyState.tsx";
import React from "react";
import {useTranslation} from "react-i18next";

export const ErrorState = ({className}: {
    className?: string
}) => {
    const {t} = useTranslation();

    return <EmptyState
        icon={<CircleX className="h-10 w-10"/>}
        title={t("error_500_title")}
        description={t('error_500_description')}
        className={className}
        action={
            <Button onClick={() => window.location.reload()}
            >
                {t('error_refresh_btn')}
            </Button>}
    />
}