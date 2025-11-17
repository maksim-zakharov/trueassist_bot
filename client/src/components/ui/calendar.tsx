import * as React from "react"
import {ChevronDown, ChevronLeft, ChevronRight, ChevronUp} from "lucide-react"
import {DayPicker} from "react-day-picker"

import {cn} from "@/lib/utils"
import {buttonVariants} from "@/components/ui/button"

function Calendar({
                      className,
                      classNames,
                      showOutsideDays = true,
                      ...props
                  }: React.ComponentProps<typeof DayPicker>) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row gap-2 relative",
                month: "flex flex-col gap-4",
                month_caption: "flex justify-center pt-1 relative items-center w-full",
                caption_label: "text-sm font-medium",
                nav: "flex items-center gap-1 absolute w-full z-1",
                nav_button: cn(
                    buttonVariants({variant: "outline"}),
                    "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                ),
                button_previous: "absolute left-2 border-none outline-none top-1 h-6",
                button_next: "absolute right-2 border-none outline-none top-1 h-6",
                month_grid: "w-full border-collapse space-x-1",
                weekdays: "flex w-full justify-between",
                // head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                weekday: "w-8 text-muted-foreground rounded-md font-normal text-[0.8rem]",
                week: "flex w-full mt-2 justify-between",
                day: cn(
                    buttonVariants({variant: "ghost"}),
                    "size-8 p-0 font-normal aria-selected:opacity-100 rounded-3xl relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected].day-range-end)]:rounded-r-md",
                    props.mode === "range"
                        ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                        : "[&:has([aria-selected])]:rounded-md"
                ),
                range_start:
                    "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
                range_end:
                    "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
                selected:
                    "[background-color:var(--tg-theme-button-color)] [color:var(--tg-theme-button-text-color)] hover:[background-color:var(--tg-theme-button-color)!important] hover:[color:var(--tg-theme-button-text-color)!important] focus:[background-color:var(--tg-theme-button-color)!important] focus:[color:var(--tg-theme-button-text-color)!important]",
                today: "bg-accent text-accent-foreground",
                outside:
                    "day-outside text-muted-foreground aria-selected:text-muted-foreground",
                disabled: "text-muted-foreground opacity-50",
                range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                hidden: "invisible",
                ...classNames,
            }}
            components={{
                Chevron: ({className, ...props}) =>  {
                    if(props.orientation === 'left'){
                        return <ChevronLeft className={cn("size-4", className)} {...props}/>;
                    }

                    if(props.orientation === 'right'){
                        return <ChevronRight className={cn("size-4", className)} {...props}/>;
                    }

                    if(props.orientation === 'up'){
                        return <ChevronUp className={cn("size-4", className)} {...props}/>;
                    }

                    if(props.orientation === 'down'){
                        return <ChevronDown className={cn("size-4", className)} {...props}/>;
                    }

                    return <ChevronRight className={cn("size-4", className)} {...props}/>;
                },
            }}
            {...props}
        />
    )
}

export {Calendar}
