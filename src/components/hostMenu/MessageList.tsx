import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {useChatStore} from "../stores/ChatStore";
import Message from "./MessageList/Message";
import dayjs from "dayjs";

interface ChatRoom {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
}

export default function MessageList() {
    // const { t } = useTranslation();
    // const [activeTab, setActiveTab] = useState("전체");
    // const tabs = ["전체", "안읽은 메시지"] as const;
    const { rooms, connect } = useChatStore();
    const [selectedChatRoomId, setSelectedChatRoomId] = useState<string | null>(null); // ✅ 선택한 채팅방
    const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            connect(token);
        }
    }, [connect]);

    const handleSetSelectedChatRoom = (chatRoom: ChatRoom) => {
        setSelectedChatRoom(chatRoom);
        setSelectedChatRoomId(chatRoom.id);
    };

    const handleOnBack = () => {
        setSelectedChatRoom(null);
        setSelectedChatRoomId(null);
    };

    return (
        <div className="flex h-full">
            {(!isMobile || !selectedChatRoomId) && (
                <div className="border border-gray-300 overflow-y-auto w-full md:w-2/5">
                    <div className="m-2 border border-gray-300">
                        <input type="search" className="w-full focus:outline-none p-1"/>
                    </div>
                    {rooms.length > 0 ? (
                        rooms.map((chatRoom) => (
                            <div key={chatRoom.id}>
                                <button type="button" onClick={() => handleSetSelectedChatRoom(chatRoom)}
                                    className="flex p-3 border-b border-gray-300 hover:bg-gray-100 w-full">
                                    <div className="w-1/5 h-auto flex_center">프사</div>
                                    <div className="w-full flex flex-col items-start text-sm">
                                        <div className="">{chatRoom.title} ({chatRoom.unreadCount})</div>
                                        <div className="font-bold">이름</div>
                                        <div className="text-gray-400">{chatRoom.lastMessage}</div>
                                    </div>
                                    <div className="w-1/5 text-center text-gray-400">{dayjs(chatRoom.timestamp).format('MM-DD')}</div>
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="flex_center text-gray-500 h-full">📭 채팅방이 없습니다.</div>
                    )}
                </div>
            )}
            {(!isMobile || selectedChatRoomId) && (
                <div className="w-full md:w-3/5">
                    {selectedChatRoomId && selectedChatRoom ? (
                        <Message chatRoom={selectedChatRoom} chatRoomId={selectedChatRoomId} onBack={handleOnBack} />
                    ) : (
                        <div className="flex_center text-gray-500 h-full">📭 채팅방을 선택하세요.</div>
                    )}
                </div>
            )}
        </div>
    );
};
