import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import {cn} from "@/lib/utils"
import {useTelegram} from "../../hooks/useTelegram.tsx";

function Switch({
                    className,
                    ...props
                }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
    const {vibro} = useTelegram();

    const handleOnCheckedChange = (e) => {
        vibro()
        props?.onCheckedChange?.(e);
    }

    return (
        <SwitchPrimitive.Root
            data-slot="switch"
            className={cn(
                "peer data-[state=checked]:[background-color:#4cd964] var(--tg-theme-hint-color) focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-8 w-13 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
            onCheckedChange={handleOnCheckedChange}
        >
            <SwitchPrimitive.Thumb
                data-slot="switch-thumb"
                className={cn(
                    "[background-color:var(--tg-theme-button-text-color)] pointer-events-none block size-7 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-7px)] data-[state=unchecked]:translate-x-[2px]"
                )}
            />
        </SwitchPrimitive.Root>
    )
}

export {Switch}
