// Общий компонент для пустых состояний
import {Typography} from "./ui/Typography.tsx";
import {cn} from "../lib/utils.ts";

export function EmptyState({
                               icon,
                               title,
                               description,
                               action,
                               className
                           }: {
    icon: React.ReactNode
    title: string
    description: string
    action?: React.ReactNode
    className?: string
}) {
    return (
        <div className={cn("flex flex-1 flex-col items-center justify-center p-4 text-center max-w-[80%] m-auto h-[100%]", className)}>
            <div
                className="text-muted-foreground mb-4 rounded-[50%] card-bg-color text-tg-theme-button-text-color p-4">{icon}</div>
            <Typography.Title
                className="text-center flex flex-col mb-4">{title}<Typography.Description>{description}</Typography.Description></Typography.Title>
            {action}
        </div>
    )
}