import React, { useCallback, useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from "lucide-react";
import RoomAccommodationCard from "../util/RoomAccommodationCard";
import { RoomData } from "../../types/rooms";
import i18n from "../../i18n";

interface RoomScrollListProps {
    rooms: RoomData[];
}

const RoomScrollList: React.FC<RoomScrollListProps> = ({ rooms }) => {
    // 스크롤 관련 상태와 ref
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const SCROLL_SPEED = 0.8;

    // 스크롤 상태 체크 함수
    const checkScrollButtons = useCallback(() => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    }, []);

    // 스크롤 함수
    const scrollLeft = useCallback(() => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * SCROLL_SPEED;
            scrollContainerRef.current.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        }
    }, []);

    const scrollRight = useCallback(() => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * SCROLL_SPEED;
            scrollContainerRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    }, []);

    // 마우스 휠 이벤트 핸들러
    const handleWheel = useCallback((e: WheelEvent) => {
        if (scrollContainerRef.current) {
            e.preventDefault();
            const scrollSPEED =  scrollContainerRef.current.clientWidth * SCROLL_SPEED;
            const scrollAmount = e.deltaY > 0 ? scrollSPEED : -scrollSPEED;
            scrollContainerRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    }, []);

    // 스크롤 이벤트 리스너
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollButtons);
            // container.addEventListener('wheel', handleWheel, { passive: false });
            checkScrollButtons(); // 초기 상태 체크

            return () => {
                container.removeEventListener('scroll', checkScrollButtons);
                // container.removeEventListener('wheel', handleWheel);
            };
        }
    }, [checkScrollButtons, rooms.length]);
    // }, [checkScrollButtons, handleWheel, rooms.length]);

    const handleCardClick = (roomId: number) => {
        const currentLocale = i18n.language; // 현재 언어 감지
        window.open(`/detail/${roomId}/${currentLocale}`, '_blank');
    };

    return (
        <div className="relative">
            {/* 왼쪽 스크롤 버튼 */}
            {canScrollLeft && (
                <button
                    onClick={scrollLeft}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors z-[999]"
                    aria-label="이전 방 목록"
                >
                    <ChevronLeft size={20} className="text-gray-600" />
                </button>
            )}

            {/* 오른쪽 스크롤 버튼 */}
            {canScrollRight && (
                <button
                    onClick={scrollRight}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors z-[999]"
                    aria-label="다음 방 목록"
                >
                    <ChevronRight size={20} className="text-gray-600" />
                </button>
            )}

            {/* 스크롤 가능한 컨테이너 */}
            <div
                ref={scrollContainerRef}
                className="overflow-x-auto h-fit scrollbar-none scrollbar-hidden p-4"
            >
                {/* 2줄 그리드 */}
                <div
                    className="grid grid-rows-1 gap-4 w-max"
                    style={{
                        gridTemplateColumns: `repeat(${Math.ceil(rooms.length)}, 280px)`
                    }}
                >
                    {rooms.map((item) => (
                        <RoomAccommodationCard
                            key={item.id}
                            item={item}
                            onClick={() => handleCardClick(item.id)} // id 전달
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RoomScrollList;