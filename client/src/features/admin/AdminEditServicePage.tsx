import {Header} from "../../components/ui/Header.tsx";
import {Typography} from "../../components/ui/Typography.tsx";
import React, {FC, useEffect} from "react";
import {InputWithLabel} from "../../components/InputWithLabel.tsx";
import {BottomActions} from "../../components/BottomActions.tsx";
import {Button} from "../../components/ui/button.tsx";
import {Card} from "../../components/ui/card.tsx";
import {CalendarCheck, Plus, Trash2} from "lucide-react";
import {useFieldArray, useForm} from "react-hook-form";
import * as yup from "yup";
import {yupResolver} from "@hookform/resolvers/yup";
import {
    useAddAdminServiceMutation,
    useEditAdminServiceByIdMutation,
    useGetAdminServicesByIdQuery
} from "../../api/ordersApi.ts";
import {toast} from "sonner";
import {RoutePaths} from "../../routes.ts";
import {useNavigate, useParams} from "react-router-dom";
import {useBackButton} from "../../hooks/useTelegram.tsx";

interface Option {
    id: number,
    name: string,
    price: number,
    duration: number
}

interface ServiceVariant {
    id: number,
    name: string,
    basePrice: number,
    duration: number
}

const createEmptyOption = () => ({
    id: Date.now(),
    name: '',
    price: 0,
    duration: 0
} as Option)

const createEmptyVariant = () => ({
    id: Date.now(),
    name: '',
    basePrice: 0,
    duration: 0
} as ServiceVariant)

const schema = yup.object({
    name: yup.string().required(),
    options: yup.array().of(yup.object({
        id: yup.number().optional(),
        name: yup.string().required(),
        price: yup.number().required(),
        duration: yup.number().required(),
    })),
    variants: yup.array().of(yup.object({
        id: yup.number().optional(),
        name: yup.string().required(),
        basePrice: yup.number().required(),
        duration: yup.number().required(),
    })),
}).required();

export const AdminEditServicePage: FC<{isEdit?: boolean}> = ({isEdit}) => {
    const {id} = useParams<string>();
    const backTo = () => navigate(isEdit ? RoutePaths.Admin.Services.Details(id) : RoutePaths.Admin.Services.List)
    useBackButton(backTo);
    const {data: service} = useGetAdminServicesByIdQuery({id: Number(id)}, {
        skip: !isEdit
    })
    const navigate = useNavigate()
    const { handleSubmit, control, getValues, reset, register } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
            options: [createEmptyOption()],
            variants: [createEmptyVariant()],
        }
    });

    useEffect(() => {
        if (service) {
            reset(service);
        }
    }, [service, reset]);

    const { fields: options, prepend: prependOption, remove: removeOption } = useFieldArray({
        control, // control props comes from useForm (optional: if you are using FormProvider)
        name: "options", // unique name for your Field Array
    });

    const { fields: variants, prepend: prependVariant, remove: removeVariant } = useFieldArray({
        control, // control props comes from useForm (optional: if you are using FormProvider)
        name: "variants", // unique name for your Field Array
    });

    const [addService, {isLoading: addIsLoading}] = useAddAdminServiceMutation();
    const [editService, {isLoading: editIsLoading}] = useEditAdminServiceByIdMutation();

    const onSubmit = async data => {
        const func = isEdit ? editService : addService;
        const newService = await func(data).unwrap();

        toast(`Service ${isEdit ? 'edited' : 'added'}`, {
            classNames: {
                icon: 'mr-2 h-5 w-5 text-[var(--chart-2)]'
            },
            icon: <CalendarCheck className="h-5 w-5 text-[var(--chart-2)]"/>
        })

        backTo()
    };
    
    const handleAddNewOption = () => prependOption(createEmptyOption())

    const handleAddNewVariant = () => prependVariant(createEmptyVariant())

    const submitText = isEdit ? 'Save' : 'Create';

    return <div className="flex flex-col bg-inherit overflow-y-auto overscroll-none h-screen p-4">
        <Header>
            <Typography.Title
                className="items-center flex justify-center">{isEdit ? getValues('name') : 'Create service'}</Typography.Title>
        </Header>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <InputWithLabel label="Name"  {...register("name")}/>

            <div className="flex flex-col gap-2 [margin-bottom:calc(52px+var(--tg-safe-area-inset-bottom))]">
                <Typography.Title>Options</Typography.Title>
                {options.map((o, index) => <Card className="gap-2 p-4 relative" key={o.id}>
                    <Button variant="ghost" className="absolute right-0 text-tg-theme-hint-color h-[16px]" onClick={() => removeOption(index)}><Trash2 className="h-4 w-4" /></Button>
                    <div className="flex flex-col" key={o.id}>
                        <InputWithLabel label="Name" {...register(`options.${index}.name`)}/>
                    </div>
                    <div className="flex flex-col">
                        <InputWithLabel label="Price" {...register(`options.${index}.price`)}/>
                    </div>
                    <div className="flex flex-col">
                        <InputWithLabel label="Duration" {...register(`options.${index}.duration`)}/>
                    </div>
                </Card>)}
                <Button onClick={handleAddNewOption} type="button"><Plus className="w-5 h-5 mr-2" /> Add option</Button>
                <Typography.Title>Variants</Typography.Title>
                {variants.map((o, index) => <Card className="gap-2 p-4 relative" key={o.id}>
                    <Button variant="ghost" className="absolute right-0 text-tg-theme-hint-color h-[16px]" onClick={() => removeVariant(index)}><Trash2 className="h-4 w-4" /></Button>
                    <div className="flex flex-col" key={o.id}>
                        <InputWithLabel label="Name" {...register(`variants.${index}.name`)}/>
                    </div>
                    <div className="flex flex-col">
                        <InputWithLabel label="BasePrice" {...register(`variants.${index}.basePrice`)}/>
                    </div>
                    <div className="flex flex-col">
                        <InputWithLabel label="Duration" {...register(`variants.${index}.duration`)}/>
                    </div>
                </Card>)}
                <Button onClick={handleAddNewVariant} type="button"><Plus className="w-5 h-5 mr-2" /> Add variant</Button>
            </div>

            <BottomActions className="bg-inherit [padding-bottom:var(--tg-safe-area-inset-bottom)]">
                <Button wide type="submit" loading={addIsLoading || editIsLoading}>{submitText}</Button>
            </BottomActions>
        </form>
    </div>
}