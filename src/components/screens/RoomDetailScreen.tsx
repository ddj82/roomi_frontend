import React, {useEffect} from "react";
import { useParams } from 'react-router-dom';
import {fetchRoomData} from "src/api/api";

export default function RoomDetailScreen () {
    const { roomId, locale } = useParams(); // URL 파라미터 추출
    useEffect(() => {
        const loadRoomData = async () => {
            if (roomId) {
                console.log(`Room ID: ${roomId}`);
                try {
                    if (locale != null) {
                        await fetchRoomData(Number(roomId), locale);
                    }
                } catch (error) {
                    console.error('방 정보 불러오기 실패:', error);
                }
            }
        };
        loadRoomData();
    }, [roomId, locale]); // roomId와 locale 변경 시 실행
    return (
        <div>
            <h1>방 디테일</h1>
            <p>Room ID: {roomId}</p>
            <p>Locale: {locale}</p>
        </div>
    );
}