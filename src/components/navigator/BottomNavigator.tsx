import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from "react-i18next";
import {useHostTabNavigation} from "../stores/HostTabStore";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalendar, faComments, faFileLines, faHouseChimney} from "@fortawesome/free-solid-svg-icons";
import {useAuthStore} from "../stores/AuthStore";
import {useChatStore} from "../stores/ChatStore";
import {logout} from "../../api/api";
import {useHostModeStore} from "../stores/HostModeStore";

const tabIcons: Record<string, JSX.Element> = {
    my_room: <FontAwesomeIcon icon={faHouseChimney} />,
    contract_management: <FontAwesomeIcon icon={faFileLines} />,
    room_status: <FontAwesomeIcon icon={faCalendar} />,
    message: <FontAwesomeIcon icon={faComments} />,
};

const BottomNavigation: React.FC = () => {
    const { t } = useTranslation();
    const { activeTab, setActiveTab } = useHostTabNavigation();
    const tabs = ["my_room", "contract_management", "room_status", "message"] as const;
    const disconnect = useChatStore((state) => state.disconnect);
    const [userVisible, setUserVisible] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const {resetUserMode} = useHostModeStore();
    const {profileImg} = useAuthStore();

    const toggleDropdown = () => {
        setUserVisible((prev) => !prev);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setUserVisible(false);
        }
    };

    const handleSetHostMode = () => {
        resetUserMode();
        window.location.href = '/';
    };

    const handleLogout = async () => {
        try {
            const response = await logout();
            console.log(response);
            resetUserMode();// hostMode 초기화
            disconnect(); // 소켓 서버 닫기
            window.location.reload();
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    };

    useEffect(() => {
        if (userVisible) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [userVisible]);

    return (
        <div
            className={`fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50`}
        >
            {tabs.map((tab) => (
                <button
                    key={tab}
                    className={`flex flex-col items-center justify-center w-1/5 p-2 ${
                        activeTab === tab ? "text-roomi" : "text-gray-500"
                    }`}
                    onClick={() => {
                        console.log('탭 클릭됨:', tab); // 탭 명 찍기
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
            <div className="relative" ref={dropdownRef}>
                <button
                    className="w-8 h-8 md:w-10 md:h-10 flex_center bg-roomi-000 text-roomi rounded-full"
                    onClick={toggleDropdown}>
                    <img src={profileImg} alt="프로필사진" className="rounded-full md:w-10 md:h-10 w-8 h-8"/>
                </button>
                {userVisible && (
                    <div className="absolute -right-3 bottom-12 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-40 z-[2000] border">
                        <ul className="py-2 text-sm text-gray-700">
                            <li>
                                <a href="/host/myPage" className="block px-4 py-2 hover:bg-gray-100">{t('마이페이지')}</a>
                            </li>
                            <li>
                                <button onClick={handleSetHostMode}
                                        className="w-full text-start block px-4 py-2 hover:bg-gray-100">
                                    {t("게스트로 전환")}
                                </button>
                            </li>
                        </ul>
                        <div className="py-2">
                            <button onClick={handleLogout}
                                    className="w-full text-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                {t('로그아웃')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BottomNavigation;