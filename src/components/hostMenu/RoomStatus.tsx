import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import 'react-calendar/dist/Calendar.css'; // 스타일 파일도 import
import RoomSet from 'src/components/hostMenu/roomStatus/RoomStatusSet';
import RoomConfig from 'src/components/hostMenu/roomStatus/RoomStatusConfig';
import {RoomData} from "src/types/rooms";
import {myRoomList} from "src/api/api";
import {useDataUpdate} from "../auth/DataUpdateContext";

const RoomStatus = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("room_status_set");
    const tabs = ["room_status_set", "room_config"] as const;
    const [data, setData] = useState<RoomData[]>([]);
    const [selectedRoom, setSelectedRoom] = useState(0);
    const { dataUpdate } = useDataUpdate();

    // 화면 로드시
    useEffect(() => {
        const myRoomAPI = async () => {
            try {
                const response = await myRoomList();
                const responseJson = await response.json();
                const items: RoomData[] = responseJson.data.items; // API 데이터 가져오기
                setData(items); // 상태 업데이트
                if (items.length > 0) {
                    if (selectedRoom > 0) {
                        // 선택된 방이 있으면 그걸로 초기화
                        items.map((room, index) => {
                            const selectRoomId = room.id;
                            if (selectRoomId === selectedRoom) {
                                setSelectedRoom(room.id);
                            }
                        });
                    } else {
                        // 첫 번째 Room으로 초기화
                        setSelectedRoom(items[0].id);
                    }
                }
            } catch (error) {
                console.error('API 호출 중 에러 발생:', error);
            }
        };
        myRoomAPI();
    }, [dataUpdate]);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRoom(Number(event.target.value));
    };

    return (
        <div className="min-h-[60vh]">
            <div className="flex justify-between my-12 md:flex-row flex-col">
                <div className="flex flex-wrap gap-4">
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
                <div className="md:w-1/2 md:m-0 mt-4">
                    <select value={selectedRoom} onChange={handleChange}
                            className="border border-gray-300 rounded p-2 w-full focus:outline-none"
                    >
                        {data.map((room, index) => (
                            <option key={room.id} value={room.id}>
                                {room.title} {room.id}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
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
