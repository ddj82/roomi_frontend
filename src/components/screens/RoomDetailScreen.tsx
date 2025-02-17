import React, {useEffect, useState} from "react";
import {useParams} from 'react-router-dom';
import {fetchRoomData} from "src/api/api";
import {RoomData} from "../../types/rooms";
import ImgCarousel from "../modals/ImgCarousel";

export default function RoomDetailScreen() {
    const {roomId, locale} = useParams(); // URL 파라미터 추출
    const [room, setRoom] = useState<RoomData | null>(null);

    useEffect(() => {
        const loadRoomData = async () => {
            if (roomId) {
                console.log(`Room ID: ${roomId}`);
                try {
                    if (locale != null) {
                        const response = await fetchRoomData(Number(roomId), locale);
                        const responseJson = await response.json();
                        const roomData = responseJson.data;
                        console.log('데이터 :', roomData);
                        setRoom(roomData);
                    }
                } catch (error) {
                    console.error('방 정보 불러오기 실패:', error);
                }
            }
        };
        loadRoomData();
    }, [roomId, locale]); // roomId와 locale 변경 시 실행
    return (
        <div className="mt-8 relative overflow-visible">
            {room ? (
                <div>
                    <div className="flex">
                        {room.detail_urls && room.detail_urls.length > 0 ? (
                            <div className="w-3/5">
                                <ImgCarousel images={room.detail_urls} customClass="rounded-lg h-64 md:h-[30rem]"/>
                                <div>{room.title}</div>
                                <div>{room.title}</div>
                                <br/>
                                <br/>
                                <br/>
                                <br/>
                                <br/>
                                <br/>
                                <br/>
                                <br/>
                                <br/>
                                <br/>
                                <br/>
                                <br/>
                                <br/>
                                <br/>
                            </div>
                        ) : (
                            <img
                                src="/default-image.jpg" // 이미지 없을 경우 기본 이미지
                                alt="thumbnail"
                                className="homeScreen card-image"
                            />
                        )}
                        
                        {/*리모컨 영역*/}
                        <div className="w-1/3 ml-auto md:h-[30rem] border-[1px] border-gray-300 rounded-lg p-4 sticky top-10">
                            <div>Room ID: {room.id}</div>
                            <div>Locale: {room.address}</div>
                        </div>
                    </div>
                </div>






















            ) : (
                <div className="text-center">
                    <div role="status">
                        <svg aria-hidden="true"
                             className="inline w-8 h-8 text-gray-300 animate-spin fill-roomi"
                             viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"/>
                            <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"/>
                        </svg>
                        <span className="sr-only">로딩중...</span>
                    </div>
                </div>
            )}
        </div>
    );
}