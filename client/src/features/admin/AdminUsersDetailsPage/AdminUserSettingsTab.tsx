import React, {FC, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useDeleteAdminUserByIdMutation} from "../../../api/ordersApi.ts";
import {RoutePaths} from "../../../routes.ts";
import {Button} from "../../../components/ui/button.tsx";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../../components/ui/alert-dialog.tsx";
import {Loader2} from "lucide-react";

interface AdminUserSettingsTabProps {
    /** ID пользователя */
    userId: string;
}

export const AdminUserSettingsTab: FC<AdminUserSettingsTabProps> = ({userId}) => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [deleteUser, {isLoading}] = useDeleteAdminUserByIdMutation();

    const handleDelete = async () => {
        try {
            await deleteUser({id: userId}).unwrap();
            navigate(RoutePaths.Admin.Users.List);
        } catch {
            setOpen(false);
        }
    };

    return (
        <div className="px-4 py-4">
            <AlertDialog open={open} onOpenChange={setOpen}>
                <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setOpen(true)}
                >
                    {t("admin_user_delete_btn")}
                </Button>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("admin_user_delete_confirm_title")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("admin_user_delete_confirm_description")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="items-center">
                        <AlertDialogCancel className="w-full" disabled={isLoading}>
                            {t("admin_user_delete_confirm_cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin"/>
                            ) : (
                                t("admin_user_delete_confirm_ok")
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
