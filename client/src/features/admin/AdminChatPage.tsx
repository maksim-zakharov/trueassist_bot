import {useMemo, useState} from "react";
import {List} from "../../components/ui/list.tsx";
import {User} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "../../components/ui/avatar.tsx";
import dayjs from "dayjs";
import {useGetAdminChatsQuery} from "../../api/ordersApi.ts";
import {RoutePaths} from "../../routes.ts";
import {useNavigate} from "react-router-dom";
import {Input} from "../../components/ui/input.tsx";
import {useTranslation} from "react-i18next";

const formatChatDate = (dialog: any): string => {
    const lastMessage = dialog.messages && dialog.messages.length > 0 
        ? dialog.messages[dialog.messages.length - 1]
        : null;
    
    const messageDate = lastMessage 
        ? dayjs.utc(lastMessage.date * 1000).local()
        : dayjs.utc(dialog.date).local();
    
    const isToday = messageDate.isSame(dayjs(), 'day');
    
    return isToday 
        ? messageDate.format('HH:mm')
        : messageDate.format('DD.MM.YYYY');
};

export const AdminChatPage = () => {
    const {t} = useTranslation();
    const navigate = useNavigate()

    const {data: dialogs = []} = useGetAdminChatsQuery();

    const [search, setSearch] = useState<string>('');

    const filteredChats = useMemo(() => {
        const filtered = dialogs.filter(d => !search || d.user.firstName.toLowerCase().includes(search.toLowerCase()) || (d.user.lastName && d.user.lastName.toLowerCase().includes(search.toLowerCase())));
        
        // Сортируем по дате последнего сообщения (новые вверху)
        return filtered.sort((a, b) => {
            const getLastMessageDate = (dialog: any) => {
                if (dialog.messages && dialog.messages.length > 0) {
                    return dialog.messages[dialog.messages.length - 1].date * 1000;
                }
                return new Date(dialog.date).getTime();
            };
            
            const dateA = getLastMessageDate(a);
            const dateB = getLastMessageDate(b);
            
            return dateB - dateA; // От новых к старым
        });
    }, [dialogs, search]);

    return <>
        <div className="p-4 px-2">
            <Input value={search} onChange={e => setSearch(e.target.value)} className="border-none card-bg-color rounded-lg text-tg-theme-hint-color h-10 placeholder-[var(--tg-theme-hint-color)] text-center"
                   placeholder={t('search_by_name')}/>
        </div>
        <List itemClassName="flex gap-2 p-2 root-bg-color" className="rounded-none">
            {filteredChats.map((option) => <div className="flex gap-3 w-full"
                                          onClick={() => navigate(RoutePaths.Admin.Chat.Details(option.id))}>
                <Avatar className="size-[28px] h-[54px] w-[54px]">
                    <AvatarImage src={option?.user?.photoUrl}/>
                    <AvatarFallback><User/></AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-3 w-full justify-between">
                    <span
                        className="text-[16px] [line-height:20px] [font-weight:500] text-tg-theme-text-color truncate">
                        {option?.user?.firstName} {option?.user?.lastName}
                    </span>
                        <span
                            className="text-[12px] [line-height:20px] [font-weight:400] text-tg-theme-subtitle-text-color truncate">
                            {formatChatDate(option)}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 w-full justify-between">
                    <span
                        className="text-[16px] [line-height:20px] [font-weight:400] text-tg-theme-subtitle-text-color truncate">
                        {option.messages[option.messages.length - 1]?.type === "PHOTO" && <div className="flex gap-1.5 h-5">
                            <img src={`/api/admin/chat-assets/${option.messages[option.messages.length - 1]?.text}`}/> {t('chat_photo_label')}
                        </div>}
                        {option.messages[option.messages.length - 1]?.type === "TEXT" && option.messages[option.messages.length - 1]?.text}
                    </span>
                    </div>
                </div>
            </div>)}
        </List>
    </>
}