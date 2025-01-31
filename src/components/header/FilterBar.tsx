import React, {useState, useRef, useEffect} from 'react';
import '../../css/FilterBar.css'; // CSS 파일을 import

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faCalendarDay, faCalendarWeek, faCalendarAlt, faHospital, faLocationArrow, faPlane, faUniversity, faTrain } from '@fortawesome/free-solid-svg-icons';

const FilterBar: React.FC = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [currentOffset, setCurrentOffset] = useState(0);
    const scrollAmount = 300;

    // // 왼쪽 화살표 클릭: 왼쪽으로 스크롤
    // const scrollToLeft = () => {
    //     if (scrollRef.current) {
    //         const newOffset = Math.max(currentOffset - scrollAmount, 0);
    //         scrollRef.current.scrollLeft = newOffset;
    //         setCurrentOffset(newOffset);
    //     }
    // };
    //
    // // 오른쪽 화살표 클릭: 오른쪽으로 스크롤
    // const scrollToRight = () => {
    //     if (scrollRef.current) {
    //         const newOffset = currentOffset + scrollAmount;
    //         scrollRef.current.scrollLeft = newOffset;
    //         setCurrentOffset(newOffset);
    //     }
    // };
    //
    // 필터 버튼 렌더링 함수
    const renderFilterButton = (label: string, iconName: any) => (
        <div className="filterBar filterBar-item" key={label}>
            <FontAwesomeIcon icon={iconName} size="lg" />
            <span className="filterBar button-text">{label}</span>
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

    // 스크롤 이벤트 핸들러 등록
    useEffect(() => {
        const container = scrollRef.current;
        if (container) {
            container.addEventListener("scroll", updateScrollState);
        }

        // 클린업
        return () => {
            if (container) {
                container.removeEventListener("scroll", updateScrollState);
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
            {/* 왼쪽 화살표 버튼 */}
            {/*<button className="filterBar arrow-button left" onClick={scrollToLeft}>*/}
            {/*    <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 20, color: '#333' }} />*/}
            {/*</button>*/}
            {/* 왼쪽 화살표 버튼 */}
            <button
                className={`filterBar arrow-button left ${isLeftEnabled ? "" : "disabled"}`}
                onClick={() => scrollByAmount(-300)}
                disabled={!isLeftEnabled} // 버튼 비활성화 조건
            >
                {"<"}
            </button>

            {/* 스크롤 가능한 필터바 */}
            <div
                ref={scrollRef}
                className="filterBar scroll-container"
                onScroll={(event) => setCurrentOffset(event.currentTarget.scrollLeft)}
            >
                {filters.map((filter) => renderFilterButton(filter.label, filter.icon))}
                <div>
                </div>
            </div>

            {/* 오른쪽 화살표 버튼 */}
            {/*<button className="filterBar arrow-button right" onClick={scrollToRight}>*/}
            {/*    <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 20, color: '#333' }} />*/}
            {/*</button>*/}
            {/* 오른쪽 화살표 버튼 */}
            <button
                className={`filterBar arrow-button right ${isRightEnabled ? "" : "disabled"}`}
                onClick={() => scrollByAmount(300)}
                disabled={!isRightEnabled} // 버튼 비활성화 조건
            >
                {">"}
            </button>
        </div>
    );
};

export default FilterBar;
