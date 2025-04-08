import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {useHostTabNavigation} from "../stores/HostTabStore";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalendar, faComments, faDollarSign, faFileLines, faHouseChimney} from "@fortawesome/free-solid-svg-icons";

const tabIcons: Record<string, JSX.Element> = {
    my_room: <FontAwesomeIcon icon={faHouseChimney} />,
    contract_management: <FontAwesomeIcon icon={faFileLines} />,
    room_status: <FontAwesomeIcon icon={faCalendar} />,
    message: <FontAwesomeIcon icon={faComments} />,
    settlement: <FontAwesomeIcon icon={faDollarSign} />,
};

const BottomNavigation: React.FC = () => {
    const { t } = useTranslation();
    const { activeTab, setActiveTab } = useHostTabNavigation();
    const tabs = ["my_room", "contract_management", "room_status", "message", "settlement"] as const;
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // 스크롤 방향에 따라 표시 여부 결정
            // 아래로 스크롤 시 숨기기 (50px 이상 스크롤된 경우)
            if (currentScrollY > lastScrollY && isVisible && currentScrollY > 50) {
                setIsVisible(false);
            }
            // 위로 스크롤 시 표시하기
            else if (currentScrollY < lastScrollY && !isVisible) {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY, isVisible]);

    return (
        <>
            <div
                className={`fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50 transition-transform duration-300 ${
                    isVisible ? 'transform translate-y-0' : 'transform translate-y-full'
                }`}
            >
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`flex flex-col items-center justify-center w-1/5 p-2 ${
                            activeTab === tab ? "text-roomi" : "text-gray-500"
                        }`}
                        onClick={() => {
                            setActiveTab(tab);
                        }}
                        type="button"
                        role="tab"
                        aria-controls={tab}
                        aria-selected={activeTab === tab}
                    >
                        <div className="text-xl mb-1">{tabIcons[tab]}</div>
                        <span className="text-xs">{t(tab)}</span>
                    </button>
                ))}
            </div>
            {/* 하단 네비게이션 높이만큼 패딩 추가 */}
            <div className={`h-16 ${isVisible ? 'block' : 'hidden'}`}></div>
        </>
    );
};

export default BottomNavigation;