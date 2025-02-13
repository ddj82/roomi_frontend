import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import 'react-calendar/dist/Calendar.css'; // 스타일 파일도 import
import RoomSet from 'src/components/hostMenu/room_status/RoomStatusSet';
import RoomConfig from 'src/components/hostMenu/room_status/RoomStatusConfig';
import {RoomData} from "src/types/rooms";
import {myRoomList} from "src/api/api";

const RoomStatus = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("room_status_set");
    const tabs = ["room_status_set", "room_config"] as const;
    const [data, setData] = useState<RoomData[]>([]);
    const [selectedRoom, setSelectedRoom] = useState('');

    // 화면 로드시
    useEffect(() => {
        const myRoomAPI = async () => {
            try {
                const response = await myRoomList();
                const responseJson = await response.json();
                const items: RoomData[] = responseJson.data.items; // API 데이터 가져오기
                setData(items); // 상태 업데이트
                if (items.length > 0) {
                    setSelectedRoom(items[0].title); // 첫 번째 Room의 title로 초기화
                }
            } catch (error) {
                console.error('API 호출 중 에러 발생:', error);
            }
        };
        myRoomAPI();
    }, []);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRoom(event.target.value);
    };

    return (
        <div>
            <div>
                <select id="select-room" value={selectedRoom} onChange={handleChange}>
                    {data.map((room, index) => (
                        <option key={room.id} value={room.title}>
                            {room.title}
                        </option>
                    ))}
                </select>
            </div>
            <ul className="flex flex-wrap text-sm font-medium text-center text-black">
                {tabs.map((tab) => (
                    <li key={tab} className="me-2">
                        <button
                            className={`
                            inline-block px-4 py-3 rounded-lg hover:text-white hover:bg-roomi 
                            ${activeTab === tab ? "text-white bg-roomi" : "text-black"}
                            `}
                            onClick={() => setActiveTab(tab)}
                            type="button"
                            role="tab"
                            aria-controls={tab}
                            aria-selected={activeTab === tab}
                        >
                            {t(tab)}
                        </button>
                    </li>
                ))}
            </ul>
            {/*<div className="flex_center">*/}
            <div>
                {activeTab === 'room_status_set' ? (
                    <RoomSet data={data} selectedRoom={selectedRoom}/>
                ) : (
                    <RoomConfig data={data} selectedRoom={selectedRoom}/>
                )}
            </div>
        </div>
    );
};

export default RoomStatus;
