import * as React from "react";
import {cn} from "../../lib/utils.ts";

export const List = ({children, className, itemClassName}: React.ComponentProps<"div"> & { itemClassName?: string }) =>
    <div
        className={cn("card-bg-color rounded-xl overflow-hidden", className)}>
        {Array.isArray(children) ? children.map((option, index) => <div
            className={cn(`flex items-center px-4 py-3 ${index !== children.length - 1 && 'separator-shadow-bottom'}`, itemClassName)}>
            {option}
        </div>) : <div
            className={`flex items-center px-4 py-3`}>
            {children}
        </div>}
    </div>