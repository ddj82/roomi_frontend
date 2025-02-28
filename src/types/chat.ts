export interface ChatRoom {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
}

export interface Messages {
    id: string;
    content: string;
    chatRoomId: string;
    createdAt: string;
    senderId: number | string;
    isRead: boolean;
}