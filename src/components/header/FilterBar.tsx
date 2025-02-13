import React, {useState, useRef, useEffect} from 'react';
import 'src/css/FilterBar.css'; // CSS 파일을 import

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faCalendarDay, faCalendarWeek, faCalendarAlt, faHospital, faLocationArrow, faPlane, faUniversity, faTrain } from '@fortawesome/free-solid-svg-icons';

const FilterBar: React.FC = () => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // 필터 버튼 렌더링 함수
    const renderFilterButton = (label: string, iconName: any) => (
        <div className="filterBar filterBar-item
        text-xs rounded-2xl px-4 py-2
        " key={label}>
            <FontAwesomeIcon className="text-roomi" icon={iconName} />
            <span className="
            ml-1 text-gray-500
            ">{label}</span>
        </div>
    );

    const [isLeftEnabled, setIsLeftEnabled] = useState(false);
    const [isRightEnabled, setIsRightEnabled] = useState(true);

    const scrollByAmount = (amount: number) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
        }
    };

    // 스크롤 상태 업데이트
    const updateScrollState = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

            setIsLeftEnabled(scrollLeft > 0); // 왼쪽으로 스크롤 가능 여부
            setIsRightEnabled(scrollLeft < scrollWidth - clientWidth); // 오른쪽으로 스크롤 가능 여부
        }
    };

    const touchStartX = useRef<number>(0);
    const scrollStartX = useRef<number>(0);
    // 터치 이벤트 핸들러
    const handleTouchStart = (event: React.TouchEvent) => {
        if (scrollRef.current) {
            touchStartX.current = event.touches[0].clientX;
            scrollStartX.current = scrollRef.current.scrollLeft;
        }
    };

    const handleTouchMove = (event: React.TouchEvent) => {
        if (scrollRef.current) {
            const touchX = event.touches[0].clientX;
            const moveDistance = touchStartX.current - touchX;
            scrollRef.current.scrollLeft = scrollStartX.current + moveDistance;
        }
    };

    // 마우스 휠 스크롤 (PC)
    const SCROLL_SPEED = 2; // 이동 속도 조절 (기본값보다 2배 빠르게)
    const handleWheelScroll = (event: WheelEvent) => {
        if (scrollRef.current) {
            event.preventDefault();
            scrollRef.current.scrollLeft += event.deltaY * SCROLL_SPEED; // 마우스 휠 이동량 반영
        }
    };

    // 스크롤 이벤트 핸들러 등록
    useEffect(() => {
        const container = scrollRef.current;
        if (container) {
            container.addEventListener("scroll", updateScrollState);
            container.addEventListener("wheel", handleWheelScroll);
        }

        // 클린업
        return () => {
            if (container) {
                container.removeEventListener("scroll", updateScrollState);
                container.removeEventListener("wheel", handleWheelScroll);
            }
        };
    }, []);

    // 필터 버튼 데이터
    const filters = [
        { label: '일', icon: faCalendarDay },
        { label: '주', icon: faCalendarWeek },
        { label: '월', icon: faCalendarAlt },  // 수정된 부분
        { label: '병원 근처', icon: faHospital },
        { label: '자동 탐색', icon: faLocationArrow },
        { label: '공항 근처', icon: faPlane },
        { label: '대학교 근처', icon: faUniversity },
        { label: '역세권1', icon: faTrain },
        { label: '역세권2', icon: faTrain },
        { label: '역세권3', icon: faTrain },
        { label: '역세권4', icon: faTrain },
        { label: '역세권5', icon: faTrain },
        { label: '역세권6', icon: faTrain },
    ];

    return (
        <div className="filterBar container">
            <div className={`${window.innerWidth < 786 && "hidden"}`}>
                {/* 왼쪽 화살표 버튼 */}
                <button
                    className={`
                    p-0 h-8 w-8 rounded-full text-gray-500
                    filterBar arrow-button left ${isLeftEnabled ? "" : "disabled"}`}
                    onClick={() => scrollByAmount(-300)}
                    disabled={!isLeftEnabled} // 버튼 비활성화 조건
                >
                    <FontAwesomeIcon icon={faChevronLeft}/>
                </button>
            </div>

            {/* 스크롤 가능한 필터바 */}
            <div
                ref={scrollRef}
                className="filterBar scroll-container
                mx-3 gap-2
                md:mx-[50px] md:gap-4"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
            >
                {filters.map((filter) => renderFilterButton(filter.label, filter.icon))}
                <div>
                </div>
            </div>

            <div className={`${window.innerWidth < 786 && "hidden"}`}>
                {/* 오른쪽 화살표 버튼 */}
                <button
                    className={`
                    p-0 h-8 w-8 rounded-full text-gray-500
                    filterBar arrow-button right ${isRightEnabled ? "" : "disabled"}`}
                    onClick={() => scrollByAmount(300)}
                    disabled={!isRightEnabled} // 버튼 비활성화 조건
                >
                    <FontAwesomeIcon icon={faChevronRight}/>
                </button>
            </div>
        </div>
    );
};

export default FilterBar;
