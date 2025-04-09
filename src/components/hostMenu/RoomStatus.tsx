import React, {useEffect, useState, useRef} from 'react';
import {useTranslation} from "react-i18next";
import 'react-calendar/dist/Calendar.css';
import RoomSet from 'src/components/hostMenu/roomStatus/RoomStatusSet';
import RoomConfig from 'src/components/hostMenu/roomStatus/RoomStatusConfig';
import {RoomData} from "src/types/rooms";
import {myRoomList} from "src/api/api";
import {useDataUpdateStore} from "../stores/DataUpdateStore";
import { ChevronDown } from 'lucide-react'; // 추가된 import

const RoomStatus = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("room_status_set");
    const tabs = ["room_status_set", "room_config"] as const;
    const [data, setData] = useState<RoomData[]>([]);
    const [selectedRoom, setSelectedRoom] = useState(0);
    const { dataUpdate } = useDataUpdateStore();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // Find the selected room to display its title
    const selectedRoomData = data.find(room => room.id === selectedRoom);
    const displayValue = selectedRoomData ? `${selectedRoomData.title} ${selectedRoomData.id}` : '선택하세요';

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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

    const handleSelectRoom = (roomId: number) => {
        setSelectedRoom(Number(roomId));
        setIsDropdownOpen(false);
    };

    return (
        <div className="min-h-[0vh]">
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

                {/* 새로운 커스텀 드롭다운 */}
                <div className="relative md:w-1/2 md:m-0 mt-4" ref={dropdownRef}>
                    <button
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-3 text-base
                        bg-white border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <span className="text-gray-700">{displayValue}</span>
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                    </button>

                    {/* 드롭다운 메뉴 */}
                    {isDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                            {data.map((room) => (
                                <div
                                    key={room.id}
                                    className={`px-4 py-3 cursor-pointer hover:bg-roomi-000 rounded-lg
                                    ${selectedRoom === room.id ? 'bg-roomi-1' : ''}`}
                                    onClick={() => handleSelectRoom(room.id)}
                                >
                                    {room.title} {room.id}
                                </div>
                            ))}
                        </div>
                    )}
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