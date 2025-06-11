import React, {useCallback, useEffect, useState} from 'react';
import {RoomData} from "src/types/rooms";
import 'src/css/MainHome.css';
import HomeScreen from "src/components/screens/HomeScreen";
import {useTranslation} from "react-i18next";
import GoogleMap from "../map/GoogleMap";

export default function MainMap() {
    const [rooms, setRooms] = useState<RoomData[]>([]);
    const {t} = useTranslation();

    const handleRoomsUpdate = useCallback((newRooms: RoomData[]) => {
        console.log('Rooms updated in App:', newRooms);
        setRooms(newRooms);
    }, []);

    useEffect(() => {
        if (localStorage.getItem('mainReload') && localStorage.getItem('mainReload') === 'true') {
            localStorage.removeItem('mainReload'); // 플래그 제거 (한 번만 새로고침하도록)
            window.location.reload();
        }
    }, []);

    return (
        <div className="mainHome main-container">
            {/* 상단 필터바 */}
            {/*<FilterBar/>*/}

            {/* 70% 지도 + 30% 리스트 레이아웃 */}
            <div className="flex h-screen w-full">
                {/* 왼쪽 지도 영역 - 70% */}
                <div className="w-[70%] h-full relative">
                    <GoogleMap onRoomsUpdate={handleRoomsUpdate}/>
                </div>

                {/* 오른쪽 리스트 영역 - 30% */}
                <div className="w-[30%] h-full overflow-hidden border-l border-gray-200">
                    <HomeScreen rooms={rooms}/>
                </div>
            </div>
        </div>
    );
};
