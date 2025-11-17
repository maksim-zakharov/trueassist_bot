import {ReactNode} from "react";
import {Card} from "./ui/card.tsx";
import {cn} from "../lib/utils.ts";
import {Typography} from "./ui/Typography.tsx";

interface CardItemProps {
    title: string
    icon?: ReactNode
    onClick?: () => void
    className?: string;
    textClassName?: string;
}

export const CardItem = ({title, icon, onClick, className, textClassName}: CardItemProps) => <Card
    className={cn(`p-4 cursor-pointer transition-transform min-h-[140px] relative border-none active:scale-95 select-none`, className)}
    onClick={onClick}
>
    <div className={cn("flex flex-col h-full", textClassName)}>
        <Typography.Title className="max-w-[calc(100%-56px)]">{title}</Typography.Title>
        {icon && <div className="absolute bottom-4 right-4">
            {icon}
        </div>}
    </div>
</Card>