import React from "react";
import {cn} from "../lib/utils.ts";

export const BottomActions = ({children, className}: React.ComponentProps<'div'>) => <div
    className={cn("menu-container separator-shadow-top card-bg-color-transparency [backdrop-filter:blur(5px)] p-4 py-1", className)}>
    {children}
</div>