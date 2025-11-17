import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import {ChevronDown} from "lucide-react"
import {cn} from "@/lib/utils"

const Accordion = React.forwardRef<
    React.ElementRef<typeof AccordionPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(({className, ...props}, ref) => (
    <AccordionPrimitive.Root
        ref={ref}
        className={cn("overflow-hidden rounded-xl", className)}
        {...props}
    />
))

const AccordionItem = React.forwardRef<
    React.ElementRef<typeof AccordionPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({className, ...props}, ref) => (
    <AccordionPrimitive.Item
        ref={ref}
        className={cn("border-0 card-bg-color", className)}
        {...props}
    />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
    React.ElementRef<typeof AccordionPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & { hideChevron?: boolean }
>(({className, children, hideChevron = false, disabled, ...props}, ref) => (
    <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
            ref={ref}
            className={cn(
                "px-4 py-3 hover:no-underline flex flex-1 items-center justify-between text-sm font-medium transition-all [&[data-state=open]>svg]:rotate-180",
                className
            )}
            disabled={disabled}
            {...props}
        >
            {children}
            {(!disabled && !hideChevron) &&
                <ChevronDown className="h-5 w-5 shrink-0 text-tg-theme-hint-color transition-transform duration-200"/>}
        </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
    React.ElementRef<typeof AccordionPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> & {wrapperClassName?: string}
>(({className, children, wrapperClassName, ...props}, ref) => (
    <AccordionPrimitive.Content
        ref={ref}
        className={cn("px-4 overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down", wrapperClassName)}
        {...props}
    >
        <div className={cn("pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export {Accordion, AccordionItem, AccordionTrigger, AccordionContent}