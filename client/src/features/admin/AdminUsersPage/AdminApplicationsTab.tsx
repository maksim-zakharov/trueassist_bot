import {Card} from "../../../components/ui/card.tsx";
import {Typography} from "../../../components/ui/Typography.tsx";
import dayjs from "dayjs";
import React, {useMemo} from "react";
import {RoutePaths} from "../../../routes.ts";
import {useNavigate} from "react-router-dom";
import {ErrorState} from "../../../components/ErrorState.tsx";
import {EmptyState} from "../../../components/EmptyState.tsx";
import {ClipboardPlus} from "lucide-react";

export const AdminApplicationsTab = ({applications, isError, query}) => {
    const navigate = useNavigate()

    const pendingApplications = useMemo(() => applications.filter(a => a.status === 'PENDING').filter(a =>
        !query
        || a?.user.id.toLowerCase().includes(query.toLowerCase())
        || a?.user.firstName.toLowerCase().includes(query.toLowerCase())
        || a?.user?.lastName?.toLowerCase().includes(query.toLowerCase())
        || a?.user?.phone?.toLowerCase().includes(query.toLowerCase())
        || a?.user?.username?.toLowerCase().includes(query.toLowerCase())
    ), [applications, query]);

    const handleOrderClick = (order: any) => navigate(RoutePaths.Admin.Users.Details(order.userId))

    if (isError) {
        return <ErrorState/>
    }

    if (pendingApplications.length === 0) {
        return <EmptyState
            icon={<ClipboardPlus className="h-10 w-10"/>}
            title="No pending applications"
            description=""
        />
    }

    return <div className="p-4 flex flex-col gap-4">
        {pendingApplications.length > 0 && <div className="flex flex-col gap-4">
            {pendingApplications.map((ao: any) => <Card className="p-0 pl-4 gap-0 border-none card-bg-color"
                                                        onClick={() => handleOrderClick(ao)}>
                <div className={`p-3 pl-0 ${ao.phone && 'separator-shadow-bottom'}`}>
                    <div className="flex justify-between">
                        <Typography.Title>{ao.user?.firstName} {ao.user?.lastName}</Typography.Title>
                        <Typography.Title>{ao.status}</Typography.Title>
                    </div>
                    <div className="flex justify-between">
                        <Typography.Description>id: {ao.id}</Typography.Description>
                        <Typography.Description>{dayjs.utc(ao.createdAt).local().format('D MMMM, HH:mm')}</Typography.Description>
                    </div>
                </div>
                {ao.phone && <div className="p-3 pl-0 flex gap-2 flex-col">
                    <div className="flex justify-between">
                        <Typography.Title>{ao.phone}</Typography.Title>
                    </div>
                </div>}
            </Card>)}
        </div>}
    </div>
}