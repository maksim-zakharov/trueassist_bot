import * as React from "react"
import {Slot} from "@radix-ui/react-slot"
import {cva, type VariantProps} from "class-variance-authority"

import {cn} from "@/lib/utils"
import {Loader2} from "lucide-react";

const buttonVariants = cva(
    "font-normal inline-flex items-center justify-center transition-colors transition-opacity disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                list:
                    "card-bg-color text-tg-theme-button-text-color hover:opacity-90",
                primary:
                    "bg-tg-theme-button-color text-tg-theme-button-text-color hover:opacity-90",
                destructive:
                    "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
                outline:
                    "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
                default:
                    "border border-tg-theme-button-color text-tg-theme-button-color hover:opacity-90",
                ghost:
                    "hover:bg-transparent focus-visible:outline-none focus-visible:ring-0 active:bg-transparent",
                link: "text-primary underline-offset-4 hover:underline",
            },
            wide: {
                true: "w-full"
            },
            size: {
                sm: "h-9 text-sm px-4 rounded-sm",
                default: "h-10 text-[14px] [font-weight:400] px-4 rounded-md",
                lg: "px-4 py-3 rounded-md",
                // icon: "size-9",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
        },
    }
)

function Button({
                    className,
                    variant,
                    size,
                    wide,
                    loading,
                    asChild = false,
                    ...props
                }: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
    asChild?: boolean,
    loading?: boolean
}) {
    const Comp = asChild ? Slot : "button"

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({variant, size, className, wide}))}
            {...props}
            disabled={props.disabled || loading}
        >
            {loading ? <Loader2 className="animate-spin" /> : props.children}
        </Comp>
    )
}

export {Button, buttonVariants}
