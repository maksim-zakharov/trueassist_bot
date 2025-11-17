import React, {FC, PropsWithChildren, useEffect, useRef, useState} from "react";
import {
    useCloseAdminChatMessageMutation,
    useGetAdminChatDetailsQuery,
    useSendAdminChatMessageMutation,
    useStartAdminChatMessageMutation
} from "../../api/ordersApi.ts";
import {useNavigate, useParams} from "react-router-dom";
import {cn} from "../../lib/utils.ts";
import {useBackButton, useTelegram} from "../../hooks/useTelegram.tsx";
import {RoutePaths} from "../../routes.ts";
import {Input} from "../../components/ui/input.tsx";
import {BottomActions} from "../../components/BottomActions.tsx";
import {Button} from "../../components/ui/button.tsx";
import {ArrowUp, Trash2, User} from "lucide-react";
import {io, Socket} from "socket.io-client";
import {ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger} from "@/components/ui/context-menu.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "../../components/ui/avatar.tsx";
import dayjs from "dayjs";

const Message: FC<PropsWithChildren & { id: string, onDeleteMessage: any }> = ({children, id, onDeleteMessage}) => {
    const {vibro} = useTelegram();

    const handleOpenChange = (opened: boolean) => {
        opened ? vibro() : null;
    }

    const handleDeleteClick = () => {
        Telegram.WebApp.showPopup({
            title: `Are you sure you want to delete message?`,
            message: 'Message cannot be restore',
            buttons: [{
                id: 'ok',
                text: 'Delete',
                type: 'destructive'
            }, {
                id: 'cancel',
                text: 'Cancel',
                type: 'default'
            }]
        }, buttonId => buttonId === 'ok' && onDeleteMessage(id))
    }

    return <ContextMenu onOpenChange={handleOpenChange}>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent>
            <ContextMenuItem onClick={handleDeleteClick}><Trash2 className="h-4 w-4 text-tg-theme-button-text-color"/>Удалить</ContextMenuItem>
        </ContextMenuContent>
    </ContextMenu>
}

export const AdminChatDetailsPage = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const navigate = useNavigate();
    useBackButton(() => navigate(RoutePaths.Admin.Chat.List));
    const {id} = useParams<string>();
    const {data: dialog} = useGetAdminChatDetailsQuery({id});
    const [startChat] = useStartAdminChatMessageMutation();
    const [closeChat] = useCloseAdminChatMessageMutation();

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<any[]>([])
    const [sendMessage, {isLoading}] = useSendAdminChatMessageMutation();

    const inputRef = useRef(null);

    useEffect(() => {
        setMessages(dialog?.messages || []);
    }, [dialog]);

    useEffect(() => {
        if (socket?.connected) {
            socket.emit('messages', {
                chatId: id
            });
        }
    }, [socket?.connected, id, socket]);

    // Инициализация Socket.IO
    useEffect(() => {
        const newSocket = io('/chat', {
            transports: ['websocket'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            // setIsConnected(true);
            console.log('Connected to server');
        });

        newSocket.on('message', (data: string) => {
            const messageData = JSON.parse(data);
            if (messageData.type === 'deleteMessage') {
                setMessages(prevState => prevState.filter(m => m.id !== messageData.id));
            } else {
                setMessages(prevState => [...prevState, messageData]);
            }
        });

        newSocket.on('disconnect', () => {
            // setIsConnected(false);
            console.log('Disconnected from server');
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Скролл вниз при изменении messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages]);

    const [message, setMessage] = useState('');

    const onDeleteMessage = (messageId: number) => {
        socket?.emit('message', {
            type: 'deleteMessage',
            id: messageId,
            chatId: id,
        });
    }

    const handleOnSubmit = async () => {
        socket?.emit('message', {
            chatId: id,
            text: message
        });
        setMessage('');

        // ... логика отправки ...
        inputRef.current?.focus();  // Возвращаем фокус
    }
    // Фокус при монтировании
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const confirmCloseChat = () => closeChat({id}).unwrap();

    const handleCloseChat = () => {
        Telegram.WebApp.showPopup({
            title: `Are you sure you want to close chat?`,
            message: 'Chat will be closed',
            buttons: [{
                id: 'ok',
                text: 'Close',
                type: 'destructive'
            },{
                id: 'cancel',
                text: 'Cancel',
                type: 'default'
            }]
        }, id => id === 'ok' && confirmCloseChat())
    }

    if (!dialog) {
        return null;
    }

    return <div className="relative root-bg-color">
        <div
            className="px-1 py-2 flex gap-2 pl-3 separator-shadow-bottom fixed [backdrop-filter:blur(5px)] top-0 z-1 root-bg-color-transparency w-full">
            <Avatar className="size-[28px] h-[40px] w-[40px]">
                <AvatarImage src={dialog?.user?.photoUrl}/>
                <AvatarFallback><User/></AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2 w-full justify-center">
                    <span
                        className="text-[18px] [line-height:20px] [font-weight:500] text-tg-theme-text-color truncate">
                            {dialog?.user?.firstName} {dialog?.user?.lastName}
                    </span>
            </div>
        </div>
        <div className="p-3 flex-1 mt-[50px]">
            {messages.map((m, index) => <Message key={m.id} id={m.id} onDeleteMessage={onDeleteMessage}>
                {m.type === 'TEXT' && <div
                    className={cn("relative animate-fade-in select-none p-1.5 rounded-lg mb-0.5 text-wrap break-all w-max pr-12 max-w-[calc(100vw-60px)] text-tg-theme-text-color truncate", m.from === 'client' ? 'ml-auto bg-tg-theme-button-color rounded-l-2xl pl-3' : 'mr-auto card-bg-color rounded-r-2xl pl-2', m.from !== messages[index + 1]?.from && 'mb-1.5', m.from !== messages[index - 1]?.from && (m.from === 'support' ? 'rounded-tl-2xl' : 'rounded-tr-2xl'))}>
                    {m.text}
                    <span
                        className={cn(" text-xs text-[10px] absolute right-2 bottom-1", m.from !== 'client' ? 'text-tg-theme-hint-color' : '')}>
                        {dayjs.utc(m.date * 1000).local().format('HH:mm')}
                    </span>
                </div>}
                {m.type === 'SYSTEM' && <div
                    className={cn("relative animate-fade-in select-none p-1 px-3 text-sm rounded-lg text-wrap break-all w-max max-w-[calc(100vw-60px)] text-tg-theme-text-color truncate m-auto my-2 card-bg-color rounded-2xl text-center font-bold")}>
                    {m.text}
                </div>}
                {m.type === 'PHOTO' && <div
                    className={cn("relative animate-fade-in select-none rounded-lg mb-0.5 text-wrap break-all w-max max-w-[calc(100vw-60px)] text-tg-theme-text-color truncate", m.from === 'client' ? 'ml-auto rounded-l-2xl' : 'mr-auto card-bg-color rounded-r-2xl', m.from !== messages[index + 1]?.from && 'mb-1.5', m.from !== messages[index - 1]?.from && (m.from === 'support' ? 'rounded-tl-2xl' : 'rounded-tr-2xl'))}>
                    <img src={`/api/admin/chat-assets/${m.text}`}/>
                    <span
                        className={cn(" text-xs text-[10px] absolute right-2 bottom-1", m.from !== 'client' ? 'text-tg-theme-hint-color' : '')}>
                        {dayjs.utc(m.date * 1000).local().format('HH:mm')}
                    </span>
                </div>}
                </Message>
            )}

            <div ref={messagesEndRef} className="h-[32px]"/>
        {/* Невидимый якорь для скролла */}
    </div>
{
    !dialog.isStarted && <BottomActions
        className="[padding-bottom:var(--tg-safe-area-inset-bottom)] [min-height:calc(84px + var(--tg-safe-area-inset-bottom))]">
        <Button wide onClick={() => startChat({id}).unwrap()}>Start a dialogue</Button>
    </BottomActions>
}
{
    dialog.isStarted && <BottomActions className="[padding-bottom:var(--tg-safe-area-inset-bottom)] flex-col">
        <div className="flex gap-2 w-full">
            <Input
                ref={inputRef}
                className="border-none rounded-3xl text-tg-theme-hint-color h-8 placeholder-[var(--tg-theme-hint-color)]"
                value={message}
                onChange={e => setMessage(e.target.value)}
                    placeholder="Message"/>
                <Button size="sm" className="border-none h-8 w-8 p-1.5 rounded-full" variant="primary" disabled={!message}
                        loading={isLoading} onClick={handleOnSubmit}><ArrowUp/></Button>
            </div>
            <Button wide variant="default" size="lg"
                    className="border-none" onClick={handleCloseChat}>Close a dialogue</Button>
        </BottomActions>}
    </div>
}