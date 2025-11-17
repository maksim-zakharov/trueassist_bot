import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "./ui/alert-dialog.tsx";
import {Loader2} from "lucide-react";
import * as React from "react";

export const AlertDialogWrapper = ({children, open, title,  onOkText, onCloseText, cancelLoading, okLoading, description, onOkClick, onCancelClick}: any) => {

    return <AlertDialog open={open}>
        {children && <AlertDialogTrigger asChild>
            {children}
        </AlertDialogTrigger>}
        <AlertDialogContent>
            <AlertDialogHeader>
                {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
                {description && <AlertDialogDescription>
                    {description}
                </AlertDialogDescription>}
            </AlertDialogHeader>
            {(onCancelClick || onOkClick) && <AlertDialogFooter className="items-center">
                {onCancelClick && <AlertDialogCancel className="w-full" onClick={onCancelClick}>{cancelLoading ? <Loader2 className="animate-spin" /> : (onCloseText || 'Cancel')}</AlertDialogCancel>}
                {onOkClick && <AlertDialogAction className="w-full" onClick={onOkClick}>{okLoading ? <Loader2 className="animate-spin" /> : (onOkText || 'Continue')}</AlertDialogAction>}
            </AlertDialogFooter>}
        </AlertDialogContent>
    </AlertDialog>
}