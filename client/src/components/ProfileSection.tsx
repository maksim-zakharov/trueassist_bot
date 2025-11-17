import {Avatar, AvatarFallback, AvatarImage} from "./ui/avatar.tsx";
import {User} from "lucide-react";
import {Typography} from "./ui/Typography.tsx";
import React, {useMemo} from "react";
import {Skeleton} from "./ui/skeleton.tsx";


export const ProfileSkeleton = () => <div className="flex flex-col gap-4">
    <Skeleton className="size-24 m-auto rounded-full"/>
    <div className="text-center m-auto gap-2 flex flex-col">
        <Skeleton className="w-[200px] h-[28px]"/>
        <Skeleton className="w-[120px] m-auto h-[20px] py-2"/>
    </div>
</div>

export const ProfileSection = ({user}) => {

    const title = useMemo(() => {
        let _title = `id: ${user?.id}`
        if(user?.username){
            _title +=  `• @${user?.username}`
        }
        return _title;
    }, [user])

    return <Typography.H2 className="flex flex-col gap-2 pt-4 text-center text-3xl font-medium mb-4">
        <Avatar className="size-24 m-auto">
            <AvatarImage src={user?.photoUrl}/>
            <AvatarFallback><User/></AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
            <div>
                {user?.firstName} {user?.lastName}
            </div>
            <Typography.Description className="text-lg font-normal">{title}</Typography.Description>
        </div>
    </Typography.H2>
}