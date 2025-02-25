import React, { useEffect, useState, useRef } from 'react';
import { useChatStore } from "src/components/stores/ChatStore";
import dayjs from 'dayjs';

interface MessageProps {
    chatRoomId: string;
    onBack: () => void;
}

interface Message {
    id: string;
    content: string;
    chatRoomId: string;
    createdAt: string;
    senderId: number | string;
    isRead: boolean;
}

export default function Message({ chatRoomId, onBack }: MessageProps) {
    const { getRoomMessages, sendMessage } = useChatStore();
    const messages: Message[] = getRoomMessages(chatRoomId);
    const [input, setInput] = useState("");
    const myUserId = localStorage.getItem('userId');
    const chatContainerRef = useRef<HTMLDivElement>(null); // ✅ 스크롤 최하단 이동용 ref

    // ✅ 날짜별로 메시지 그룹화 & 오름차순 정렬
    const groupMessagesByDate = (messages: Message[]): Record<string, Message[]> => {
        return messages
            .sort((a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix()) // ✅ 오름차순 정렬
            .reduce<Record<string, Message[]>>((acc, msg) => {
                const dateKey = dayjs(msg.createdAt).format("YYYY-MM-DD"); // ✅ YYYY-MM-DD 형식 변환
                if (!acc[dateKey]) {
                    acc[dateKey] = [];
                }
                acc[dateKey].push(msg);
                return acc;
            }, {});
    };

    // ✅ 날짜별로 그룹화된 메시지
    const groupedMessages: Record<string, Message[]> = groupMessagesByDate(messages);

    // ✅ 스크롤을 최하단으로 이동하는 함수
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    // ✅ 채팅 업데이트 시 자동 스크롤
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex flex-col h-screen">
            {/* ✅ 채팅방 상단 바 */}
            <div className="bg-gray-800 text-white p-4 flex items-center">
                <button className="mr-2 text-lg" onClick={onBack}>⬅</button>
                <span className="text-lg">채팅방: {chatRoomId}</span>
            </div>

            {/* ✅ 채팅 메시지 영역 (스크롤 최하단 이동) */}
            <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto bg-gray-100">
                {Object.keys(groupedMessages).length > 0 ? (
                    Object.keys(groupedMessages).map((date) => (
                        <div key={date}>
                            {/* ✅ 날짜 헤더 추가 */}
                            <div className="text-center text-gray-600 text-sm my-2">{date}</div>
                            {groupedMessages[date].map((msg, i) => (
                                <div key={i} className={`flex ${String(msg.senderId) === myUserId ? "justify-end" : "justify-start"} mb-2`}>
                                    <div
                                        className={`p-3 rounded-lg ${
                                            String(msg.senderId) === myUserId
                                                ? "bg-blue-500 text-white text-right max-w-xs"
                                                : "bg-gray-300 text-black text-left max-w-xs"
                                        }`}
                                    >
                                        {msg.content}
                                        <br />
                                        <span className="text-xs block mt-1 text-gray-600">
                                            {dayjs(msg.createdAt).format("HH:mm:ss")} {/* ✅ 시간 포맷 */}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500">📭 메시지가 없습니다.</p>
                )}
            </div>

            {/* ✅ 메시지 입력창 */}
            <div className="p-4 bg-white border-t flex">
                <input
                    className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none"
                    type="text"
                    placeholder="메시지 입력..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg" onClick={() => { sendMessage(chatRoomId, input); setInput(""); }}>
                    전송
                </button>
            </div>
        </div>
    );
};
