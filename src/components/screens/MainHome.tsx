import React, {useCallback, useEffect, useRef, useState} from 'react';
import {RoomData} from "src/types/rooms"; // 스타일을 별도 CSS 파일로 관리
import 'src/css/MainHome.css';
import FilterBar from "src/components/header/FilterBar";
import HomeScreen from "src/components/screens/HomeScreen";
import NaverMap from "src/components/map/NaverMap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUp} from "@fortawesome/free-solid-svg-icons";

export default function MainHome() {
    const [homeVisible, setHomeVisible] = useState(false);
    const [rooms, setRooms] = useState<RoomData[]>([]);
    const [showTopButton, setShowTopButton] = useState(false);

    const handleRoomsUpdate = useCallback((newRooms: RoomData[]) => {
        console.log('Rooms updated in App:', newRooms);
        setRooms(newRooms);
    }, []);

    const toggleView = () => {
        setHomeVisible((prev) => !prev);
    };

    const [bottomValue, setBottomValue] = useState("30px"); // 기본값
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
                setShowTopButton(true);
                setBottomValue(window.innerWidth < 768 ? "131px" : "161px"); // 모바일인지 체크
            } else {
                setShowTopButton(false);
                setBottomValue("30px");
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="mainHome main-container">
            {/* 상단 필터바 */}
            <FilterBar/>

            <div className={`mainHome content-wrapper ${homeVisible ? 'show-map' : 'show-list'}`}>
                <div className="mainHome map-container">
                    <NaverMap onRoomsUpdate={handleRoomsUpdate}/>
                </div>

                <div className="mainHome list-container">
                    <HomeScreen rooms={rooms}/>
                </div>
            </div>

            {/* 하단 버튼 */}
            <button className="mainHome toggle-button text-base bg-roomi"
                    style={{ position: 'fixed', bottom: bottomValue }}
                    onClick={toggleView}>
                {homeVisible ? '목록 보기' : '지도 보기'}
            </button>
            {showTopButton && (
                <button onClick={scrollToTop}
                    className="flex_center
                    fixed bottom-[141px] right-[20px] md:bottom-[171px] md:right-[30px]
                    text-white text-sm md:text-base
                    bg-roomi rounded-full hover:ring-4 hover:ring-roomi-00
                    w-8 h-8 md:w-10 md:h-10"
                    style={{
                        cursor: "pointer",
                        zIndex: '1000',
                    }}>
                    <FontAwesomeIcon icon={faArrowUp} />
                </button>
            )}
        </div>
    );
}
