import React, { useCallback, useState } from 'react';
import KakaoWebMap from "src/components/map/KakaoMap";
import {RoomData} from "src/types/rooms"; // 스타일을 별도 CSS 파일로 관리
import 'src/css/MainHome.css';
import FilterBar from "src/components/header/FilterBar";
import HomeScreen from "src/components/screens/HomeScreen";

export default function MainHome() {
    const [homeVisible, setHomeVisible] = useState(true);
    const [rooms, setRooms] = useState<RoomData[]>([]);

    const handleRoomsUpdate = useCallback((newRooms: RoomData[]) => {
        console.log('Rooms updated in App:', newRooms);
        setRooms(newRooms);
    }, []);

    const toggleView = () => {
        setHomeVisible((prev) => !prev);
    };

    return (
        <div className="mainHome main-container">
            {/* 상단 필터바 */}
            <FilterBar />

            {/* KakaoMap을 항상 유지하고, display로 컨트롤 */}
            <div className="mainHome content-wrapper">
                <div className="mainHome map-container" style={{ display: homeVisible ? 'block' : 'none' }}>
                    <KakaoWebMap onRoomsUpdate={handleRoomsUpdate} />
                </div>

                <div className="mainHome list-container" style={{ display: homeVisible ? 'none' : 'block' }}>
                    <HomeScreen rooms={rooms} />
                </div>
            </div>

            {/* 하단 버튼 */}
            <button className="mainHome toggle-button text-base bg-roomi" onClick={toggleView}>
                {homeVisible ? '목록 보기' : '지도 보기'}
            </button>
        </div>
    );
}
