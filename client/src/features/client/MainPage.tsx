
import {useNavigate} from "react-router-dom"
import React, {useEffect, useMemo} from "react";
import {useTelegram} from "../../hooks/useTelegram.tsx";
import {CardItem} from "../../components/CardItem.tsx";
import {Typography} from "../../components/ui/Typography.tsx";
import {useGetAddressesQuery, useGetServicesQuery} from "../../api/api.ts";
import {useDispatch, useSelector} from "react-redux";
import {selectFullAddress, startOrderFlow} from "../../slices/createOrderSlice.ts";
import {DynamicIcon} from "lucide-react/dynamic";
import {ErrorState} from "../../components/ErrorState.tsx";
import {RoutePaths} from "../../routes.ts";
import {Header} from "../../components/ui/Header.tsx";
import {AddressSheet} from "../../components/AddressSheet.tsx";
import {Button} from "../../components/ui/button.tsx";
import {useTranslation} from "react-i18next";

const MainPage = () => {
    const {t} = useTranslation();
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const {data: services = [], isError} = useGetServicesQuery();
    const {data: addresses = []} = useGetAddressesQuery();
    const fullAddress = useSelector(state => state.createOrder.fullAddress)

    const nonEmptyServices = useMemo(() => services.filter(service => service.variants.length > 0), [services]);

    const {hideBackButton} = useTelegram();
    useEffect(() => {
        hideBackButton()
    }, [hideBackButton]);

    const handleCardOnClick = (baseService, serviceVariant) => {
        dispatch(startOrderFlow({baseService, serviceVariant}))
        navigate(RoutePaths.Order.Create)
    }

    const handleSelectAddress = (address: any) => {
        dispatch(selectFullAddress(address))
    }

    if(isError){
        return  <ErrorState/>
    }

    return (
        <>
            <Header>
                <div className="flex-1 flex flex-col items-center">
                    <Typography.Description>Address</Typography.Description>
                    <AddressSheet
                        isError={isError}
                        addresses={addresses}
                        onAddressSelect={handleSelectAddress}
                    >
                        <Button variant="ghost" className="h-auto text-tg-theme-text-color text-base font-medium">
                            {fullAddress?.fullAddress || t('client_checkout_address_error')} <span
                            className="ml-2 text-tg-theme-subtitle-text-color">›</span>
                        </Button>
                    </AddressSheet>
                </div>
            </Header>
            <div className="px-4 pt-4">
                {nonEmptyServices.map(category => (
                    <section key={category.id} className="mb-4">
                        <Typography.H2>
                            {category.name}
                        </Typography.H2>
                        <div className="grid grid-cols-2 gap-2">
                            {category.variants.map(service => {
                                // const Icon = ICONS[service.icon]
                                return (
                                    <CardItem
                                        key={service.id}
                                        title={service.name}
                                        icon={service.icon && <DynamicIcon name={service.icon}
                                                                           className="w-10 h-10 text-tg-theme-button-color"
                                                                           strokeWidth={1.5}/>}
                                        // icon={<Icon className="w-10 h-10 text-tg-theme-button-color" strokeWidth={1.5}/>}
                                        onClick={() => handleCardOnClick(category, service)}
                                    />
                                )
                            })}
                        </div>
                    </section>
                ))}
            </div>
        </>
    )
}

export default MainPage