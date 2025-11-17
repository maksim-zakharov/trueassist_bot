import React, {FC, PropsWithChildren} from "react";
import {cn} from "../lib/utils.ts";

export const SafeAreaBottom: FC<PropsWithChildren & {className?: string}> = ({children, className}) => <div
    className={cn("bg-inherit [padding-bottom:var(--tg-safe-area-inset-bottom)] relative", className)}>
    {children}
</div>