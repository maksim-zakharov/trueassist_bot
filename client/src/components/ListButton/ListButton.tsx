import {Typography} from "../ui/Typography.tsx";
import {Card} from "../ui/card.tsx";
import React, {FC, ReactNode} from "react";
import './ListButton.css'

interface IProps {
    text: ReactNode;
    extra?: ReactNode;
    icon?: ReactNode;
}

export const ListButton: FC<IProps & React.ComponentProps<'div'>> = ({text, extra, icon, ...props}) => <Card
    className={`p-0 gap-0 ListButton transition-colors select-none ${props.onClick && 'active:[background-color:#313035]'}`} {...props}>
    <div className="flex justify-between items-center">
        <div className="flex items-center w-full">
            {icon ? <div className="mr-4 h-7 w-7 my-2">{icon}</div> : undefined}
            <Typography.Title className="inner-text flex items-center font-normal [line-height:28px] w-full">
                <span className="py-2 w-full text-left">{text}</span>
                {extra}
            </Typography.Title>
        </div>
    </div>
</Card>

export const ListButtonGroup: FC = ({children}: React.ComponentProps<'div'>) => <div
    className="[&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none ListButtonGroup">
    {children}
</div>