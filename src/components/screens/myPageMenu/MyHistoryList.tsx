import React, {useEffect, useState} from 'react';
import {RoomData} from "../../../types/rooms";
import {useTranslation} from "react-i18next";
import {getRoomHistoryList} from "../../../api/api";

export default function MyHistoryList() {
    const {t} = useTranslation();
    const [roomData, setRoomData] = useState<RoomData[] | null>(null);

    useEffect(() => {
        try {
            const fetchData = async () => {
                const response = await getRoomHistoryList();
                const responseJson = await response.json();
                const rooms: RoomData[] = responseJson.data.items;
                console.log('HistoryList:', rooms);
                setRoomData(rooms);
            };
            fetchData();
        } catch (error) {
            console.error('API 호출 오류:', error);
        }
    }, []);

    return (
        <div className="p-4 md:px-8">
            <h2 className="mb-4 font_title">{t("최근 본 게시물")}</h2>
            {roomData && roomData.length > 0 ? (
                roomData.map((room, index) => (
                    <div key={index} className="flex p-4 bg-gray-100 my-4 rounded-lg relative">
                        <div className="md:w-36 md:h-32 mr-4">
                            <img
                                className="object-cover rounded md:rounded-lg w-full h-full"
                                src={room.detail_urls?.[0]}
                                alt="thumbnail"
                            />
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{room.title}</div>
                            <div className="font-normal text-gray-700">{room.address}</div>
                            <div className="font-normal text-gray-700">
                                {room.day_price && (<div>{room.day_price} / 일</div>)}
                                {room.week_price && (<div>{room.week_price} / 주</div>)}
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <p>관심 목록이 없습니다.</p>
            )}
        </div>
    );
};
