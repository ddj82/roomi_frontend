import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {useChatStore} from "../stores/ChatStore";
import Message from "./MessageList/Message";

const MessageList = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("전체");
    const tabs = ["전체", "안읽은 메시지"] as const;
    const { rooms, connect } = useChatStore();
    const [selectedChatRoomId, setSelectedChatRoomId] = useState<string | null>(null); // ✅ 선택한 채팅방

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            connect(token);
        }
    }, [connect]);

    return (
        <div>
            {selectedChatRoomId ? (
                <Message chatRoomId={selectedChatRoomId} onBack={() => setSelectedChatRoomId(null)} /> // ✅ 채팅방으로 이동
            ) : (
                <>
                    {/*
                    <div className="flex_center">
                        {tabs.map((tab) => (
                            <div key={tab} className="text-sm text-center text-black">
                                <button
                                    className={`
                                        inline-block px-4 py-3 hover:text-roomi
                                        ${activeTab === tab ? "text-roomi border-b-2 border-roomi" : "text-black"}
                                        `}
                                    onClick={() => setActiveTab(tab)}
                                    type="button"
                                    role="tab"
                                    aria-controls={tab}
                                    aria-selected={activeTab === tab}
                                >
                                    {t(tab)}
                                </button>
                            </div>
                        ))}
                    </div>
                    <div>
                        {activeTab === '전체' ? ('전체 메시지') : ('안읽은 메시지')}
                    </div>
                    */}
                    <div className="border border-black p-2 h-48 overflow-y-auto">
                        {rooms.length > 0 ? (
                            rooms.map((room) => (
                                <div
                                    key={room.id}
                                    className="cursor-pointer p-3 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                                    onClick={() => setSelectedChatRoomId(room.id)} // ✅ 클릭하면 해당 채팅방 열기
                                >
                                    {room.title} (📩 {room.unreadCount}개)
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">📭 채팅방이 없습니다.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default MessageList;
