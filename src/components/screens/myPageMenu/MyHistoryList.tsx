import React, {useEffect, useState} from 'react';
import {RoomData} from "../../../types/rooms";
import {useTranslation} from "react-i18next";
import {getRoomHistoryList} from "../../../api/api";
import i18n from "../../../i18n";

export default function MyHistoryList() {
    const {t} = useTranslation();
    const [roomData, setRoomData] = useState<RoomData[] | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getRoomHistoryList();
                const responseJson = await response.json();
                const rooms: RoomData[] = responseJson.data.items;
                console.log('HistoryList:', rooms);
                setRoomData(rooms);
            } catch (error) {
                console.error('API 호출 오류:', error);
            }
        };

        fetchData();
    }, []);

    const handleCardClick = (roomId: number) => {
        const currentLocale = i18n.language; // 현재 언어 감지
        window.open(`/detail/${roomId}/${currentLocale}`, '_blank');
    };

    return (
        <div className="p-4 md:px-8">
            {roomData && roomData.length > 0 ? (
                roomData.map((room, index) => (
                    <div key={index} className="flex md:p-4 bg-gray-100 my-4 rounded-lg relative md:flex-row flex-col">
                        <div className="md:w-36 md:h-32 md:mr-4">
                            <img
                                className="object-cover rounded md:rounded-lg w-full h-full"
                                src={room.detail_urls?.[0]}
                                alt="thumbnail"
                            />
                        </div>
                        <div className="flex flex-col justify-center md:p-0 p-4">
                            <div className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                                <button type="button" onClick={() => handleCardClick(room.id)}>
                                    {room.title}
                                </button>
                            </div>
                            <div className="font-normal text-gray-700">{room.address}</div>
                            <div className="font-normal text-gray-700">
                                {room.day_price && (<div>{t('원')}{room.day_price.toLocaleString()} / {t('일')}</div>)}
                                {room.week_price && (<div>{t('원')}{room.week_price.toLocaleString()} / {t('주')}</div>)}
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="flex_center">최근 본 게시물이 없습니다.</div>
            )}
        </div>
    );
};
