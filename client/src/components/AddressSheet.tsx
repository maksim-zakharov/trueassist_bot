import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,} from "@/components/ui/sheet"
import {Button} from "./ui/button"
import React from "react";
import {useTelegram} from "../hooks/useTelegram.tsx";
import {Typography} from "./ui/Typography.tsx";
import {AddAddressSheet} from "./AddAddressSheet.tsx";
import {EditButton} from "./EditButton.tsx";
import { Map} from "lucide-react";
import {EmptyState} from "./EmptyState.tsx";
import {ListButton, ListButtonGroup} from "./ListButton/ListButton.tsx";
import {ErrorState} from "./ErrorState.tsx";

interface AddressSheetProps {
    addresses: any[]
    onAddressSelect: (address: any) => void
    isError?: boolean
    className?: string;
}

export function AddressSheet({
                                 className,
                                 isError,
                                 addresses,
                                 onAddressSelect,
                                 children
                             }: React.PropsWithChildren<AddressSheetProps>) {
    const {vibro} = useTelegram();
    const [_opened, setOpened] = React.useState(false);
    const [editedAddress, setEditedAddress] = React.useState(undefined);

    const clearAddress = () => setEditedAddress(undefined)

    const handleSelectAddress = (address: any) => {
        onAddressSelect(address)
        setOpened(false);
        clearAddress();
    }

    const handleOnEditAddress = (e: React.MouseEvent<HTMLButtonElement>, address: any) => {
        e.stopPropagation();
        setEditedAddress(address)
    }

    const handleOpenChange = (opened: boolean) => {
        opened ? vibro() : null;
        setOpened(opened)
        if (!opened)
            clearAddress();
    }

    return (
        <Sheet onOpenChange={handleOpenChange} open={_opened}>
            <SheetTrigger asChild onClick={() => setOpened(true)} className={className}>
                {children}
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh] pb-[env(safe-area-inset-bottom)] gap-6">
                <SheetHeader>
                    <SheetTitle className="text-xl font-bold text-tg-theme-text-color text-left">Addresses</SheetTitle>
                </SheetHeader>
                {isError && <ErrorState/>}
                {!isError && addresses.length === 0 && <EmptyState
                    icon={<Map className="h-10 w-10"/>}
                    title="No addresses"
                    description="Add an address to place orders"
                    action={<AddAddressSheet address={editedAddress} onChangeAddress={setEditedAddress}>
                        <Button
                        >
                            Add address
                        </Button>
                    </AddAddressSheet>}
                />}
                <ListButtonGroup>
                    {addresses.map(adr => <ListButton className="flex w-full justify-between p-0 px-3"
                                                      extra={<EditButton onClick={(e) => handleOnEditAddress(e, adr)}/>}
                                                      text={<div className="flex flex-col">
                                                          <Typography.Title>{adr.name}</Typography.Title>
                                                          <Typography.Description>{adr.fullAddress}</Typography.Description>
                                                      </div>} key={adr.id}
                                                      onClick={() => handleSelectAddress(adr)}/>)}
                </ListButtonGroup>

                {!isError && addresses.length > 0 && <div className="flex flex-col flex-1">
                    <AddAddressSheet address={editedAddress} onChangeAddress={setEditedAddress}>
                        <Button
                            wide
                            size="lg"
                        >
                            Add address
                        </Button>
                    </AddAddressSheet>
                </div>}
            </SheetContent>
        </Sheet>
    )
} 