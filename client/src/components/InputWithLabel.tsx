import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {ComponentProps} from "react";

export const InputWithLabel = (props: ComponentProps<"input"> & { label?: string }) => {
    return (
        <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor={props.id}>{props.label}</Label>
            <Input {...props} className="tg-input-border focus-visible:outline-none rounded-[6px] [font-size:16px]
    [font-weight:400]
    [line-height:20px]"/>
        </div>
    )
}
