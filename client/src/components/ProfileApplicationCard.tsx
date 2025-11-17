import React, {useMemo} from "react";
import {useGetServicesQuery} from "../api/api.ts";
import {Typography} from "./ui/Typography.tsx";
import {ListButton, ListButtonGroup} from "./ListButton/ListButton.tsx";
import {DynamicIcon} from "lucide-react/dynamic";
import {useTranslation} from "react-i18next";

export const ProfileApplicationCard = ({application}) => {
    const {data: services = []} = useGetServicesQuery();
    const {t} = useTranslation();

    const applicationVariantIdsSet = useMemo(() => new Set(application?.variants?.map(v => v.variantId) || []), [application]);
    const filteredServices = useMemo(() => services.filter(s => s.variants.some(v => applicationVariantIdsSet.has(v.id))).map(s => ({
        ...s,
        variants: s.variants.filter(v => applicationVariantIdsSet.has(v.id))
    })), [applicationVariantIdsSet, services])

    if(!filteredServices.length){
        return null;
    }

    return <div>
        {filteredServices.map(s => <div className="mt-4">
            <Typography.Description
                className="block mb-2 text-left pl-4 text-sm uppercase">{s.name}</Typography.Description>
            <ListButtonGroup>
                {s.variants.map(s => <ListButton text={s.name} icon={<DynamicIcon name={s.icon}
                                                                                  className="w-7 h-7 p-1 root-bg-color rounded-md"
                                                                                  strokeWidth={1.5}/>}/>)}
            </ListButtonGroup>
        </div>)}

    </div>
}