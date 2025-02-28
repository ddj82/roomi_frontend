import React, { useEffect, useState, useRef } from 'react';
import { useChatStore } from "src/components/stores/ChatStore";
import dayjs from 'dayjs';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPaperPlane, faXmark} from "@fortawesome/free-solid-svg-icons";
import {ChatRoom, Messages} from "../../../types/chat";

interface MessageProps {
    chatRoom: ChatRoom;
    chatRoomId: string;
    onBack: () => void;
}

export default function Message({ chatRoom, chatRoomId, onBack }: MessageProps) {
    const { getRoomMessages, sendMessage } = useChatStore();
    const messages: Messages[] = getRoomMessages(chatRoomId);
    const [input, setInput] = useState("");
    const myUserId = localStorage.getItem('userId');
    const chatContainerRef = useRef<HTMLDivElement>(null); // ✅ 스크롤 최하단 이동용 ref

    // ✅ 날짜별로 메시지 그룹화 & 오름차순 정렬
    const groupMessagesByDate = (messages: Messages[]): Record<string, Messages[]> => {
        return messages
            .sort((a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix()) // ✅ 오름차순 정렬
            .reduce<Record<string, Messages[]>>((acc, msg) => {
                const dateKey = dayjs(msg.createdAt).format("YYYY-MM-DD"); // ✅ YYYY-MM-DD 형식 변환
                if (!acc[dateKey]) {
                    acc[dateKey] = [];
                }
                acc[dateKey].push(msg);
                return acc;
            }, {});
    };

    // ✅ 날짜별로 그룹화된 메시지
    const groupedMessages: Record<string, Messages[]> = groupMessagesByDate(messages);

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
        <div className="border border-gray-300 flex flex-col h-full">
            {/* ✅ 채팅방 상단 바 */}
            <div className="px-2 py-4 flex items-center border-b border-gray-300 w-full">
                <div className="w-1/6 flex_center">
                    <div>프사</div>
                </div>
                <div className="w-full flex flex-col items-start">
                    <span className="text-lg">{chatRoom.title}</span>
                    <div className="flex">
                        <span className="mr-2">이름</span>
                        <div className="text-gray-400">
                            <span>{dayjs(messages[0].createdAt).format('YYYY-MM-DD')}</span>
                            <span> - </span>
                            <span>{dayjs(messages[messages.length - 1].createdAt).format('YYYY-MM-DD')}</span>
                        </div>
                    </div>
                </div>
                <div className="flex_center">
                    <button className="p-2 w-full text-lg text-gray-500" onClick={onBack}>
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
            </div>

            {/* ✅ 채팅 메시지 영역 (스크롤 최하단 이동) */}
            <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto scrollbar-hidden">
                {Object.keys(groupedMessages).length > 0 ? (
                    Object.keys(groupedMessages).map((date) => (
                        <div key={date}>
                            {/* ✅ 날짜 헤더 추가 */}
                            <div className="text-center text-white text-sm my-2">
                                <span className="bg-gray-400 px-2 py-1 rounded-lg">{date}</span>
                            </div>
                            {groupedMessages[date].map((msg, index) => (
                                <div key={index} className={`flex ${String(msg.senderId) === myUserId ? "justify-end" : "justify-start"} mb-2`}>
                                    <div className={`flex ${String(msg.senderId) === myUserId && "flex-row-reverse"}`}>
                                        <div className={`p-3 rounded-lg ${
                                             String(msg.senderId) === myUserId
                                                ? "bg-roomi text-white text-right max-w-xs"
                                                : "bg-gray-100 text-black text-left max-w-xs"
                                        }`}>
                                            <div>{msg.content}</div>
                                        </div>
                                        <div className={`text-gray-400 text-xs flex items-end 
                                        ${String(msg.senderId) === myUserId ? "mr-2" : "ml-2"}
                                        `}>
                                            {dayjs(msg.createdAt).format("HH:mm")} {/* ✅ 시간 포맷 */}
                                        </div>
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
                    className="flex-1 bg-gray-100 rounded-lg p-2 focus:outline-none"
                    type="text"
                    placeholder="메시지 입력..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button className="ml-2 p-2 text-roomi text-xl"
                        onClick={() => { sendMessage(chatRoomId, input); setInput(""); }}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                </button>
            </div>
        </div>
    );
};
