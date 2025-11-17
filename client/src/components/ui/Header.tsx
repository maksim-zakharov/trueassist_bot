import {FC} from "react";
import {cn} from "../../lib/utils.ts";

export const Header: FC<any> = ({children, className}: any) => {
    if (!children) return null;
    return <header className="relative">
        <div className="h-[56px]"/>
        <div
            className={cn("fixed top-0 left-0 right-0 h-[50px] content-center z-10 root-bg-color flex-none px-4 py-1", className)}>
            {children}
        </div>
    </header>
}